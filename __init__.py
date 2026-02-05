"""
PromptFlow - Modular prompt engineering tool for ComfyUI
Author: Maarten Harms
Ko-fi: https://ko-fi.com/maartenharms
"""

import os
import json
import re
from pathlib import Path
from aiohttp import web
from server import PromptServer
import folder_paths

# Import nodes
from .nodes.promptflow_core import PromptFlowCore
from .nodes.promptflow_variations import PromptFlowVariations

# Node mappings for ComfyUI
NODE_CLASS_MAPPINGS = {
    "PromptFlowCore": PromptFlowCore,
    "PromptFlowVariations": PromptFlowVariations,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptFlowCore": "PromptFlow",
    "PromptFlowVariations": "PromptFlow Variations",
}

# Web directory for frontend
WEB_DIRECTORY = "./web/comfyui"

# Get the directory where this file is located
EXTENSION_DIR = os.path.dirname(os.path.realpath(__file__))
PRESETS_DIR = os.path.join(EXTENSION_DIR, "presets")

# Wildcard directories (PromptFlow local first, then shared ComfyUI location)
WILDCARDS_DIR_LOCAL = os.path.join(EXTENSION_DIR, "wildcards")
WILDCARDS_DIR_SHARED = os.path.join(folder_paths.base_path, "wildcards")


def load_builtin_presets():
    """Load all built-in presets from the presets directory"""
    presets = {"styles": [], "quality": [], "negatives": []}

    print(f"[PromptFlow] Loading presets from: {PRESETS_DIR}")

    for preset_type in presets.keys():
        preset_file = os.path.join(PRESETS_DIR, f"{preset_type}.json")
        print(f"[PromptFlow] Looking for: {preset_file}")
        if os.path.exists(preset_file):
            try:
                with open(preset_file, "r", encoding="utf-8") as f:
                    presets[preset_type] = json.load(f)
                    print(
                        f"[PromptFlow] Loaded {len(presets[preset_type])} {preset_type} presets"
                    )
            except Exception as e:
                print(f"[PromptFlow] Error loading {preset_type} presets: {e}")
        else:
            print(f"[PromptFlow] Preset file not found: {preset_file}")

    return presets


# ============================================================================
# WILDCARD SYSTEM
# ============================================================================


def ensure_wildcards_dir():
    """Ensure the local wildcards directory exists"""
    if not os.path.exists(WILDCARDS_DIR_LOCAL):
        os.makedirs(WILDCARDS_DIR_LOCAL)
        print(f"[PromptFlow] Created wildcards directory: {WILDCARDS_DIR_LOCAL}")
    return WILDCARDS_DIR_LOCAL


def get_wildcard_dirs():
    """Get list of wildcard directories that exist, in priority order"""
    dirs = []

    # 1. PromptFlow local wildcards (highest priority)
    if os.path.exists(WILDCARDS_DIR_LOCAL):
        dirs.append(("local", WILDCARDS_DIR_LOCAL))

    # 2. Shared ComfyUI wildcards
    if os.path.exists(WILDCARDS_DIR_SHARED):
        dirs.append(("shared", WILDCARDS_DIR_SHARED))

    # 3. Impact Pack wildcards
    impact_wildcards = os.path.join(
        folder_paths.base_path, "custom_nodes", "comfyui-impact-pack", "wildcards"
    )
    if os.path.exists(impact_wildcards):
        dirs.append(("impact-pack", impact_wildcards))

    # 4. ComfyUI-Impact-Subpack wildcards
    impact_subpack = os.path.join(
        folder_paths.base_path, "custom_nodes", "ComfyUI-Impact-Subpack", "wildcards"
    )
    if os.path.exists(impact_subpack):
        dirs.append(("impact-subpack", impact_subpack))

    # 5. Any other custom_nodes/*/wildcards directories
    custom_nodes_dir = os.path.join(folder_paths.base_path, "custom_nodes")
    if os.path.exists(custom_nodes_dir):
        for node_name in os.listdir(custom_nodes_dir):
            node_wildcards = os.path.join(custom_nodes_dir, node_name, "wildcards")
            # Skip already added directories
            if node_wildcards in [d[1] for d in dirs]:
                continue
            if os.path.isdir(node_wildcards):
                dirs.append((node_name, node_wildcards))

    return dirs


def list_wildcards():
    """
    List all available wildcards from both directories.
    Returns dict with wildcard names and their source location.
    Local wildcards take priority over shared ones with same name.
    """
    wildcards = {}

    # Process shared first, then local (so local overrides)
    for source, base_dir in reversed(get_wildcard_dirs()):
        if not os.path.exists(base_dir):
            continue

        for root, dirs, files in os.walk(base_dir):
            for file in files:
                if file.endswith(".txt"):
                    # Get relative path from base_dir
                    rel_path = os.path.relpath(os.path.join(root, file), base_dir)
                    # Convert to wildcard name: remove .txt, use forward slashes
                    wildcard_name = rel_path[:-4].replace(os.sep, "/")

                    wildcards[wildcard_name] = {
                        "name": wildcard_name,
                        "source": source,
                        "path": os.path.join(root, file),
                        "file": file,
                    }

    return wildcards


def get_wildcard_contents(wildcard_name):
    """
    Get the contents of a wildcard file.
    Returns list of options (one per line, empty lines and comments stripped).
    """
    wildcards = list_wildcards()

    if wildcard_name not in wildcards:
        return None

    filepath = wildcards[wildcard_name]["path"]

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            lines = f.readlines()

        # Process lines: strip whitespace, skip empty lines and comments
        options = []
        for line in lines:
            line = line.strip()
            if line and not line.startswith("#"):
                options.append(line)

        return options
    except Exception as e:
        print(f"[PromptFlow] Error reading wildcard {wildcard_name}: {e}")
        return None


def save_wildcard(wildcard_name, options, overwrite=False):
    """
    Save a wildcard file to the local wildcards directory.

    Args:
        wildcard_name: Name like "animals" or "styles/anime"
        options: List of options (one per line)
        overwrite: Whether to overwrite existing file

    Returns:
        dict with success status and path/error
    """
    # Validate name (only alphanumeric, underscores, hyphens, forward slashes)
    if not re.match(r"^[\w\-/]+$", wildcard_name):
        return {
            "success": False,
            "error": "Invalid wildcard name. Use only letters, numbers, underscores, hyphens, and forward slashes.",
        }

    # Ensure base directory exists
    ensure_wildcards_dir()

    # Build file path
    filepath = os.path.join(
        WILDCARDS_DIR_LOCAL, wildcard_name.replace("/", os.sep) + ".txt"
    )

    # Check if exists
    if os.path.exists(filepath) and not overwrite:
        return {
            "success": False,
            "error": f"Wildcard '{wildcard_name}' already exists. Set overwrite=true to replace.",
        }

    # Ensure parent directory exists
    parent_dir = os.path.dirname(filepath)
    if parent_dir and not os.path.exists(parent_dir):
        os.makedirs(parent_dir)

    try:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write("\n".join(options))

        print(f"[PromptFlow] Saved wildcard: {wildcard_name} ({len(options)} options)")
        return {"success": True, "path": filepath, "name": wildcard_name}
    except Exception as e:
        return {"success": False, "error": str(e)}


def delete_wildcard(wildcard_name):
    """
    Delete a wildcard file (only from local directory for safety).
    """
    # Only allow deleting from local directory
    filepath = os.path.join(
        WILDCARDS_DIR_LOCAL, wildcard_name.replace("/", os.sep) + ".txt"
    )

    if not os.path.exists(filepath):
        return {
            "success": False,
            "error": f"Wildcard '{wildcard_name}' not found in local directory",
        }

    try:
        os.remove(filepath)
        print(f"[PromptFlow] Deleted wildcard: {wildcard_name}")
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}


# API Routes
@PromptServer.instance.routes.get("/promptflow/presets")
async def get_presets(request):
    """Get all built-in presets"""
    try:
        presets = load_builtin_presets()
        return web.json_response(presets)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


@PromptServer.instance.routes.get("/promptflow/presets/{preset_type}")
async def get_preset_type(request):
    """Get presets for a specific type (styles, quality, negatives)"""
    try:
        preset_type = request.match_info["preset_type"]
        presets = load_builtin_presets()

        if preset_type not in presets:
            return web.json_response(
                {"error": f"Unknown preset type: {preset_type}"}, status=404
            )

        return web.json_response(presets[preset_type])
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


# ============================================================================
# WILDCARD API ROUTES
# ============================================================================


@PromptServer.instance.routes.get("/promptflow/wildcards")
async def api_list_wildcards(request):
    """List all available wildcards from both local and shared directories"""
    try:
        wildcards = list_wildcards()
        # Convert to list sorted by name
        result = sorted(wildcards.values(), key=lambda x: x["name"])
        return web.json_response(
            {
                "wildcards": result,
                "directories": {
                    "local": WILDCARDS_DIR_LOCAL,
                    "shared": WILDCARDS_DIR_SHARED,
                },
            }
        )
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


@PromptServer.instance.routes.get("/promptflow/wildcards/{wildcard_name:.*}")
async def api_get_wildcard(request):
    """Get contents of a specific wildcard file"""
    try:
        wildcard_name = request.match_info["wildcard_name"]
        # Handle slash placeholder from frontend
        wildcard_name = wildcard_name.replace("---SLASH---", "/")

        print(f"[PromptFlow] Getting wildcard: {wildcard_name}")

        # Get wildcard info
        wildcards = list_wildcards()
        if wildcard_name not in wildcards:
            print(f"[PromptFlow] Available wildcards: {list(wildcards.keys())}")
            return web.json_response(
                {"error": f"Wildcard '{wildcard_name}' not found"}, status=404
            )

        options = get_wildcard_contents(wildcard_name)
        if options is None:
            return web.json_response(
                {"error": f"Could not read wildcard '{wildcard_name}'"}, status=500
            )

        print(f"[PromptFlow] Returning {len(options)} options for '{wildcard_name}'")
        return web.json_response(
            {
                "name": wildcard_name,
                "options": options,
                "count": len(options),
                "source": wildcards[wildcard_name]["source"],
            }
        )
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


@PromptServer.instance.routes.post("/promptflow/wildcards")
async def api_save_wildcard(request):
    """Save a new wildcard file"""
    try:
        data = await request.json()

        name = data.get("name", "").strip()
        options = data.get("options", [])
        overwrite = data.get("overwrite", False)

        if not name:
            return web.json_response({"error": "Wildcard name is required"}, status=400)

        if not options or not isinstance(options, list):
            return web.json_response(
                {"error": "Options must be a non-empty list"}, status=400
            )

        result = save_wildcard(name, options, overwrite)

        if result["success"]:
            return web.json_response(result)
        else:
            return web.json_response(result, status=400)

    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


@PromptServer.instance.routes.delete("/promptflow/wildcards/{wildcard_name:.*}")
async def api_delete_wildcard(request):
    """Delete a wildcard file (local only)"""
    try:
        wildcard_name = request.match_info["wildcard_name"]

        result = delete_wildcard(wildcard_name)

        if result["success"]:
            return web.json_response(result)
        else:
            return web.json_response(result, status=400)

    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


# Version info
__version__ = "1.0.0"
__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]

print(f"[PromptFlow] v{__version__} loaded successfully")
