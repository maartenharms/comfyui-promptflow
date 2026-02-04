"""
PromptFlow Core Node
Handles prompt building, wildcard processing, and output generation
"""

import json
import re
import random


class PromptFlowCore:
    """
    Main PromptFlow node for modular prompt engineering.

    Supports:
    - Simple mode (3 fields) and Extended mode (10 fields)
    - Wildcard processing {a|b|c}
    - Built-in presets for Style, Quality, Negative
    - LoRA Manager trigger words integration
    """

    NAME = "PromptFlow"
    CATEGORY = "PromptFlow"
    FUNCTION = "process"
    OUTPUT_NODE = False

    # Simple mode fields
    SIMPLE_FIELDS = ["main_prompt", "style", "quality"]

    # Extended mode fields (ordered by prompt importance)
    EXTENDED_FIELDS = [
        "subject",
        "character",
        "outfit",
        "pose",
        "location",
        "style",
        "camera",
        "lighting",
        "quality",
        "custom",
    ]

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "widget_data": (
                    "STRING",
                    {
                        "default": "{}",
                        "multiline": True,
                        "dynamicPrompts": False,
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
                        "tooltip": "Seed for deterministic wildcard selection",
                    },
                ),
                "trigger_words": (
                    "STRING",
                    {
                        "default": "",
                        "forceInput": True,
                        "tooltip": "Trigger words from LoRA Manager (auto-prepended to prompt)",
                    },
                ),
                "input_prompt": (
                    "STRING",
                    {
                        "default": "",
                        "multiline": True,
                        "forceInput": True,
                        "tooltip": "Optional prompt to prepend to output",
                    },
                ),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
            },
        }

    RETURN_TYPES = ("STRING", "STRING", "STRING")
    RETURN_NAMES = ("positive", "negative", "prompt_data")

    def process(
        self, widget_data, seed=0, trigger_words="", input_prompt="", unique_id=None
    ):
        """
        Process the widget data and generate outputs.

        Args:
            widget_data: JSON string containing all field values and settings
            seed: Seed for deterministic wildcard selection
            trigger_words: Optional trigger words from LoRA Manager
            input_prompt: Optional prompt to prepend
            unique_id: ComfyUI node unique ID

        Returns:
            Tuple of (positive, negative, prompt_data)
        """
        # Parse widget data
        try:
            data = json.loads(widget_data) if widget_data else {}
        except json.JSONDecodeError:
            data = {}

        # Initialize random with seed for deterministic results
        rng = random.Random(seed)

        # Get mode and fields
        mode = data.get("mode", "simple")
        fields = self.SIMPLE_FIELDS if mode == "simple" else self.EXTENDED_FIELDS

        # Get category order (for extended mode with drag-reorder)
        category_order = data.get("categoryOrder", fields)

        # Process each field
        prompt_parts = []
        categories = data.get("categories", {})

        for field in category_order:
            if field not in categories:
                continue

            field_data = categories[field]
            value = field_data.get("value", "").strip()
            field_mode = field_data.get("mode", "fixed")

            if not value:
                continue

            # Process wildcards based on field mode
            processed = self._process_wildcards(value, field_mode, rng, seed)

            if processed:
                prompt_parts.append(processed)

        # Build positive prompt
        positive_parts = []

        # 1. Trigger words first (from LoRA Manager)
        if trigger_words and trigger_words.strip():
            positive_parts.append(trigger_words.strip())

        # 2. Input prompt (if provided)
        if input_prompt and input_prompt.strip():
            positive_parts.append(input_prompt.strip())

        # 3. Main prompt content
        if prompt_parts:
            positive_parts.append(", ".join(prompt_parts))

        positive = ", ".join(positive_parts) if positive_parts else ""

        # Get negative prompt
        negative = data.get("negative", "").strip()
        negative = self._process_wildcards(negative, "fixed", rng, seed)

        # Prepare prompt_data output (full state for debugging/chaining)
        prompt_data = json.dumps(
            {
                "mode": mode,
                "categories": categories,
                "negative": negative,
                "seed": seed,
                "processed": {
                    "positive": positive,
                    "negative": negative,
                },
            },
            indent=2,
        )

        return (positive, negative, prompt_data)

    def _process_wildcards(self, text, mode, rng, seed):
        """
        Process {a|b|c} wildcard syntax in text.

        Args:
            text: Text containing wildcards
            mode: Processing mode (fixed, random, increment, decrement)
            rng: Random number generator instance
            seed: Seed value for increment/decrement modes

        Returns:
            Processed text with wildcards resolved
        """
        if not text:
            return text

        # Pattern to match {option1|option2|option3}
        pattern = r"\{([^}]+)\}"

        # Counter for increment/decrement within same text
        wildcard_index = [0]

        def replace_wildcard(match):
            options_str = match.group(1)
            options = [opt.strip() for opt in options_str.split("|")]

            if not options:
                return ""

            if mode == "random":
                return rng.choice(options)
            elif mode == "increment":
                # Use seed + wildcard index to determine selection
                idx = (seed + wildcard_index[0]) % len(options)
                wildcard_index[0] += 1
                return options[idx]
            elif mode == "decrement":
                # Reverse direction
                idx = (-(seed + wildcard_index[0]) - 1) % len(options)
                wildcard_index[0] += 1
                return options[idx]
            else:  # fixed - use first option
                return options[0]

        return re.sub(pattern, replace_wildcard, text)

    @classmethod
    def IS_CHANGED(
        cls, widget_data, seed=0, trigger_words="", input_prompt="", unique_id=None
    ):
        """
        Tell ComfyUI when to re-execute the node.
        For random mode, always re-execute. Otherwise, check inputs.
        """
        try:
            data = json.loads(widget_data) if widget_data else {}
            categories = data.get("categories", {})

            # Check if any field is in random mode
            for field_data in categories.values():
                if field_data.get("mode") == "random":
                    # Return unique value to force re-execution
                    return float("nan")

            # Return hash of inputs for caching
            return hash((widget_data, seed, trigger_words, input_prompt))
        except:
            return float("nan")
