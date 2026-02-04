# PromptFlow

**Modular prompt engineering tool for ComfyUI**

A "Mern" style extension by [Maarten Harms](https://github.com/maartenharms)

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20Me-ff5f5f?logo=ko-fi)](https://ko-fi.com/maartenharms)

---

## Features

### Two Modes

**Simple Mode** - 3 focused fields for quick prompting:
- Main Prompt - Your core scene description
- Style - Art style, medium, aesthetic
- Quality - Quality boosters

**Extended Mode** - 10 granular fields for power users:
- Subject, Character, Outfit, Pose, Location
- Style, Camera, Lighting, Quality, Custom
- Drag-and-drop reordering to customize field priority

### Wildcard System

Use `{option1|option2|option3}` syntax for variations:
```
a {woman|man} standing in a {forest|beach|city}
```

**Wildcard Modes** (per field):
- **Fixed** - Always uses first option
- **Random** - Random selection each generation
- **Increment** - Cycles through options based on seed
- **Decrement** - Reverse cycle through options

### Variations Panel

- See all possible prompt combinations from your wildcards
- Shows total variation count (e.g., "16 variations from 2 wildcards")
- Copy individual variations or all at once
- Seed hints show which seeds produce which variations

### Auto-Categorize (Extended Mode)

Paste any prompt and auto-distribute tags to appropriate categories:
- 200+ keyword database covering all categories
- Live preview shows categorization before applying
- Choose to replace or append to existing content

### Built-in Presets

Ships with ready-to-use presets:
- **10 Style Presets**: Photorealistic, Cinematic, Anime, Oil Painting, etc.
- **5 Quality Presets**: Standard, Ultra, Minimal, Photo Quality, Artistic
- **7 Negative Presets**: Standard, Anatomy, Artifacts, Full, NSFW Filter, etc.

### Custom Presets

- Save any field content as a custom preset
- Save entire prompt state as a global preset
- Export/Import presets as JSON for sharing
- Right-click any field for quick preset saving

### LoRA Manager Integration

- Accepts `trigger_words` input from LoRA Manager
- Trigger words automatically prepended to prompt
- Seamless workflow with LoRA-based generations

### Shared Theme System

Uses the same theme as [FlowPath](https://github.com/maartenharms/comfyui-flowpath). Change once, applies to both extensions.

Available themes: Modern Dark, Ocean, Forest, Sunset, Midnight, Light

---

## Installation

### ComfyUI Manager (Recommended)
1. Open ComfyUI Manager
2. Search for "PromptFlow"
3. Click Install
4. Restart ComfyUI

### Manual
```bash
cd ComfyUI/custom_nodes
git clone https://github.com/maartenharms/comfyui-promptflow.git
```

---

## Usage

### Basic Setup

1. Add "PromptFlow" node to your workflow
2. Fill in the prompt fields
3. Connect outputs:
   - `positive` -> CLIP Text Encode (positive)
   - `negative` -> CLIP Text Encode (negative)

### With LoRA Manager
```
[LoRA Manager] --trigger_words--> [PromptFlow] --positive--> [CLIP Encode]
```

### Using Wildcards

1. Enter wildcard syntax in any field: `{red|blue|green} dress`
2. Set field mode to Random, Increment, or Decrement
3. Connect a seed input for deterministic results
4. Check Variations panel to see all combinations

### Auto-Categorizing Prompts

1. Switch to Extended mode
2. Click "Auto-Sort" button
3. Paste your prompt
4. Review the preview
5. Click Apply

---

## Node Inputs/Outputs

### Inputs

| Input | Type | Description |
|-------|------|-------------|
| widget_data | STRING | Hidden, stores UI state |
| seed | INT | For deterministic wildcard selection |
| trigger_words | STRING | From LoRA Manager (optional) |
| input_prompt | STRING | Prepend to output (optional) |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| positive | STRING | Combined positive prompt |
| negative | STRING | Negative prompt |
| prompt_data | STRING | JSON debug data |

---

## Keyboard Shortcuts

- **Enter** in preset name dialog: Save preset
- **Escape**: Close any modal/dropdown
- **Right-click** on any field: Context menu (Copy, Paste, Save as Preset, Clear)

---

## Tips

1. **Quality at the end**: Place quality boosters after subject/style for best results
2. **Use presets**: Built-in presets are optimized for common use cases
3. **Variations for batch**: Use increment mode with batch count matching variation count
4. **Theme sync**: Set theme in either PromptFlow or FlowPath - both will match

---

## Related Extensions

- [FlowPath](https://github.com/maartenharms/comfyui-flowpath) - Smart output path organization

---

## Support

If you find this useful, consider supporting development:

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/maartenharms)

---

## License

MIT License

---

## Changelog

### v1.1.0
- Added batch variations panel
- Added auto-categorize feature with 200+ keyword database
- Added drag-drop reordering for extended mode
- Added right-click context menu
- Added preset export/import functionality
- Added toast notifications for user feedback
- Improved error handling throughout

### v1.0.0
- Initial release
- Simple and Extended modes
- Wildcard processing with 4 modes
- Built-in presets for Style, Quality, Negative
- Custom preset saving
- LoRA Manager integration
- Shared theme system with FlowPath
