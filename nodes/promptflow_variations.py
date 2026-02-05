"""
PromptFlow Variations Node
Displays wildcard variations and enables batch generation
"""

import json
import re


class PromptFlowVariations:
    """
    PromptFlow Variations node for previewing wildcard combinations
    and batch queueing.

    Takes a prompt with wildcards and shows all possible variations.
    Can be used with any text input, not just PromptFlow.
    """

    NAME = "PromptFlow Variations"
    CATEGORY = "PromptFlow"
    FUNCTION = "process"
    OUTPUT_NODE = False

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "prompt": (
                    "STRING",
                    {
                        "default": "",
                        "multiline": True,
                        "forceInput": True,
                        "tooltip": "Prompt with wildcards to analyze",
                    },
                ),
            },
            "optional": {
                "seed": (
                    "INT",
                    {
                        "default": 0,
                        "min": 0,
                        "max": 0xFFFFFFFFFFFFFFFF,
                        "tooltip": "Starting seed for batch generation",
                    },
                ),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "widget_data": (
                    "STRING",
                    {
                        "default": "{}",
                    },
                ),
            },
        }

    RETURN_TYPES = ("STRING", "INT", "STRING")
    RETURN_NAMES = ("prompt", "variation_count", "variations_json")

    def process(self, prompt, seed=0, unique_id=None, widget_data="{}"):
        """
        Process the prompt and extract wildcard information.

        Args:
            prompt: Text containing wildcards
            seed: Starting seed for batch generation
            unique_id: ComfyUI node unique ID
            widget_data: Internal widget state

        Returns:
            Tuple of (prompt, variation_count, variations_json)
        """
        # Extract wildcards
        wildcards = self._extract_wildcards(prompt)

        # Calculate total variations
        variation_count = 1
        for wildcard in wildcards:
            if wildcard.get("options"):
                variation_count *= len(wildcard["options"])

        # Build variations info for the widget
        variations_info = {
            "wildcards": wildcards,
            "total_variations": variation_count,
            "seed": seed,
        }

        return (prompt, variation_count, json.dumps(variations_info, indent=2))

    def _extract_wildcards(self, text):
        """
        Extract wildcards from text.

        Returns list of wildcard objects with their options.
        """
        if not text:
            return []

        wildcards = []

        # Pattern for inline wildcards: {option1|option2|option3}
        inline_pattern = r"\{([^}]+)\}"
        for match in re.finditer(inline_pattern, text):
            options = [opt.strip() for opt in match.group(1).split("|")]
            if len(options) > 1:
                wildcards.append(
                    {
                        "type": "inline",
                        "full": match.group(0),
                        "options": options,
                    }
                )

        # Pattern for file-based wildcards: __name__
        file_pattern = r"__([a-zA-Z0-9_\-/]+)__"
        for match in re.finditer(file_pattern, text):
            wildcards.append(
                {
                    "type": "file",
                    "full": match.group(0),
                    "name": match.group(1),
                    "options": None,  # Loaded by frontend
                }
            )

        return wildcards

    @classmethod
    def IS_CHANGED(cls, prompt, seed=0, unique_id=None, widget_data="{}"):
        """Check if node needs re-execution."""
        return hash((prompt, seed))
