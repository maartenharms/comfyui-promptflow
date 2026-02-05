# 📝 PromptFlow
### Modular Prompt Engineering for ComfyUI

[![GitHub license](https://img.shields.io/github/license/maartenharms/comfyui-promptflow)](https://github.com/maartenharms/comfyui-promptflow/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/maartenharms/comfyui-promptflow)](https://github.com/maartenharms/comfyui-promptflow/stargazers)
[![GitHub release](https://img.shields.io/github/v/release/maartenharms/comfyui-promptflow)](https://github.com/maartenharms/comfyui-promptflow/releases)

[Features](#-key-features) | [Installation](#-quick-start) | [Wildcards](#-wildcard-system) | [Variations](#-variations-node) | [Examples](examples/) | [Support](#-support-development)

---

### See It In Action

**Simple Mode + Presets + Auto-Sort** - Quick prompting with built-in presets

![PromptFlow Demo](assets/demo-workflow.gif)

**Variations Preview** - See all wildcard combinations before generating

![PromptFlow Variations](assets/demo-variations.gif)

**LoRA Manager + Saving Presets** - Trigger words integration and custom presets

![PromptFlow LoRA](assets/demo-lora-presets.gif)

---

**PromptFlow** is a **free and open source** ComfyUI custom node that organizes your prompt workflow. Build structured prompts with wildcards, presets, and intelligent auto-sorting!

- 📝 **Two Modes** - Simple (3 fields) or Extended (11 fields) for any workflow
- 🎲 **Wildcards** - `{option1|option2|option3}` syntax with 4 selection modes
- 📁 **File Wildcards** - `__folder/filename__` loads from ComfyUI/wildcards/
- 🔀 **Auto-Sort** - Paste any prompt, auto-distribute to categories
- 🎯 **Variations Node** - Preview all combinations before generating
- 💾 **Presets** - Built-in + custom presets with export/import
- 🎨 **7 Themes** - Shared theme system with FlowPath
- 🔗 **LoRA Manager** - Trigger words integration

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 📝 **Simple Mode** | 3 focused fields: Main Prompt, Style, Quality |
| 📋 **Extended Mode** | 11 granular fields: Subject, Character, Expression, Outfit, Pose, Location, Style, Camera, Lighting, Quality, Custom |
| 🎲 **Wildcards** | `{a\|b\|c}` inline syntax + `__file__` wildcard files |
| 🔒 **Field Modes** | Fixed, Random, Increment, Decrement per field |
| 🎯 **Variations Node** | See all possible combinations with seed hints |
| 🔀 **Auto-Sort** | Paste prompts, auto-categorize with 200+ keywords |
| ↕️ **Drag & Drop** | Reorder extended mode fields |
| 💾 **Presets** | 22 built-in + unlimited custom presets |
| 📤 **Export/Import** | Share presets as JSON |
| 🔗 **LoRA Manager** | Auto-prepend trigger words |
| 🎨 **7 Themes** | Synced with FlowPath |
| ⌨️ **Shortcuts** | Ctrl+Z undo, right-click menus |

---

## 🚀 Quick Start

### Installation

**Method 1: ComfyUI Manager (Recommended)**
1. Open ComfyUI Manager
2. Search for "PromptFlow"
3. Click Install
4. Restart ComfyUI

**Method 2: Git Clone**
```bash
cd ComfyUI/custom_nodes
git clone https://github.com/maartenharms/comfyui-promptflow
```
Then restart ComfyUI.

### Basic Usage

1. **Add PromptFlow node** to your workflow
2. **Fill in prompt fields** - Or use Auto-Sort to paste existing prompts
3. **Connect outputs:**
   - `positive` → CLIP Text Encode (positive)
   - `negative` → CLIP Text Encode (negative)
4. **Generate!**

---

## 🎲 Wildcard System

### Inline Wildcards

Use `{option1|option2|option3}` in any field:

```
a {beautiful|elegant|stunning} {woman|lady} in a {forest|garden|meadow}
```

### File Wildcards

Use `__folder/filename__` to load from text files:

```
__characters/fantasy__ wearing __outfits/medieval__
```

Place `.txt` files in `ComfyUI/wildcards/` folder (one option per line).

### Field Modes

Each field can have its own mode:

| Mode | Behavior |
|------|----------|
| 🔒 **Fixed** | Always uses first option |
| 🎲 **Random** | Random selection (seed-based) |
| 📈 **Increment** | Cycles forward through options |
| 📉 **Decrement** | Cycles backward through options |

---

## 🎯 Variations Node

The **PromptFlow Variations** node shows all possible prompt combinations:

1. Connect `prompt_data` output → Variations node input
2. See total combinations (e.g., "24 variations from 3 wildcards")
3. Click rows to select specific variations
4. Shift+click for range selection
5. **Queue Selected** to generate only chosen variations

Perfect for batch generation with specific combinations!

---

## 🔀 Auto-Sort

Paste any prompt and auto-distribute to the right categories:

1. Click the **☰** menu → **Auto-Sort**
2. Paste your prompt
3. Preview shows categorization
4. Click **Apply**

Works in both Simple and Extended modes!

---

## 💾 Preset System

### Built-in Presets

- **10 Style Presets** - Photorealistic, Cinematic, Anime, Oil Painting, etc.
- **5 Quality Presets** - Standard, Ultra, Minimal, Photo, Artistic
- **7 Negative Presets** - Standard, Anatomy Fix, Full, NSFW Filter, etc.

### Custom Presets

- **Save** button on each field to save content
- **Load** button to apply presets
- Right-click fields for quick save
- **Global Presets** save entire prompt state

### Export/Import

Share presets via **☰ menu** → Export/Import Presets

---

## 🔗 LoRA Manager Integration

PromptFlow integrates seamlessly with LoRA Manager:

```
[LoRA Manager] --trigger_words--> [PromptFlow] --positive--> [CLIP Encode]
```

Trigger words are automatically prepended to your positive prompt.

---

## 📋 Node Reference

### PromptFlow (Main Node)

**Inputs:**
| Input | Type | Description |
|-------|------|-------------|
| seed | INT | For deterministic wildcard selection |
| trigger_words | STRING | From LoRA Manager (optional) |
| input_prompt | STRING | Prepend to output (optional) |

**Outputs:**
| Output | Type | Description |
|--------|------|-------------|
| positive | STRING | Combined positive prompt |
| negative | STRING | Negative prompt |
| prompt_data | STRING | For Variations node |

### PromptFlow Variations

**Inputs:**
| Input | Type | Description |
|-------|------|-------------|
| prompt_data | STRING | From PromptFlow's prompt_data output |

Shows all wildcard combinations with selection and batch queuing.

---

## 🎨 Themes

7 beautiful themes (shared with FlowPath):

- 🌊 **Ocean Blue** - Cool, calm ocean vibes
- 🌲 **Forest Green** - Natural, earthy tones
- 🎠 **Pink Pony Club** - Fun, vibrant pink
- 🧡 **Odie** - Warm orange energy
- 💜 **Umbrael's Umbrage** - Deep purple mystery (default)
- ⚪ **Plain Jane** - Clean, minimal gray
- 🦇 **The Dark Knight** - Sleek dark mode

Change theme in **ComfyUI Settings** → PromptFlow → Theme

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+Z** | Undo |
| **Ctrl+Y** | Redo |
| **Escape** | Close modal/dropdown |
| **Right-click** | Context menu (Copy, Paste, Save, Clear) |

---

## 📁 Example Workflows

Find example workflows in the [`examples/`](examples/) folder:

- **Simple Mode** - Basic 3-field workflow
- **Extended Mode + Wildcards** - Full featured with Variations
- **LoRA Manager Integration** - Trigger words workflow

---

## 🤝 Related Extensions

- [🌊 FlowPath](https://github.com/maartenharms/comfyui-flowpath) - Intelligent output path organization

Both extensions share the same theme system!

---

## ❤️ Support Development

PromptFlow is **free and open source**. If you find it useful, consider supporting:

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/maartenharms)

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 📝 Changelog

### v1.0.0 (Initial Release)
- Simple Mode (3 fields) and Extended Mode (11 fields)
- Expression field for facial expressions/emotions
- Wildcard system with 4 modes (Fixed, Random, Increment, Decrement)
- File wildcards (`__folder/filename__`)
- PromptFlow Variations node for previewing combinations
- Auto-Sort with 200+ keyword database
- Drag-and-drop field reordering (Extended mode)
- 22 built-in presets (Style, Quality, Negative)
- Custom preset saving with export/import
- LoRA Manager trigger words integration
- 7 themes (shared with FlowPath)
- Right-click context menus
- Undo/Redo support
- Per-field save/load buttons
