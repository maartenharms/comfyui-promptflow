# PromptFlow

**Modular prompt engineering tool for ComfyUI**

A "Mern" style extension by [Maarten Harms](https://github.com/maartenharms)

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20Me-ff5f5f?logo=ko-fi)](https://ko-fi.com/maartenharms)

---

## Features

### Simple Mode (4 Fields)
- **Main Prompt** - Your core scene description
- **Style** - Art style, medium, aesthetic
- **Quality** - Quality boosters
- **LoRAs** - LoRA syntax for LoRA Manager integration

### Extended Mode (10 Fields)
For power users who want granular control:
- Subject, Character, Outfit, Location, Pose
- Style, Lighting, Camera, Quality, Custom
- LoRAs

### Built-in Presets
Ships with ready-to-use presets:
- **Style Presets**: Photorealistic, Cinematic, Anime, Oil Painting, etc.
- **Quality Presets**: Standard, Ultra, Minimal
- **Negative Presets**: Standard, Anatomy, Artifacts, Full

### Wildcard Support
Use `{option1|option2|option3}` syntax for variations:
```
a {woman|man} standing in a {forest|beach|city}
```

### LoRA Manager Integration
- Accepts `trigger_words` input from LoRA Manager
- Outputs `lora_syntax` for LoRA Text Loader
- Trigger words automatically prepended to prompt

### Shared Theme System
Uses the same theme as FlowPath. Change once, applies to both extensions.

---

## Installation

### ComfyUI Manager (Recommended)
1. Open ComfyUI Manager
2. Search for "PromptFlow"
3. Click Install

### Manual
```bash
cd ComfyUI/custom_nodes
git clone https://github.com/maartenharms/comfyui-promptflow.git
```

---

## Usage

1. Add "PromptFlow" node to your workflow
2. Fill in the prompt fields
3. Connect outputs:
   - `positive` → CLIP Text Encode (positive)
   - `negative` → CLIP Text Encode (negative)
   - `lora_syntax` → LoRA Text Loader (optional)

### With LoRA Manager
```
[LoRA Manager] ──trigger_words──> [PromptFlow] ──positive──> [CLIP Encode]
                                       │
                                       └──lora_syntax──> [LoRA Text Loader]
```

---

## Outputs

| Output | Description |
|--------|-------------|
| `positive` | Combined positive prompt |
| `negative` | Negative prompt |
| `lora_syntax` | LoRA syntax for loaders |
| `prompt_data` | JSON data for debugging |

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
