"""
PromptFlow - Modular prompt engineering tool for ComfyUI
Author: Maarten Harms
Ko-fi: https://ko-fi.com/maartenharms
"""

import os
import json
from aiohttp import web
from server import PromptServer

# Import nodes
from .nodes.promptflow_core import PromptFlowCore

# Node mappings for ComfyUI
NODE_CLASS_MAPPINGS = {
    "PromptFlowCore": PromptFlowCore,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptFlowCore": "PromptFlow",
}

# Web directory for frontend
WEB_DIRECTORY = "./web/comfyui"

# Get the directory where this file is located
EXTENSION_DIR = os.path.dirname(os.path.realpath(__file__))
PRESETS_DIR = os.path.join(EXTENSION_DIR, "presets")


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


# Version info
__version__ = "1.0.0"
__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]

print(f"[PromptFlow] v{__version__} loaded successfully")
