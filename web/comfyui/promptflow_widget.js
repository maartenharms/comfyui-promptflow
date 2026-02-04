/**
 * PromptFlow Widget for ComfyUI
 * Modular prompt engineering tool with presets, wildcards, and LoRA Manager integration
 * 
 * Author: Maarten Harms
 * Ko-fi: https://ko-fi.com/maartenharms
 */

import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";

// ============================================================================
// THEME SYSTEM (Matching FlowPath themes exactly)
// ============================================================================

// Theme definitions - exact match to FlowPath
const THEMES = {
    ocean: {
        name: "Ocean Blue",
        primary: "#4299e1",
        primaryLight: "rgba(66, 153, 225, 0.3)",
        primaryDark: "rgba(66, 153, 225, 0.6)",
        gradient: "linear-gradient(135deg, rgba(66, 153, 225, 0.2), rgba(20, 184, 166, 0.1))",
        accent: "#14b8a6",
        secondary: "#60a5fa",
        background: "linear-gradient(180deg, rgba(10, 30, 50, 0.5) 0%, rgba(20, 60, 80, 0.3) 100%)",
        text: "#e2e8f0",
        textMuted: "#94a3b8",
        textDim: "#64748b",
        success: "#14b8a6",
        warning: "#f59e0b",
        error: "#ef4444"
    },
    forest: {
        name: "Forest Green",
        primary: "#10b981",
        primaryLight: "rgba(16, 185, 129, 0.3)",
        primaryDark: "rgba(16, 185, 129, 0.6)",
        gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(217, 119, 6, 0.1))",
        accent: "#d97706",
        secondary: "#34d399",
        background: "linear-gradient(180deg, rgba(10, 30, 20, 0.5) 0%, rgba(30, 50, 30, 0.3) 100%)",
        text: "#e2e8f0",
        textMuted: "#94a3b8",
        textDim: "#64748b",
        success: "#10b981",
        warning: "#d97706",
        error: "#ef4444"
    },
    pinkpony: {
        name: "Pink Pony Club",
        primary: "#ec4899",
        primaryLight: "rgba(236, 72, 153, 0.3)",
        primaryDark: "rgba(236, 72, 153, 0.6)",
        gradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(255, 255, 255, 0.15))",
        accent: "#ffffff",
        secondary: "#f472b6",
        background: "linear-gradient(180deg, rgba(50, 20, 40, 0.5) 0%, rgba(80, 30, 60, 0.3) 100%)",
        text: "#fce7f3",
        textMuted: "#f9a8d4",
        textDim: "#db70a8",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444"
    },
    odie: {
        name: "Odie",
        primary: "#f97316",
        primaryLight: "rgba(249, 115, 22, 0.3)",
        primaryDark: "rgba(249, 115, 22, 0.6)",
        gradient: "linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(212, 165, 116, 0.15))",
        accent: "#d4a574",
        secondary: "#fb923c",
        background: "linear-gradient(180deg, rgba(40, 25, 15, 0.5) 0%, rgba(60, 40, 25, 0.3) 100%)",
        text: "#fef3c7",
        textMuted: "#d4a574",
        textDim: "#a67c52",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444"
    },
    umbrael: {
        name: "Umbrael's Umbrage",
        primary: "#9333ea",
        primaryLight: "rgba(147, 51, 234, 0.3)",
        primaryDark: "rgba(147, 51, 234, 0.6)",
        gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(251, 191, 36, 0.1))",
        accent: "#fbbf24",
        secondary: "#a855f7",
        background: "linear-gradient(180deg, rgba(17, 24, 39, 0.6) 0%, rgba(30, 20, 50, 0.4) 100%)",
        text: "#e2e8f0",
        textMuted: "#a78bfa",
        textDim: "#7c5dba",
        success: "#22c55e",
        warning: "#fbbf24",
        error: "#ef4444"
    },
    plainjane: {
        name: "Plain Jane",
        primary: "#6b7280",
        primaryLight: "rgba(107, 114, 128, 0.3)",
        primaryDark: "rgba(107, 114, 128, 0.6)",
        gradient: "linear-gradient(135deg, rgba(107, 114, 128, 0.15), rgba(156, 163, 175, 0.1))",
        accent: "#9ca3af",
        secondary: "#4b5563",
        background: "linear-gradient(180deg, rgba(30, 30, 35, 0.5) 0%, rgba(40, 40, 45, 0.3) 100%)",
        text: "#e2e8f0",
        textMuted: "#9ca3af",
        textDim: "#6b7280",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444"
    },
    batman: {
        name: "The Dark Knight",
        primary: "#1a1a1a",
        primaryLight: "rgba(26, 26, 26, 0.5)",
        primaryDark: "rgba(0, 0, 0, 0.8)",
        gradient: "linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(255, 204, 0, 0.05))",
        accent: "#ffcc00",
        secondary: "#333333",
        background: "linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(15, 15, 8, 0.6) 100%)",
        text: "#e2e8f0",
        textMuted: "#9ca3af",
        textDim: "#6b7280",
        success: "#22c55e",
        warning: "#ffcc00",
        error: "#ef4444"
    }
};

// Global settings
let globalSettings = {
    theme: "umbrael"
};

// Get active theme
function getActiveTheme() {
    return THEMES[globalSettings.theme] || THEMES.umbrael;
}

// Set theme and trigger re-render
function setTheme(themeKey) {
    if (THEMES[themeKey]) {
        globalSettings.theme = themeKey;
        // Re-render all PromptFlow nodes
        if (app.graph && app.graph._nodes) {
            const nodes = app.graph._nodes.filter(n => n.comfyClass === "PromptFlowCore");
            nodes.forEach(node => {
                if (node.promptFlowWidget) {
                    node.promptFlowWidget.theme = THEMES[themeKey];
                    node.promptFlowWidget.injectStyles();
                }
            });
        }
    }
}

// ============================================================================
// CONSTANTS
// ============================================================================

const NODE_TYPE = "PromptFlowCore";

const SIMPLE_FIELDS = [
    { id: "main_prompt", label: "Main Prompt", placeholder: "Describe your scene..." },
    { id: "style", label: "Style", placeholder: "Art style, medium..." },
    { id: "quality", label: "Quality", placeholder: "Quality boosters..." }
];

const EXTENDED_FIELDS = [
    { id: "subject", label: "Subject", placeholder: "Main subject/action..." },
    { id: "character", label: "Character", placeholder: "Physical features..." },
    { id: "outfit", label: "Outfit", placeholder: "Clothing, accessories..." },
    { id: "pose", label: "Pose", placeholder: "Body position, action..." },
    { id: "location", label: "Location", placeholder: "Setting, environment..." },
    { id: "style", label: "Style", placeholder: "Art style, medium..." },
    { id: "camera", label: "Camera", placeholder: "Shot type, lens..." },
    { id: "lighting", label: "Lighting", placeholder: "Light conditions..." },
    { id: "quality", label: "Quality", placeholder: "Quality boosters..." },
    { id: "custom", label: "Custom", placeholder: "Additional tags..." }
];

const FIELD_MODES = [
    { id: "fixed", label: "Fixed" },
    { id: "random", label: "Random" },
    { id: "increment", label: "Increment" },
    { id: "decrement", label: "Decrement" }
];

// ============================================================================
// AUTO-CATEGORIZE TAG DATABASE
// ============================================================================

const TAG_DATABASE = {
    // Subject/Character descriptors
    subject: [
        "woman", "man", "girl", "boy", "person", "people", "figure",
        "model", "portrait", "face", "body", "full body", "upper body",
        "1girl", "1boy", "2girls", "solo", "couple", "group",
        "animal", "cat", "dog", "dragon", "monster", "creature"
    ],
    
    // Character features
    character: [
        "blonde", "brunette", "redhead", "black hair", "white hair", "blue hair",
        "long hair", "short hair", "ponytail", "twintails", "braids", "curly hair",
        "blue eyes", "green eyes", "brown eyes", "red eyes", "heterochromia",
        "freckles", "makeup", "lipstick", "eyeshadow", "pale skin", "dark skin",
        "muscular", "slim", "athletic", "young", "mature", "elderly",
        "beautiful", "handsome", "cute", "pretty", "gorgeous"
    ],
    
    // Outfit/Clothing
    outfit: [
        "dress", "suit", "shirt", "pants", "skirt", "jeans", "shorts",
        "jacket", "coat", "hoodie", "sweater", "t-shirt", "blouse",
        "bikini", "swimsuit", "underwear", "lingerie", "armor", "uniform",
        "school uniform", "business suit", "casual", "formal", "elegant",
        "hat", "glasses", "sunglasses", "jewelry", "necklace", "earrings",
        "boots", "heels", "sneakers", "barefoot", "stockings", "gloves"
    ],
    
    // Pose/Action
    pose: [
        "standing", "sitting", "lying", "walking", "running", "jumping",
        "dancing", "fighting", "flying", "floating", "kneeling", "crouching",
        "arms crossed", "hands on hips", "looking at viewer", "looking away",
        "from behind", "from side", "from above", "from below",
        "dynamic pose", "action pose", "relaxed", "sleeping", "crying", "laughing",
        "holding", "reaching", "pointing", "waving"
    ],
    
    // Location/Background
    location: [
        "indoors", "outdoors", "studio", "background", "simple background",
        "city", "street", "building", "room", "bedroom", "kitchen", "bathroom",
        "forest", "beach", "mountain", "ocean", "river", "lake", "sky",
        "night", "day", "sunset", "sunrise", "dawn", "dusk",
        "park", "garden", "castle", "temple", "church", "school",
        "office", "cafe", "restaurant", "bar", "club", "mall",
        "space", "fantasy", "sci-fi", "cyberpunk", "medieval", "futuristic"
    ],
    
    // Style
    style: [
        "photorealistic", "realistic", "hyperrealistic", "photo", "photograph",
        "anime", "manga", "cartoon", "illustration", "digital art", "painting",
        "oil painting", "watercolor", "sketch", "drawing", "concept art",
        "3d", "3d render", "cgi", "unreal engine", "octane render",
        "cinematic", "dramatic", "moody", "vibrant", "colorful", "monochrome",
        "noir", "vintage", "retro", "modern", "minimalist", "abstract",
        "artstation", "deviantart", "trending", "award winning"
    ],
    
    // Camera/Shot
    camera: [
        "close-up", "closeup", "medium shot", "wide shot", "full shot",
        "portrait", "headshot", "bust shot", "cowboy shot", "full body shot",
        "low angle", "high angle", "dutch angle", "bird's eye", "worm's eye",
        "bokeh", "depth of field", "shallow dof", "wide angle", "telephoto",
        "fisheye", "macro", "panorama", "split screen",
        "35mm", "50mm", "85mm", "lens flare", "motion blur"
    ],
    
    // Lighting
    lighting: [
        "natural light", "sunlight", "moonlight", "ambient light",
        "studio lighting", "soft light", "hard light", "dramatic lighting",
        "rim light", "backlight", "side light", "front light",
        "golden hour", "blue hour", "overcast", "cloudy",
        "neon", "glow", "volumetric", "ray tracing", "global illumination",
        "shadows", "high contrast", "low key", "high key"
    ],
    
    // Quality boosters
    quality: [
        "masterpiece", "best quality", "high quality", "ultra detailed",
        "highly detailed", "intricate", "sharp", "crisp", "hd", "4k", "8k",
        "professional", "award-winning", "stunning", "breathtaking",
        "raw photo", "dslr", "high resolution", "uhd"
    ],
    
    // For simple mode mapping
    main_prompt: [] // Catch-all for unmatched terms
};

// Normalize text for matching
function normalizeTag(tag) {
    return tag.toLowerCase().trim().replace(/[_-]/g, " ");
}

// Auto-categorize a prompt string
function autoCategorize(promptText, mode = "extended") {
    const result = {
        subject: [],
        character: [],
        outfit: [],
        pose: [],
        location: [],
        style: [],
        camera: [],
        lighting: [],
        quality: [],
        custom: [],
        main_prompt: [],
        unmatched: []
    };
    
    // Split prompt by common delimiters
    const segments = promptText.split(/[,;]+/).map(s => s.trim()).filter(s => s);
    
    for (const segment of segments) {
        const normalizedSegment = normalizeTag(segment);
        let matched = false;
        
        // Check each category
        for (const [category, keywords] of Object.entries(TAG_DATABASE)) {
            if (category === "main_prompt") continue;
            
            // Check if segment contains any keyword from this category
            for (const keyword of keywords) {
                const normalizedKeyword = normalizeTag(keyword);
                if (normalizedSegment.includes(normalizedKeyword) || 
                    normalizedKeyword.includes(normalizedSegment)) {
                    result[category].push(segment);
                    matched = true;
                    break;
                }
            }
            if (matched) break;
        }
        
        // If no match, put in unmatched/custom
        if (!matched) {
            if (mode === "simple") {
                result.main_prompt.push(segment);
            } else {
                result.custom.push(segment);
            }
        }
    }
    
    return result;
}

// ============================================================================
// PRESET STORAGE
// ============================================================================

const PRESET_STORAGE = {
    global: "promptflow_global_presets",
    categories: "promptflow_category_presets"
};

let builtinPresets = null;

async function loadBuiltinPresets() {
    if (builtinPresets) return builtinPresets;
    
    try {
        console.log("[PromptFlow] Loading built-in presets...");
        const response = await api.fetchApi("/promptflow/presets");
        if (response.ok) {
            builtinPresets = await response.json();
            console.log("[PromptFlow] Loaded", Object.values(builtinPresets).flat().length, "built-in presets");
        } else {
            console.warn("[PromptFlow] Preset API returned", response.status);
            builtinPresets = { styles: [], quality: [], negatives: [] };
        }
    } catch (e) {
        console.warn("[PromptFlow] Could not load built-in presets (extension may still be initializing):", e.message);
        builtinPresets = { styles: [], quality: [], negatives: [] };
    }
    
    return builtinPresets;
}

// Error notification helper
function showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 13px;
        z-index: 10002;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ${type === "error" ? "background: #dc2626; color: white;" : ""}
        ${type === "success" ? "background: #16a34a; color: white;" : ""}
        ${type === "info" ? "background: #2563eb; color: white;" : ""}
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getCustomPresets(type) {
    try {
        const key = type === "global" ? PRESET_STORAGE.global : PRESET_STORAGE.categories;
        return JSON.parse(localStorage.getItem(key) || (type === "global" ? "[]" : "{}"));
    } catch (e) {
        return type === "global" ? [] : {};
    }
}

function saveCustomPreset(type, presetData) {
    console.log("[PromptFlow] Saving preset:", type, presetData);
    const key = type === "global" ? PRESET_STORAGE.global : PRESET_STORAGE.categories;
    const existing = getCustomPresets(type);
    
    if (type === "global") {
        existing.push(presetData);
        localStorage.setItem(key, JSON.stringify(existing));
        console.log("[PromptFlow] Saved global preset, total:", existing.length);
    } else {
        const category = presetData.category;
        if (!existing[category]) {
            existing[category] = [];
        }
        existing[category].push({ name: presetData.name, value: presetData.value });
        localStorage.setItem(key, JSON.stringify(existing));
        console.log("[PromptFlow] Saved category preset for:", category);
    }
}

// ============================================================================
// WIDGET DATA MANAGEMENT
// ============================================================================

function getDefaultWidgetData() {
    return {
        mode: "simple",
        categoryOrder: SIMPLE_FIELDS.map(f => f.id),
        expandedCategories: ["main_prompt", "style", "quality"],
        categories: {},
        negative: ""
    };
}

function parseWidgetData(widget) {
    try {
        const data = JSON.parse(widget.value || "{}");
        return { ...getDefaultWidgetData(), ...data };
    } catch (e) {
        return getDefaultWidgetData();
    }
}

function saveWidgetData(widget, data) {
    widget.value = JSON.stringify(data);
    widget.callback?.(widget.value);
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

function createStyles(theme) {
    return `
        .promptflow-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 12px;
            background: ${theme.background};
            border: 1px solid ${theme.primaryLight};
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 12px;
            color: ${theme.text};
            height: 100%;
            box-sizing: border-box;
            overflow-y: auto;
        }
        
        .promptflow-container::-webkit-scrollbar {
            width: 8px;
        }
        
        .promptflow-container::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 4px;
        }
        
        .promptflow-container::-webkit-scrollbar-thumb {
            background: ${theme.primaryLight};
            border-radius: 4px;
        }
        
        .promptflow-container::-webkit-scrollbar-thumb:hover {
            background: ${theme.primaryDark};
        }
        
        .promptflow-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 10px;
            background: ${theme.gradient};
            border: 1px solid ${theme.primaryLight};
            border-radius: 6px;
            margin-bottom: 4px;
        }
        
        .promptflow-title {
            font-size: 14px;
            font-weight: 600;
            color: ${theme.primary};
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        
        .promptflow-controls {
            display: flex;
            gap: 6px;
            align-items: center;
        }
        
        .promptflow-mode-select,
        .promptflow-preset-select {
            padding: 4px 8px;
            background: linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.3));
            border: 1px solid ${theme.primaryLight};
            border-radius: 4px;
            color: ${theme.text};
            font-size: 11px;
            cursor: pointer;
            outline: none;
            transition: all 0.2s;
        }
        
        .promptflow-mode-select:hover,
        .promptflow-preset-select:hover {
            border-color: ${theme.primary};
            box-shadow: 0 0 0 2px ${theme.primaryLight};
        }
        
        .promptflow-mode-select:focus,
        .promptflow-preset-select:focus {
            border-color: ${theme.primary};
            box-shadow: 0 0 0 2px ${theme.primaryLight};
        }
        
        .promptflow-save-btn {
            padding: 4px 10px;
            background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
            border: none;
            border-radius: 4px;
            color: #ffffff;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .promptflow-save-btn:hover {
            box-shadow: 0 4px 8px ${theme.primaryLight};
            transform: translateY(-1px);
        }
        
        .promptflow-fields {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        
        /* Simple Mode Field */
        .promptflow-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 8px;
            background: ${theme.gradient};
            border: 1px solid ${theme.primaryLight};
            border-radius: 6px;
        }
        
        .promptflow-field-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .promptflow-field-label {
            font-size: 11px;
            font-weight: 600;
            color: ${theme.primary};
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .promptflow-field-controls {
            display: flex;
            gap: 4px;
            align-items: center;
        }
        
        .promptflow-preset-btn {
            padding: 3px 8px;
            background: linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.2));
            border: 1px solid ${theme.primaryLight};
            border-radius: 4px;
            color: ${theme.textMuted};
            font-size: 10px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .promptflow-preset-btn:hover {
            border-color: ${theme.primary};
            color: ${theme.primary};
            box-shadow: 0 0 0 2px ${theme.primaryLight};
        }
        
        .promptflow-field-textarea {
            width: 100%;
            min-height: 50px;
            padding: 8px;
            background: linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.3));
            border: 1px solid ${theme.primaryLight};
            border-radius: 4px;
            color: ${theme.text};
            font-size: 12px;
            font-family: inherit;
            resize: vertical;
            outline: none;
            transition: all 0.2s;
        }
        
        .promptflow-field-textarea::placeholder {
            color: ${theme.textDim};
        }
        
        .promptflow-field-textarea:focus {
            border-color: ${theme.primary};
            box-shadow: 0 0 0 2px ${theme.primaryLight};
        }
        
        /* Extended Mode Accordion */
        .promptflow-accordion {
            background: ${theme.gradient};
            border: 1px solid ${theme.primaryLight};
            border-radius: 6px;
            overflow: hidden;
            transition: all 0.2s;
        }
        
        .promptflow-accordion:hover {
            border-color: ${theme.primary};
        }
        
        .promptflow-accordion-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 10px;
            background: transparent;
            cursor: pointer;
            user-select: none;
            transition: background 0.2s;
        }
        
        .promptflow-accordion-header:hover {
            background: ${theme.primaryLight};
        }
        
        .promptflow-accordion-left {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .promptflow-accordion-toggle {
            font-size: 10px;
            color: ${theme.primary};
            transition: transform 0.2s;
        }
        
        .promptflow-accordion-toggle.expanded {
            transform: rotate(90deg);
        }
        
        .promptflow-accordion-label {
            font-size: 12px;
            font-weight: 500;
            color: ${theme.text};
        }
        
        .promptflow-accordion-right {
            display: flex;
            gap: 4px;
            align-items: center;
        }
        
        .promptflow-mode-badge {
            padding: 2px 6px;
            background: ${theme.primaryLight};
            border-radius: 3px;
            font-size: 9px;
            color: ${theme.accent};
            text-transform: uppercase;
            font-weight: 600;
        }
        
        .promptflow-drag-handle {
            padding: 2px 6px;
            color: ${theme.textDim};
            cursor: grab;
            font-size: 14px;
            user-select: none;
        }
        
        .promptflow-drag-handle:hover {
            color: ${theme.primary};
        }
        
        .promptflow-drag-handle:active {
            cursor: grabbing;
        }
        
        .promptflow-accordion.dragging {
            opacity: 0.5;
            border-color: ${theme.primary};
            box-shadow: 0 0 8px ${theme.primaryLight};
        }
        
        .promptflow-accordion.drag-over {
            border-color: ${theme.accent};
            border-style: dashed;
            background: ${theme.primaryLight};
        }
        
        .promptflow-accordion-content {
            padding: 0 10px 10px 10px;
            display: none;
        }
        
        .promptflow-accordion-content.expanded {
            display: block;
        }
        
        /* Negative Section */
        .promptflow-negative {
            margin-top: 8px;
            padding: 8px;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 6px;
        }
        
        /* Preview Section */
        .promptflow-preview {
            margin-top: 8px;
            padding: 8px;
            background: ${theme.gradient};
            border: 1px solid ${theme.primaryLight};
            border-radius: 6px;
        }
        
        .promptflow-preview-label {
            font-size: 11px;
            font-weight: 600;
            color: ${theme.primary};
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        
        .promptflow-preview-text {
            padding: 8px;
            background: linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.2));
            border: 1px solid ${theme.primaryLight};
            border-radius: 4px;
            color: ${theme.text};
            font-size: 11px;
            line-height: 1.4;
            max-height: 80px;
            overflow-y: auto;
            word-break: break-word;
        }
        
        /* Variations Panel */
        .promptflow-variations {
            margin-top: 8px;
            padding: 8px;
            background: ${theme.gradient};
            border: 1px solid ${theme.primaryLight};
            border-radius: 6px;
        }
        
        .promptflow-variations-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            padding: 4px 0;
        }
        
        .promptflow-variations-header:hover {
            opacity: 0.8;
        }
        
        .promptflow-variations-title {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .promptflow-variations-label {
            font-size: 11px;
            font-weight: 600;
            color: ${theme.primary};
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .promptflow-variations-count {
            padding: 2px 8px;
            background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
            color: #ffffff;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 600;
        }
        
        .promptflow-variations-toggle {
            font-size: 10px;
            color: ${theme.primary};
            transition: transform 0.2s;
        }
        
        .promptflow-variations-toggle.expanded {
            transform: rotate(90deg);
        }
        
        .promptflow-variations-content {
            display: none;
            margin-top: 8px;
        }
        
        .promptflow-variations-content.expanded {
            display: block;
        }
        
        .promptflow-variations-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding: 6px 8px;
            background: linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.2));
            border: 1px solid ${theme.primaryLight};
            border-radius: 4px;
            font-size: 11px;
            color: ${theme.textMuted};
        }
        
        .promptflow-variations-actions {
            display: flex;
            gap: 4px;
        }
        
        .promptflow-variations-btn {
            padding: 3px 8px;
            background: transparent;
            border: 1px solid ${theme.primaryLight};
            border-radius: 3px;
            color: ${theme.textMuted};
            font-size: 10px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .promptflow-variations-btn:hover {
            background: ${theme.primaryLight};
            border-color: ${theme.primary};
            color: ${theme.primary};
        }
        
        .promptflow-variations-list {
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid ${theme.primaryLight};
            border-radius: 4px;
            background: linear-gradient(135deg, rgba(0,0,0,0.2), rgba(0,0,0,0.1));
        }
        
        .promptflow-variation-item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            padding: 6px 8px;
            border-bottom: 1px solid ${theme.primaryLight};
            font-size: 11px;
            color: ${theme.text};
            transition: background 0.2s;
        }
        
        .promptflow-variation-item:last-child {
            border-bottom: none;
        }
        
        .promptflow-variation-item:hover {
            background: ${theme.primaryLight};
        }
        
        .promptflow-variation-index {
            flex-shrink: 0;
            width: 24px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${theme.primaryLight};
            border-radius: 3px;
            font-size: 10px;
            color: ${theme.accent};
            font-weight: 600;
        }
        
        .promptflow-variation-text {
            flex: 1;
            word-break: break-word;
            line-height: 1.4;
        }
        
        .promptflow-variation-copy {
            flex-shrink: 0;
            padding: 2px 6px;
            background: transparent;
            border: none;
            color: ${theme.textDim};
            font-size: 12px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
        }
        
        .promptflow-variation-item:hover .promptflow-variation-copy {
            opacity: 1;
        }
        
        .promptflow-variation-copy:hover {
            color: ${theme.primary};
        }
        
        .promptflow-no-variations {
            padding: 12px;
            text-align: center;
            color: ${theme.textDim};
            font-size: 11px;
        }
        
        /* Auto-Sort Modal */
        .promptflow-autosort-textarea {
            width: 100%;
            min-height: 150px;
            padding: 10px;
            background: linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.3));
            border: 1px solid ${theme.primaryLight};
            border-radius: 4px;
            color: ${theme.text};
            font-size: 12px;
            font-family: inherit;
            resize: vertical;
            outline: none;
            margin-bottom: 12px;
        }
        
        .promptflow-autosort-textarea:focus {
            border-color: ${theme.primary};
            box-shadow: 0 0 0 2px ${theme.primaryLight};
        }
        
        .promptflow-autosort-textarea::placeholder {
            color: ${theme.textDim};
        }
        
        .promptflow-autosort-preview {
            margin-bottom: 12px;
            padding: 10px;
            background: ${theme.gradient};
            border: 1px solid ${theme.primaryLight};
            border-radius: 4px;
            max-height: 200px;
            overflow-y: auto;
        }
        
        .promptflow-autosort-category {
            margin-bottom: 8px;
        }
        
        .promptflow-autosort-category:last-child {
            margin-bottom: 0;
        }
        
        .promptflow-autosort-category-label {
            font-size: 10px;
            font-weight: 600;
            color: ${theme.accent};
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        
        .promptflow-autosort-category-tags {
            font-size: 11px;
            color: ${theme.text};
            line-height: 1.4;
        }
        
        .promptflow-autosort-empty {
            color: ${theme.textDim};
            font-style: italic;
        }
        
        /* Context Menu */
        .promptflow-context-menu {
            position: fixed;
            z-index: 10001;
            min-width: 150px;
            background: linear-gradient(180deg, rgba(30, 30, 40, 0.98), rgba(20, 20, 30, 0.98));
            border: 1px solid ${theme.primaryLight};
            border-radius: 6px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            padding: 4px 0;
            backdrop-filter: blur(10px);
        }
        
        .promptflow-context-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            font-size: 12px;
            color: ${theme.text};
            cursor: pointer;
            transition: all 0.15s;
        }
        
        .promptflow-context-item:hover {
            background: ${theme.primaryLight};
            color: ${theme.primary};
        }
        
        .promptflow-context-item.danger {
            color: ${theme.error};
        }
        
        .promptflow-context-item.danger:hover {
            background: rgba(239, 68, 68, 0.2);
        }
        
        .promptflow-context-divider {
            height: 1px;
            background: ${theme.primaryLight};
            margin: 4px 0;
        }
        
        .promptflow-context-item-icon {
            width: 16px;
            text-align: center;
            opacity: 0.7;
        }
        
        /* Notification animations */
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        /* Preset Dropdown */
        .promptflow-preset-dropdown {
            position: absolute;
            z-index: 1000;
            min-width: 180px;
            max-height: 250px;
            overflow-y: auto;
            background: linear-gradient(180deg, rgba(30, 30, 40, 0.98), rgba(20, 20, 30, 0.98));
            border: 1px solid ${theme.primaryLight};
            border-radius: 6px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
        }
        
        .promptflow-preset-item {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            font-size: 12px;
            color: ${theme.text};
            border-bottom: 1px solid ${theme.primaryLight};
            transition: all 0.2s;
        }
        
        .promptflow-preset-item:last-child {
            border-bottom: none;
        }
        
        .promptflow-preset-item:hover {
            background: ${theme.primaryLight};
        }
        
        .promptflow-preset-item-content {
            flex: 1;
            cursor: pointer;
            overflow: hidden;
        }
        
        .promptflow-preset-item-name {
            font-weight: 500;
        }
        
        .promptflow-preset-item-preview {
            font-size: 10px;
            color: ${theme.textMuted};
            margin-top: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .promptflow-preset-delete {
            padding: 2px 6px;
            margin-left: 8px;
            background: transparent;
            border: none;
            color: ${theme.textDim};
            font-size: 14px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s, color 0.2s;
        }
        
        .promptflow-preset-item:hover .promptflow-preset-delete {
            opacity: 1;
        }
        
        .promptflow-preset-delete:hover {
            color: ${theme.error};
        }
        
        .promptflow-preset-divider {
            padding: 6px 12px;
            font-size: 10px;
            color: ${theme.primary};
            background: ${theme.primaryLight};
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }
        
        /* Save Preset Modal */
        .promptflow-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(4px);
        }
        
        .promptflow-modal {
            background: linear-gradient(180deg, rgba(30, 30, 40, 0.98), rgba(20, 20, 30, 0.98));
            border: 1px solid ${theme.primaryLight};
            border-radius: 8px;
            padding: 20px;
            min-width: 300px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
        }
        
        .promptflow-modal-title {
            font-size: 14px;
            font-weight: 600;
            color: ${theme.primary};
            margin-bottom: 16px;
        }
        
        .promptflow-modal-input {
            width: 100%;
            padding: 8px 12px;
            background: linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.3));
            border: 1px solid ${theme.primaryLight};
            border-radius: 4px;
            color: ${theme.text};
            font-size: 12px;
            outline: none;
            margin-bottom: 16px;
            transition: all 0.2s;
        }
        
        .promptflow-modal-input:focus {
            border-color: ${theme.primary};
            box-shadow: 0 0 0 2px ${theme.primaryLight};
        }
        
        .promptflow-modal-buttons {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }
        
        .promptflow-modal-btn {
            padding: 6px 14px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .promptflow-modal-btn.cancel {
            background: transparent;
            border: 1px solid ${theme.primaryLight};
            color: ${theme.textMuted};
        }
        
        .promptflow-modal-btn.cancel:hover {
            background: ${theme.primaryLight};
            color: ${theme.text};
        }
        
        .promptflow-modal-btn.save {
            background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
            border: none;
            color: #ffffff;
            font-weight: 500;
        }
        
        .promptflow-modal-btn.save:hover {
            box-shadow: 0 4px 12px ${theme.primaryLight};
            transform: translateY(-1px);
        }
    `;
}

// ============================================================================
// MAIN WIDGET CLASS
// ============================================================================

class PromptFlowWidget {
    constructor(node, widget) {
        this.node = node;
        this.widget = widget;
        this.container = null;
        this.theme = getActiveTheme();
        this.data = parseWidgetData(widget);
        this.previewElement = null;
        
        // Load presets on init
        loadBuiltinPresets();
    }
    
    render() {
        // Create container
        this.container = document.createElement("div");
        this.container.className = "promptflow-container";
        
        // Inject styles
        this.injectStyles();
        
        // Build UI
        this.buildHeader();
        this.buildFields();
        this.buildNegativeField();
        this.buildPreview();
        this.buildVariationsPanel();
        
        return this.container;
    }
    
    injectStyles() {
        const styleId = "promptflow-styles";
        let styleEl = document.getElementById(styleId);
        
        if (!styleEl) {
            styleEl = document.createElement("style");
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }
        
        styleEl.textContent = createStyles(this.theme);
    }
    
    buildHeader() {
        const header = document.createElement("div");
        header.className = "promptflow-header";
        
        // Title
        const title = document.createElement("span");
        title.className = "promptflow-title";
        title.textContent = "PromptFlow";
        
        // Controls
        const controls = document.createElement("div");
        controls.className = "promptflow-controls";
        
        // Mode selector
        const modeSelect = document.createElement("select");
        modeSelect.className = "promptflow-mode-select";
        modeSelect.innerHTML = `
            <option value="simple" ${this.data.mode === "simple" ? "selected" : ""}>Simple</option>
            <option value="extended" ${this.data.mode === "extended" ? "selected" : ""}>Extended</option>
        `;
        modeSelect.addEventListener("change", (e) => {
            const newMode = e.target.value;
            const oldMode = this.data.mode;
            
            // Migrate data between modes
            this.migrateData(oldMode, newMode);
            
            this.data.mode = newMode;
            this.data.categoryOrder = (newMode === "simple" ? SIMPLE_FIELDS : EXTENDED_FIELDS).map(f => f.id);
            this.saveData();
            this.rebuildFields();
            this.updatePreview();
            
            // Toggle auto-sort button visibility
            if (this.autoSortBtn) {
                this.autoSortBtn.style.display = newMode === "extended" ? "block" : "none";
            }
        });
        
        // Global preset button (opens dropdown)
        const presetBtn = document.createElement("button");
        presetBtn.className = "promptflow-preset-btn";
        presetBtn.textContent = "Presets";
        presetBtn.style.padding = "4px 8px";
        presetBtn.addEventListener("click", (e) => {
            this.showGlobalPresets(e.target);
        });
        
        // Save button
        const saveBtn = document.createElement("button");
        saveBtn.className = "promptflow-save-btn";
        saveBtn.textContent = "Save";
        saveBtn.title = "Save current state as preset";
        saveBtn.addEventListener("click", () => this.showSavePresetModal());
        
        // Export button
        const exportBtn = document.createElement("button");
        exportBtn.className = "promptflow-preset-btn";
        exportBtn.textContent = "Export";
        exportBtn.style.padding = "4px 8px";
        exportBtn.title = "Export all custom presets to JSON file";
        exportBtn.addEventListener("click", () => this.exportPresets());
        
        // Import button
        const importBtn = document.createElement("button");
        importBtn.className = "promptflow-preset-btn";
        importBtn.textContent = "Import";
        importBtn.style.padding = "4px 8px";
        importBtn.title = "Import presets from JSON file";
        importBtn.addEventListener("click", () => this.importPresets());
        
        // Auto-Sort button (only for extended mode)
        const autoSortBtn = document.createElement("button");
        autoSortBtn.className = "promptflow-save-btn";
        autoSortBtn.textContent = "Auto-Sort";
        autoSortBtn.style.background = this.theme.success;
        autoSortBtn.title = "Paste a prompt and auto-distribute to categories";
        autoSortBtn.addEventListener("click", () => this.showAutoSortModal());
        this.autoSortBtn = autoSortBtn;
        
        // Show/hide based on mode
        autoSortBtn.style.display = this.data.mode === "extended" ? "block" : "none";
        
        // Settings/Theme button
        const settingsBtn = document.createElement("button");
        settingsBtn.className = "promptflow-preset-btn";
        settingsBtn.innerHTML = "&#9881;"; // Gear icon
        settingsBtn.style.padding = "4px 8px";
        settingsBtn.style.fontSize = "14px";
        settingsBtn.title = "Theme settings";
        settingsBtn.addEventListener("click", (e) => this.showThemeSelector(e.target));
        
        controls.appendChild(modeSelect);
        controls.appendChild(presetBtn);
        controls.appendChild(saveBtn);
        controls.appendChild(autoSortBtn);
        controls.appendChild(exportBtn);
        controls.appendChild(importBtn);
        controls.appendChild(settingsBtn);
        
        header.appendChild(title);
        header.appendChild(controls);
        this.container.appendChild(header);
    }
    
    buildFields() {
        this.fieldsContainer = document.createElement("div");
        this.fieldsContainer.className = "promptflow-fields";
        this.container.appendChild(this.fieldsContainer);
        
        this.rebuildFields();
    }
    
    rebuildFields() {
        this.fieldsContainer.innerHTML = "";
        
        if (this.data.mode === "simple") {
            // Simple mode: flat fields (fixed order)
            SIMPLE_FIELDS.forEach(field => {
                this.fieldsContainer.appendChild(this.createSimpleField(field));
            });
        } else {
            // Extended mode: accordions (custom order)
            // Use categoryOrder if it exists and has the right fields, otherwise use default
            let orderedIds = this.data.categoryOrder;
            const defaultIds = EXTENDED_FIELDS.map(f => f.id);
            
            // Validate order has all fields
            if (!orderedIds || orderedIds.length !== defaultIds.length || 
                !defaultIds.every(id => orderedIds.includes(id))) {
                orderedIds = defaultIds;
                this.data.categoryOrder = orderedIds;
            }
            
            // Build fields in custom order
            orderedIds.forEach(fieldId => {
                const field = EXTENDED_FIELDS.find(f => f.id === fieldId);
                if (field) {
                    this.fieldsContainer.appendChild(this.createAccordionField(field));
                }
            });
        }
    }
    
    createSimpleField(field) {
        const fieldEl = document.createElement("div");
        fieldEl.className = "promptflow-field";
        
        // Header
        const header = document.createElement("div");
        header.className = "promptflow-field-header";
        
        const label = document.createElement("span");
        label.className = "promptflow-field-label";
        label.textContent = field.label;
        
        const controls = document.createElement("div");
        controls.className = "promptflow-field-controls";
        
        // Preset button
        const presetBtn = document.createElement("button");
        presetBtn.className = "promptflow-preset-btn";
        presetBtn.textContent = "Presets";
        presetBtn.addEventListener("click", async (e) => {
            await this.showCategoryPresets(field.id, e.target);
        });
        
        controls.appendChild(presetBtn);
        header.appendChild(label);
        header.appendChild(controls);
        
        // Textarea
        const textarea = document.createElement("textarea");
        textarea.className = "promptflow-field-textarea";
        textarea.placeholder = field.placeholder;
        textarea.value = this.data.categories[field.id]?.value || "";
        textarea.addEventListener("input", (e) => {
            if (!this.data.categories[field.id]) {
                this.data.categories[field.id] = { value: "", mode: "fixed" };
            }
            this.data.categories[field.id].value = e.target.value;
            this.saveData();
            this.updatePreview();
        });
        textarea.addEventListener("contextmenu", (e) => this.showContextMenu(e, field.id, textarea));
        
        fieldEl.appendChild(header);
        fieldEl.appendChild(textarea);
        
        return fieldEl;
    }
    
    createAccordionField(field) {
        const accordion = document.createElement("div");
        accordion.className = "promptflow-accordion";
        accordion.dataset.fieldId = field.id;
        accordion.draggable = true;
        
        const isExpanded = this.data.expandedCategories?.includes(field.id) ?? false;
        const fieldData = this.data.categories[field.id] || { value: "", mode: "fixed" };
        
        // Drag events
        accordion.addEventListener("dragstart", (e) => {
            accordion.classList.add("dragging");
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", field.id);
            this.draggedFieldId = field.id;
        });
        
        accordion.addEventListener("dragend", () => {
            accordion.classList.remove("dragging");
            this.draggedFieldId = null;
            // Remove drag-over from all
            this.fieldsContainer.querySelectorAll(".drag-over").forEach(el => el.classList.remove("drag-over"));
        });
        
        accordion.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            if (this.draggedFieldId && this.draggedFieldId !== field.id) {
                accordion.classList.add("drag-over");
            }
        });
        
        accordion.addEventListener("dragleave", () => {
            accordion.classList.remove("drag-over");
        });
        
        accordion.addEventListener("drop", (e) => {
            e.preventDefault();
            accordion.classList.remove("drag-over");
            
            const draggedId = e.dataTransfer.getData("text/plain");
            if (draggedId && draggedId !== field.id) {
                this.reorderFields(draggedId, field.id);
            }
        });
        
        // Header
        const header = document.createElement("div");
        header.className = "promptflow-accordion-header";
        
        const left = document.createElement("div");
        left.className = "promptflow-accordion-left";
        
        const toggle = document.createElement("span");
        toggle.className = `promptflow-accordion-toggle ${isExpanded ? "expanded" : ""}`;
        toggle.textContent = ">";
        
        const label = document.createElement("span");
        label.className = "promptflow-accordion-label";
        label.textContent = field.label;
        
        left.appendChild(toggle);
        left.appendChild(label);
        
        const right = document.createElement("div");
        right.className = "promptflow-accordion-right";
        
        // Preset button
        const presetBtn = document.createElement("button");
        presetBtn.className = "promptflow-preset-btn";
        presetBtn.textContent = "Presets";
        presetBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            await this.showCategoryPresets(field.id, e.target);
        });
        
        // Mode badge
        const modeBadge = document.createElement("span");
        modeBadge.className = "promptflow-mode-badge";
        modeBadge.textContent = fieldData.mode || "fixed";
        modeBadge.addEventListener("click", (e) => {
            e.stopPropagation();
            this.cycleModeForField(field.id, modeBadge);
        });
        right.appendChild(modeBadge);
        
        // Drag handle
        const dragHandle = document.createElement("span");
        dragHandle.className = "promptflow-drag-handle";
        dragHandle.textContent = "⋮⋮";
        dragHandle.title = "Drag to reorder";
        
        right.appendChild(presetBtn);
        right.appendChild(dragHandle);
        
        header.appendChild(left);
        header.appendChild(right);
        
        // Content
        const content = document.createElement("div");
        content.className = `promptflow-accordion-content ${isExpanded ? "expanded" : ""}`;
        
        const textarea = document.createElement("textarea");
        textarea.className = "promptflow-field-textarea";
        textarea.placeholder = field.placeholder;
        textarea.value = fieldData.value || "";
        textarea.addEventListener("input", (e) => {
            if (!this.data.categories[field.id]) {
                this.data.categories[field.id] = { value: "", mode: "fixed" };
            }
            this.data.categories[field.id].value = e.target.value;
            this.saveData();
            this.updatePreview();
        });
        textarea.addEventListener("contextmenu", (e) => this.showContextMenu(e, field.id, textarea));
        
        content.appendChild(textarea);
        
        // Toggle handler
        header.addEventListener("click", () => {
            const isNowExpanded = !content.classList.contains("expanded");
            content.classList.toggle("expanded");
            toggle.classList.toggle("expanded");
            
            if (isNowExpanded) {
                if (!this.data.expandedCategories) {
                    this.data.expandedCategories = [];
                }
                if (!this.data.expandedCategories.includes(field.id)) {
                    this.data.expandedCategories.push(field.id);
                }
            } else {
                this.data.expandedCategories = this.data.expandedCategories?.filter(id => id !== field.id) || [];
            }
            this.saveData();
        });
        
        accordion.appendChild(header);
        accordion.appendChild(content);
        
        return accordion;
    }
    
    cycleModeForField(fieldId, badgeEl) {
        const modes = FIELD_MODES.map(m => m.id);
        if (!this.data.categories[fieldId]) {
            this.data.categories[fieldId] = { value: "", mode: "fixed" };
        }
        
        const currentMode = this.data.categories[fieldId].mode || "fixed";
        const currentIdx = modes.indexOf(currentMode);
        const nextIdx = (currentIdx + 1) % modes.length;
        
        this.data.categories[fieldId].mode = modes[nextIdx];
        badgeEl.textContent = modes[nextIdx];
        this.saveData();
    }
    
    buildNegativeField() {
        const negativeSection = document.createElement("div");
        negativeSection.className = "promptflow-negative";
        
        const header = document.createElement("div");
        header.className = "promptflow-field-header";
        
        const label = document.createElement("span");
        label.className = "promptflow-field-label";
        label.textContent = "Negative";
        
        const controls = document.createElement("div");
        controls.className = "promptflow-field-controls";
        
        const presetBtn = document.createElement("button");
        presetBtn.className = "promptflow-preset-btn";
        presetBtn.textContent = "Presets";
        presetBtn.addEventListener("click", async (e) => {
            await this.showCategoryPresets("negative", e.target);
        });
        
        controls.appendChild(presetBtn);
        header.appendChild(label);
        header.appendChild(controls);
        
        const textarea = document.createElement("textarea");
        textarea.className = "promptflow-field-textarea";
        textarea.placeholder = "Negative prompt...";
        textarea.value = this.data.negative || "";
        textarea.addEventListener("input", (e) => {
            this.data.negative = e.target.value;
            this.saveData();
        });
        textarea.addEventListener("contextmenu", (e) => this.showContextMenu(e, "negative", textarea));
        
        negativeSection.appendChild(header);
        negativeSection.appendChild(textarea);
        this.container.appendChild(negativeSection);
    }
    
    buildPreview() {
        const preview = document.createElement("div");
        preview.className = "promptflow-preview";
        
        const label = document.createElement("div");
        label.className = "promptflow-preview-label";
        label.textContent = "Preview";
        
        this.previewElement = document.createElement("div");
        this.previewElement.className = "promptflow-preview-text";
        
        preview.appendChild(label);
        preview.appendChild(this.previewElement);
        this.container.appendChild(preview);
        
        this.updatePreview();
    }
    
    buildVariationsPanel() {
        const variations = document.createElement("div");
        variations.className = "promptflow-variations";
        
        // Header (clickable to expand)
        const header = document.createElement("div");
        header.className = "promptflow-variations-header";
        
        const titleSection = document.createElement("div");
        titleSection.className = "promptflow-variations-title";
        
        const toggle = document.createElement("span");
        toggle.className = "promptflow-variations-toggle";
        toggle.textContent = ">";
        
        const label = document.createElement("span");
        label.className = "promptflow-variations-label";
        label.textContent = "Variations";
        
        this.variationsCountBadge = document.createElement("span");
        this.variationsCountBadge.className = "promptflow-variations-count";
        this.variationsCountBadge.textContent = "0";
        
        titleSection.appendChild(toggle);
        titleSection.appendChild(label);
        titleSection.appendChild(this.variationsCountBadge);
        
        header.appendChild(titleSection);
        
        // Content
        this.variationsContent = document.createElement("div");
        this.variationsContent.className = "promptflow-variations-content";
        
        // Toggle handler
        header.addEventListener("click", () => {
            const isExpanded = this.variationsContent.classList.toggle("expanded");
            toggle.classList.toggle("expanded", isExpanded);
            if (isExpanded) {
                this.updateVariationsPanel();
            }
        });
        
        variations.appendChild(header);
        variations.appendChild(this.variationsContent);
        this.container.appendChild(variations);
    }
    
    updateVariationsPanel() {
        if (!this.variationsContent) return;
        
        this.variationsContent.innerHTML = "";
        
        // Get current prompt text
        const promptText = this.getCurrentPromptText();
        
        // Find all wildcards and generate combinations
        const wildcards = this.extractWildcards(promptText);
        const combinations = this.generateCombinations(wildcards, promptText);
        
        // Update count badge
        this.variationsCountBadge.textContent = combinations.length.toString();
        
        if (combinations.length === 0) {
            const noVars = document.createElement("div");
            noVars.className = "promptflow-no-variations";
            noVars.textContent = "No wildcards found. Use {option1|option2|option3} syntax.";
            this.variationsContent.appendChild(noVars);
            return;
        }
        
        // Info bar
        const info = document.createElement("div");
        info.className = "promptflow-variations-info";
        
        const infoText = document.createElement("span");
        infoText.textContent = `${combinations.length} variation${combinations.length !== 1 ? 's' : ''} from ${wildcards.length} wildcard${wildcards.length !== 1 ? 's' : ''}`;
        
        const actions = document.createElement("div");
        actions.className = "promptflow-variations-actions";
        
        // Copy all button
        const copyAllBtn = document.createElement("button");
        copyAllBtn.className = "promptflow-variations-btn";
        copyAllBtn.textContent = "Copy All";
        copyAllBtn.title = "Copy all variations to clipboard";
        copyAllBtn.addEventListener("click", () => {
            const allText = combinations.map((c, i) => `${i}: ${c}`).join("\n\n");
            navigator.clipboard.writeText(allText).then(() => {
                copyAllBtn.textContent = "Copied!";
                setTimeout(() => copyAllBtn.textContent = "Copy All", 1500);
            });
        });
        
        // Seed hint
        const seedHint = document.createElement("span");
        seedHint.style.fontSize = "10px";
        seedHint.style.color = this.theme.textDim;
        seedHint.textContent = `Seeds 0-${combinations.length - 1}`;
        seedHint.title = "Use these seed values to get each variation";
        
        actions.appendChild(seedHint);
        actions.appendChild(copyAllBtn);
        
        info.appendChild(infoText);
        info.appendChild(actions);
        this.variationsContent.appendChild(info);
        
        // Variations list (limit to 50 for performance)
        const list = document.createElement("div");
        list.className = "promptflow-variations-list";
        
        const displayLimit = Math.min(combinations.length, 50);
        for (let i = 0; i < displayLimit; i++) {
            const item = document.createElement("div");
            item.className = "promptflow-variation-item";
            
            const index = document.createElement("span");
            index.className = "promptflow-variation-index";
            index.textContent = i.toString();
            
            const text = document.createElement("span");
            text.className = "promptflow-variation-text";
            text.textContent = combinations[i];
            
            const copyBtn = document.createElement("button");
            copyBtn.className = "promptflow-variation-copy";
            copyBtn.textContent = "Copy";
            copyBtn.title = "Copy this variation";
            copyBtn.addEventListener("click", () => {
                navigator.clipboard.writeText(combinations[i]).then(() => {
                    copyBtn.textContent = "OK!";
                    setTimeout(() => copyBtn.textContent = "Copy", 1000);
                });
            });
            
            item.appendChild(index);
            item.appendChild(text);
            item.appendChild(copyBtn);
            list.appendChild(item);
        }
        
        if (combinations.length > displayLimit) {
            const more = document.createElement("div");
            more.className = "promptflow-variation-item";
            more.style.justifyContent = "center";
            more.style.color = this.theme.textDim;
            more.textContent = `... and ${combinations.length - displayLimit} more`;
            list.appendChild(more);
        }
        
        this.variationsContent.appendChild(list);
    }
    
    getCurrentPromptText() {
        // Use categoryOrder for extended mode to respect drag-drop reordering
        let fieldIds;
        if (this.data.mode === "simple") {
            fieldIds = SIMPLE_FIELDS.map(f => f.id);
        } else {
            // Use custom order if available, otherwise default
            fieldIds = this.data.categoryOrder || EXTENDED_FIELDS.map(f => f.id);
        }
        
        const parts = [];
        for (const fieldId of fieldIds) {
            const value = this.data.categories[fieldId]?.value?.trim();
            if (value) {
                parts.push(value);
            }
        }
        
        return parts.join(", ");
    }
    
    extractWildcards(text) {
        const pattern = /\{([^}]+)\}/g;
        const wildcards = [];
        let match;
        
        while ((match = pattern.exec(text)) !== null) {
            const options = match[1].split("|").map(o => o.trim()).filter(o => o);
            if (options.length > 1) {
                wildcards.push({
                    full: match[0],
                    options: options
                });
            }
        }
        
        return wildcards;
    }
    
    generateCombinations(wildcards, template) {
        if (wildcards.length === 0) return [];
        
        // Calculate total combinations
        const totalCombinations = wildcards.reduce((acc, w) => acc * w.options.length, 1);
        
        // Limit to prevent browser hang
        const maxCombinations = 1000;
        if (totalCombinations > maxCombinations) {
            // Return sample combinations
            const results = [];
            for (let i = 0; i < maxCombinations; i++) {
                let result = template;
                let idx = i;
                for (const wildcard of wildcards) {
                    const optionIdx = idx % wildcard.options.length;
                    result = result.replace(wildcard.full, wildcard.options[optionIdx]);
                    idx = Math.floor(idx / wildcard.options.length);
                }
                results.push(result);
            }
            return results;
        }
        
        // Generate all combinations using Cartesian product
        const results = [];
        
        function generate(index, current) {
            if (index === wildcards.length) {
                results.push(current);
                return;
            }
            
            const wildcard = wildcards[index];
            for (const option of wildcard.options) {
                generate(index + 1, current.replace(wildcard.full, option));
            }
        }
        
        generate(0, template);
        return results;
    }
    
    async showCategoryPresets(category, targetEl) {
        // Remove any existing dropdown
        document.querySelectorAll(".promptflow-preset-dropdown").forEach(el => el.remove());
        
        const dropdown = document.createElement("div");
        dropdown.className = "promptflow-preset-dropdown";
        
        // Get presets for this category - ensure they're loaded
        const builtins = await loadBuiltinPresets();
        const custom = getCustomPresets("categories");
        
        console.log("[PromptFlow] Showing presets for:", category, "builtins:", builtins);
        
        // Map category to preset type
        const presetMap = {
            "style": "styles",
            "quality": "quality",
            "negative": "negatives"
        };
        
        const presetType = presetMap[category];
        const builtinItems = presetType ? (builtins[presetType] || []) : [];
        const customItems = custom[category] || [];
        
        // Built-in presets (no delete button)
        if (builtinItems.length > 0) {
            const divider = document.createElement("div");
            divider.className = "promptflow-preset-divider";
            divider.textContent = "Built-in";
            dropdown.appendChild(divider);
            
            builtinItems.forEach(preset => {
                const item = document.createElement("div");
                item.className = "promptflow-preset-item";
                
                const content = document.createElement("div");
                content.className = "promptflow-preset-item-content";
                content.innerHTML = `
                    <div class="promptflow-preset-item-name">${preset.name}</div>
                    <div class="promptflow-preset-item-preview">${preset.value.substring(0, 50)}${preset.value.length > 50 ? "..." : ""}</div>
                `;
                content.addEventListener("click", () => {
                    this.applyCategoryPreset(category, preset.value);
                    dropdown.remove();
                });
                
                item.appendChild(content);
                dropdown.appendChild(item);
            });
        }
        
        // Custom presets (with delete button)
        if (customItems.length > 0) {
            const divider = document.createElement("div");
            divider.className = "promptflow-preset-divider";
            divider.textContent = "Custom";
            dropdown.appendChild(divider);
            
            customItems.forEach((preset, idx) => {
                const item = document.createElement("div");
                item.className = "promptflow-preset-item";
                
                const content = document.createElement("div");
                content.className = "promptflow-preset-item-content";
                content.addEventListener("click", () => {
                    this.applyCategoryPreset(category, preset.value);
                    dropdown.remove();
                });
                
                // Delete button
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "promptflow-preset-delete";
                deleteBtn.textContent = "×";
                deleteBtn.title = "Delete preset";
                deleteBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.deleteCategoryPreset(category, idx);
                    item.remove();
                    // If no more items, close dropdown
                    if (dropdown.querySelectorAll(".promptflow-preset-item-content").length === 0) {
                        dropdown.remove();
                    }
                });
                
                item.appendChild(content);
                item.appendChild(deleteBtn);
                dropdown.appendChild(item);
            });
        }
        
        if (builtinItems.length === 0 && customItems.length === 0) {
            const empty = document.createElement("div");
            empty.className = "promptflow-preset-item";
            empty.textContent = "No presets available";
            empty.style.color = this.theme.textDim;
            dropdown.appendChild(empty);
        }
        
        // Position dropdown
        const rect = targetEl.getBoundingClientRect();
        dropdown.style.position = "fixed";
        dropdown.style.top = `${rect.bottom + 4}px`;
        dropdown.style.left = `${rect.left}px`;
        
        document.body.appendChild(dropdown);
        
        // Close on outside click
        const closeHandler = (e) => {
            if (!dropdown.contains(e.target) && e.target !== targetEl) {
                dropdown.remove();
                document.removeEventListener("click", closeHandler);
            }
        };
        setTimeout(() => document.addEventListener("click", closeHandler), 0);
    }
    
    deleteCategoryPreset(category, index) {
        const key = PRESET_STORAGE.categories;
        const existing = getCustomPresets("categories");
        
        if (existing[category] && existing[category][index]) {
            existing[category].splice(index, 1);
            localStorage.setItem(key, JSON.stringify(existing));
            console.log("[PromptFlow] Deleted category preset:", category, index);
        }
    }
    
    deleteGlobalPreset(index) {
        const key = PRESET_STORAGE.global;
        const existing = getCustomPresets("global");
        
        if (existing[index]) {
            existing.splice(index, 1);
            localStorage.setItem(key, JSON.stringify(existing));
            console.log("[PromptFlow] Deleted global preset:", index);
            
            // Refresh the dropdown
            const presetSelect = this.container.querySelector(".promptflow-preset-select");
            if (presetSelect) {
                presetSelect.innerHTML = `<option value="">Presets...</option>`;
                this.populateGlobalPresets(presetSelect);
            }
        }
    }
    
    applyCategoryPreset(category, value) {
        if (category === "negative") {
            // Append to existing negative (combinable)
            const existing = this.data.negative || "";
            this.data.negative = existing ? `${existing}, ${value}` : value;
            
            // Update textarea
            const negTextarea = this.container.querySelector(".promptflow-negative textarea");
            if (negTextarea) {
                negTextarea.value = this.data.negative;
            }
        } else {
            if (!this.data.categories[category]) {
                this.data.categories[category] = { value: "", mode: "fixed" };
            }
            this.data.categories[category].value = value;
            
            // Update textarea - find by iterating fields
            this.rebuildFields();
        }
        
        this.saveData();
        this.updatePreview();
    }
    
    showGlobalPresets(targetEl) {
        // Remove any existing dropdown
        document.querySelectorAll(".promptflow-preset-dropdown").forEach(el => el.remove());
        
        const presets = getCustomPresets("global");
        
        const dropdown = document.createElement("div");
        dropdown.className = "promptflow-preset-dropdown";
        
        if (presets.length > 0) {
            presets.forEach((preset, idx) => {
                const item = document.createElement("div");
                item.className = "promptflow-preset-item";
                
                const content = document.createElement("div");
                content.className = "promptflow-preset-item-content";
                content.innerHTML = `
                    <div class="promptflow-preset-item-name">${preset.name}</div>
                    <div class="promptflow-preset-item-preview">${preset.created ? new Date(preset.created).toLocaleDateString() : ''}</div>
                `;
                content.addEventListener("click", () => {
                    this.loadGlobalPreset(idx);
                    dropdown.remove();
                });
                
                // Delete button
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "promptflow-preset-delete";
                deleteBtn.textContent = "×";
                deleteBtn.title = "Delete preset";
                deleteBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.deleteGlobalPreset(idx);
                    item.remove();
                    if (dropdown.querySelectorAll(".promptflow-preset-item-content").length === 0) {
                        dropdown.innerHTML = '<div class="promptflow-preset-item" style="color: var(--text-dim)">No saved presets</div>';
                    }
                });
                
                item.appendChild(content);
                item.appendChild(deleteBtn);
                dropdown.appendChild(item);
            });
        } else {
            const empty = document.createElement("div");
            empty.className = "promptflow-preset-item";
            empty.textContent = "No saved presets";
            empty.style.color = this.theme.textDim;
            empty.style.cursor = "default";
            dropdown.appendChild(empty);
        }
        
        // Position dropdown
        const rect = targetEl.getBoundingClientRect();
        dropdown.style.position = "fixed";
        dropdown.style.top = `${rect.bottom + 4}px`;
        dropdown.style.left = `${rect.left}px`;
        
        document.body.appendChild(dropdown);
        
        // Close on outside click
        const closeHandler = (e) => {
            if (!dropdown.contains(e.target) && e.target !== targetEl) {
                dropdown.remove();
                document.removeEventListener("click", closeHandler);
            }
        };
        setTimeout(() => document.addEventListener("click", closeHandler), 0);
    }
    
    loadGlobalPreset(index) {
        const presets = getCustomPresets("global");
        const preset = presets[index];
        
        if (preset) {
            this.data = { ...this.data, ...preset.data };
            this.saveData();
            this.rebuildFields();
            this.updatePreview();
            
            // Update negative textarea
            const negTextarea = this.container.querySelector(".promptflow-negative textarea");
            if (negTextarea) {
                negTextarea.value = this.data.negative || "";
            }
        }
    }
    
    showSavePresetModal() {
        const overlay = document.createElement("div");
        overlay.className = "promptflow-modal-overlay";
        
        const modal = document.createElement("div");
        modal.className = "promptflow-modal";
        
        const title = document.createElement("div");
        title.className = "promptflow-modal-title";
        title.textContent = "Save Preset";
        
        const input = document.createElement("input");
        input.type = "text";
        input.className = "promptflow-modal-input";
        input.placeholder = "Preset name...";
        
        // Save function
        const doSave = () => {
            const name = input.value.trim();
            if (name) {
                saveCustomPreset("global", {
                    name,
                    created: new Date().toISOString(),
                    data: { ...this.data }
                });
                console.log("[PromptFlow] Preset saved successfully:", name);
                overlay.remove();
            }
        };
        
        // Enter key to save
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                doSave();
            }
        });
        
        const buttons = document.createElement("div");
        buttons.className = "promptflow-modal-buttons";
        
        const cancelBtn = document.createElement("button");
        cancelBtn.className = "promptflow-modal-btn cancel";
        cancelBtn.textContent = "Cancel";
        cancelBtn.addEventListener("click", () => overlay.remove());
        
        const saveBtn = document.createElement("button");
        saveBtn.className = "promptflow-modal-btn save";
        saveBtn.textContent = "Save";
        saveBtn.addEventListener("click", doSave);
        
        buttons.appendChild(cancelBtn);
        buttons.appendChild(saveBtn);
        
        modal.appendChild(title);
        modal.appendChild(input);
        modal.appendChild(buttons);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        input.focus();
        
        // Close on escape
        const escHandler = (e) => {
            if (e.key === "Escape") {
                overlay.remove();
                document.removeEventListener("keydown", escHandler);
            }
        };
        document.addEventListener("keydown", escHandler);
    }
    
    saveData() {
        saveWidgetData(this.widget, this.data);
    }
    
    reorderFields(draggedId, targetId) {
        const order = [...this.data.categoryOrder];
        const draggedIdx = order.indexOf(draggedId);
        const targetIdx = order.indexOf(targetId);
        
        if (draggedIdx === -1 || targetIdx === -1) return;
        
        // Remove dragged item and insert at target position
        order.splice(draggedIdx, 1);
        order.splice(targetIdx, 0, draggedId);
        
        this.data.categoryOrder = order;
        this.saveData();
        this.rebuildFields();
        this.updatePreview();
        
        console.log("[PromptFlow] Reordered fields:", order);
    }
    
    migrateData(fromMode, toMode) {
        if (fromMode === toMode) return;
        
        const cats = this.data.categories;
        
        if (fromMode === "simple" && toMode === "extended") {
            // Simple → Extended: main_prompt → subject, then clear main_prompt
            if (cats.main_prompt?.value?.trim()) {
                cats.subject = { 
                    value: cats.main_prompt.value, 
                    mode: cats.main_prompt.mode || "fixed" 
                };
                // Clear main_prompt to avoid confusion when switching back
                cats.main_prompt = { value: "", mode: "fixed" };
            }
        } else if (fromMode === "extended" && toMode === "simple") {
            // Extended → Simple: merge extended-only fields into main_prompt
            const partsToMerge = [];
            
            // Collect all the extended-only fields in order
            const extendedOnlyFields = ["subject", "character", "outfit", "pose", "location", "camera", "lighting", "custom"];
            
            for (const field of extendedOnlyFields) {
                if (cats[field]?.value?.trim()) {
                    partsToMerge.push(cats[field].value.trim());
                }
            }
            
            // Replace main_prompt with merged content (don't append to old value)
            cats.main_prompt = { 
                value: partsToMerge.join(", "), 
                mode: "fixed" 
            };
            
            // Clear the extended-only fields to avoid duplication on next switch
            for (const field of extendedOnlyFields) {
                if (cats[field]) {
                    cats[field] = { value: "", mode: "fixed" };
                }
            }
        }
        
        console.log("[PromptFlow] Migrated data from", fromMode, "to", toMode);
    }
    
    exportPresets() {
        try {
            const globalPresets = getCustomPresets("global");
            const categoryPresets = getCustomPresets("categories");
            
            const totalCount = globalPresets.length + 
                Object.values(categoryPresets).reduce((sum, arr) => sum + arr.length, 0);
            
            if (totalCount === 0) {
                showNotification("No custom presets to export", "info");
                return;
            }
            
            const exportData = {
                version: "1.0",
                exported: new Date().toISOString(),
                global: globalPresets,
                categories: categoryPresets
            };
            
            // Create download
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `promptflow-presets-${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification(`Exported ${totalCount} presets`, "success");
            console.log("[PromptFlow] Exported presets:", totalCount);
        } catch (err) {
            console.error("[PromptFlow] Export error:", err);
            showNotification("Failed to export presets", "error");
        }
    }
    
    importPresets() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        
        input.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importData = JSON.parse(event.target.result);
                    
                    // Validate structure
                    if (!importData.global && !importData.categories) {
                        showNotification("Invalid preset file format", "error");
                        return;
                    }
                    
                    let importedCount = 0;
                    
                    // Merge global presets
                    if (importData.global && Array.isArray(importData.global)) {
                        const existing = getCustomPresets("global");
                        const merged = [...existing, ...importData.global];
                        localStorage.setItem(PRESET_STORAGE.global, JSON.stringify(merged));
                        importedCount += importData.global.length;
                    }
                    
                    // Merge category presets
                    if (importData.categories && typeof importData.categories === "object") {
                        const existing = getCustomPresets("categories");
                        for (const [category, presets] of Object.entries(importData.categories)) {
                            if (!Array.isArray(presets)) continue;
                            if (!existing[category]) {
                                existing[category] = [];
                            }
                            existing[category] = [...existing[category], ...presets];
                            importedCount += presets.length;
                        }
                        localStorage.setItem(PRESET_STORAGE.categories, JSON.stringify(existing));
                    }
                    
                    showNotification(`Imported ${importedCount} presets`, "success");
                    console.log("[PromptFlow] Imported", importedCount, "presets");
                    
                } catch (err) {
                    console.error("[PromptFlow] Import error:", err);
                    showNotification("Failed to import: " + err.message, "error");
                }
            };
            
            reader.onerror = () => {
                showNotification("Failed to read file", "error");
            };
            
            reader.readAsText(file);
        });
        
        input.click();
    }
    
    showAutoSortModal() {
        const overlay = document.createElement("div");
        overlay.className = "promptflow-modal-overlay";
        
        const modal = document.createElement("div");
        modal.className = "promptflow-modal";
        modal.style.minWidth = "450px";
        modal.style.maxWidth = "600px";
        
        const title = document.createElement("div");
        title.className = "promptflow-modal-title";
        title.textContent = "Auto-Sort Prompt";
        
        const description = document.createElement("div");
        description.style.fontSize = "11px";
        description.style.color = this.theme.textMuted;
        description.style.marginBottom = "12px";
        description.textContent = "Paste a prompt below and it will be automatically distributed to the appropriate categories.";
        
        // Textarea for prompt input
        const textarea = document.createElement("textarea");
        textarea.className = "promptflow-autosort-textarea";
        textarea.placeholder = "Paste your prompt here...\n\nExample: a beautiful woman, long blonde hair, wearing a red dress, standing in a forest, cinematic lighting, masterpiece";
        
        // Preview container
        const previewContainer = document.createElement("div");
        previewContainer.className = "promptflow-autosort-preview";
        previewContainer.style.display = "none";
        
        const previewLabel = document.createElement("div");
        previewLabel.style.fontSize = "11px";
        previewLabel.style.fontWeight = "500";
        previewLabel.style.color = this.theme.textMuted;
        previewLabel.style.marginBottom = "8px";
        previewLabel.textContent = "Preview:";
        
        const previewContent = document.createElement("div");
        previewContent.id = "autosort-preview-content";
        
        previewContainer.appendChild(previewLabel);
        previewContainer.appendChild(previewContent);
        
        // Update preview as user types
        let categorized = null;
        textarea.addEventListener("input", () => {
            const text = textarea.value.trim();
            if (!text) {
                previewContainer.style.display = "none";
                categorized = null;
                return;
            }
            
            categorized = autoCategorize(text, "extended");
            previewContainer.style.display = "block";
            
            // Build preview
            previewContent.innerHTML = "";
            const categoriesToShow = ["subject", "character", "outfit", "pose", "location", "style", "camera", "lighting", "quality", "custom"];
            
            for (const cat of categoriesToShow) {
                const tags = categorized[cat] || [];
                if (tags.length === 0) continue;
                
                const catDiv = document.createElement("div");
                catDiv.className = "promptflow-autosort-category";
                
                const label = document.createElement("div");
                label.className = "promptflow-autosort-category-label";
                label.textContent = cat.replace("_", " ");
                
                const tagsDiv = document.createElement("div");
                tagsDiv.className = "promptflow-autosort-category-tags";
                tagsDiv.textContent = tags.join(", ");
                
                catDiv.appendChild(label);
                catDiv.appendChild(tagsDiv);
                previewContent.appendChild(catDiv);
            }
            
            if (previewContent.children.length === 0) {
                previewContent.innerHTML = '<div class="promptflow-autosort-empty">No tags detected</div>';
            }
        });
        
        // Options
        const optionsDiv = document.createElement("div");
        optionsDiv.style.display = "flex";
        optionsDiv.style.gap = "12px";
        optionsDiv.style.marginBottom = "12px";
        
        const replaceLabel = document.createElement("label");
        replaceLabel.style.display = "flex";
        replaceLabel.style.alignItems = "center";
        replaceLabel.style.gap = "4px";
        replaceLabel.style.fontSize = "11px";
        replaceLabel.style.color = this.theme.textMuted;
        replaceLabel.style.cursor = "pointer";
        
        const replaceCheckbox = document.createElement("input");
        replaceCheckbox.type = "checkbox";
        replaceCheckbox.checked = false;
        
        replaceLabel.appendChild(replaceCheckbox);
        replaceLabel.appendChild(document.createTextNode("Replace existing content (unchecked = append)"));
        
        optionsDiv.appendChild(replaceLabel);
        
        // Buttons
        const buttons = document.createElement("div");
        buttons.className = "promptflow-modal-buttons";
        
        const cancelBtn = document.createElement("button");
        cancelBtn.className = "promptflow-modal-btn cancel";
        cancelBtn.textContent = "Cancel";
        cancelBtn.addEventListener("click", () => overlay.remove());
        
        const applyBtn = document.createElement("button");
        applyBtn.className = "promptflow-modal-btn save";
        applyBtn.textContent = "Apply";
        applyBtn.addEventListener("click", () => {
            if (!categorized) {
                overlay.remove();
                return;
            }
            
            const replace = replaceCheckbox.checked;
            
            // Apply categorized content to fields
            for (const [category, tags] of Object.entries(categorized)) {
                if (category === "main_prompt" || category === "unmatched") continue;
                if (tags.length === 0) continue;
                
                const newValue = tags.join(", ");
                
                if (!this.data.categories[category]) {
                    this.data.categories[category] = { value: "", mode: "fixed" };
                }
                
                if (replace || !this.data.categories[category].value) {
                    this.data.categories[category].value = newValue;
                } else {
                    // Append
                    const existing = this.data.categories[category].value.trim();
                    this.data.categories[category].value = existing 
                        ? `${existing}, ${newValue}`
                        : newValue;
                }
            }
            
            this.saveData();
            this.rebuildFields();
            this.updatePreview();
            overlay.remove();
            
            console.log("[PromptFlow] Auto-sorted prompt into categories");
        });
        
        buttons.appendChild(cancelBtn);
        buttons.appendChild(applyBtn);
        
        modal.appendChild(title);
        modal.appendChild(description);
        modal.appendChild(textarea);
        modal.appendChild(previewContainer);
        modal.appendChild(optionsDiv);
        modal.appendChild(buttons);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        textarea.focus();
        
        // Close on escape
        const escHandler = (e) => {
            if (e.key === "Escape") {
                overlay.remove();
                document.removeEventListener("keydown", escHandler);
            }
        };
        document.addEventListener("keydown", escHandler);
    }
    
    updatePreview() {
        if (!this.previewElement) return;
        
        const previewText = this.getCurrentPromptText() || "(empty prompt)";
        this.previewElement.textContent = previewText;
        
        // Update variations count badge
        if (this.variationsCountBadge) {
            const wildcards = this.extractWildcards(previewText);
            const count = wildcards.length > 0 
                ? wildcards.reduce((acc, w) => acc * w.options.length, 1)
                : 0;
            this.variationsCountBadge.textContent = count > 1000 ? "1000+" : count.toString();
            
            // Update panel if expanded
            if (this.variationsContent?.classList.contains("expanded")) {
                this.updateVariationsPanel();
            }
        }
    }
    
    showThemeSelector(targetEl) {
        // Remove any existing dropdown
        document.querySelectorAll(".promptflow-preset-dropdown").forEach(el => el.remove());
        
        const dropdown = document.createElement("div");
        dropdown.className = "promptflow-preset-dropdown";
        dropdown.style.minWidth = "180px";
        
        // Add title
        const title = document.createElement("div");
        title.className = "promptflow-preset-divider";
        title.textContent = "Select Theme";
        dropdown.appendChild(title);
        
        // Add theme options
        for (const [key, theme] of Object.entries(THEMES)) {
            const item = document.createElement("div");
            item.className = "promptflow-preset-item";
            item.style.cursor = "pointer";
            
            // Color swatch
            const swatch = document.createElement("span");
            swatch.style.cssText = `
                width: 16px;
                height: 16px;
                border-radius: 3px;
                background: ${theme.accent};
                margin-right: 8px;
                flex-shrink: 0;
            `;
            
            const label = document.createElement("span");
            label.textContent = theme.name;
            label.style.flex = "1";
            
            // Check mark for current theme
            if (globalSettings.theme === key) {
                const check = document.createElement("span");
                check.textContent = "✓";
                check.style.color = this.theme.accent;
                check.style.marginLeft = "8px";
                item.appendChild(swatch);
                item.appendChild(label);
                item.appendChild(check);
            } else {
                item.appendChild(swatch);
                item.appendChild(label);
            }
            
            item.addEventListener("click", () => {
                // Update theme
                globalSettings.theme = key;
                this.theme = THEMES[key];
                this.injectStyles();
                
                // Save to ComfyUI settings
                if (app.ui.settings.setSettingValue) {
                    app.ui.settings.setSettingValue("PromptFlow.Theme", key);
                }
                
                dropdown.remove();
                showNotification(`Theme: ${theme.name}`, "success");
            });
            
            dropdown.appendChild(item);
        }
        
        // Position dropdown
        const rect = targetEl.getBoundingClientRect();
        dropdown.style.position = "fixed";
        dropdown.style.top = `${rect.bottom + 4}px`;
        dropdown.style.left = `${rect.left}px`;
        
        document.body.appendChild(dropdown);
        
        // Adjust if off-screen
        const dropRect = dropdown.getBoundingClientRect();
        if (dropRect.right > window.innerWidth) {
            dropdown.style.left = `${window.innerWidth - dropRect.width - 10}px`;
        }
        
        // Close on outside click
        const closeHandler = (e) => {
            if (!dropdown.contains(e.target) && e.target !== targetEl) {
                dropdown.remove();
                document.removeEventListener("click", closeHandler);
            }
        };
        setTimeout(() => document.addEventListener("click", closeHandler), 0);
    }
    
    showContextMenu(e, fieldId, textarea) {
        e.preventDefault();
        
        // Remove existing context menus
        document.querySelectorAll(".promptflow-context-menu").forEach(el => el.remove());
        
        const menu = document.createElement("div");
        menu.className = "promptflow-context-menu";
        
        const items = [
            { icon: "Copy", label: "Copy", action: () => {
                if (textarea.value) {
                    navigator.clipboard.writeText(textarea.value);
                }
            }},
            { icon: "Paste", label: "Paste", action: async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    textarea.value = text;
                    textarea.dispatchEvent(new Event("input"));
                } catch (err) {
                    console.warn("[PromptFlow] Clipboard access denied");
                }
            }},
            { divider: true },
            { icon: "Save", label: "Save as Preset", action: () => {
                const value = textarea.value.trim();
                if (!value) return;
                
                const name = prompt("Preset name:");
                if (name) {
                    saveCustomPreset("categories", {
                        category: fieldId,
                        name: name,
                        value: value
                    });
                    console.log("[PromptFlow] Saved preset for", fieldId);
                }
            }},
            { divider: true },
            { icon: "Clear", label: "Clear", className: "danger", action: () => {
                textarea.value = "";
                textarea.dispatchEvent(new Event("input"));
            }}
        ];
        
        for (const item of items) {
            if (item.divider) {
                const divider = document.createElement("div");
                divider.className = "promptflow-context-divider";
                menu.appendChild(divider);
                continue;
            }
            
            const menuItem = document.createElement("div");
            menuItem.className = "promptflow-context-item" + (item.className ? ` ${item.className}` : "");
            
            const icon = document.createElement("span");
            icon.className = "promptflow-context-item-icon";
            icon.textContent = item.icon === "Copy" ? "📋" : 
                              item.icon === "Paste" ? "📎" :
                              item.icon === "Save" ? "💾" :
                              item.icon === "Clear" ? "🗑️" : "";
            
            const label = document.createElement("span");
            label.textContent = item.label;
            
            menuItem.appendChild(icon);
            menuItem.appendChild(label);
            menuItem.addEventListener("click", () => {
                item.action();
                menu.remove();
            });
            
            menu.appendChild(menuItem);
        }
        
        // Position menu
        menu.style.left = `${e.clientX}px`;
        menu.style.top = `${e.clientY}px`;
        
        document.body.appendChild(menu);
        
        // Adjust if off-screen
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = `${window.innerWidth - rect.width - 10}px`;
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = `${window.innerHeight - rect.height - 10}px`;
        }
        
        // Close on click outside
        const closeHandler = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener("click", closeHandler);
            }
        };
        setTimeout(() => document.addEventListener("click", closeHandler), 0);
    }
}

// ============================================================================
// COMFYUI INTEGRATION
// ============================================================================

app.registerExtension({
    name: "PromptFlow.Widget",
    
    async setup() {
        // Add theme setting to ComfyUI's settings menu
        app.ui.settings.addSetting({
            id: "PromptFlow.Theme",
            name: "PromptFlow Theme",
            type: "combo",
            tooltip: "Choose a color theme for PromptFlow nodes",
            options: Object.entries(THEMES).map(([key, theme]) => ({
                value: key,
                text: theme.name
            })),
            defaultValue: "umbrael",
            onChange: (value) => {
                setTheme(value);
            }
        });
        
        // Load saved theme
        const savedTheme = app.ui.settings.getSettingValue("PromptFlow.Theme", "umbrael");
        globalSettings.theme = savedTheme;
    },
    
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name !== NODE_TYPE) return;
        
        // Store original onNodeCreated
        const origOnNodeCreated = nodeType.prototype.onNodeCreated;
        
        nodeType.prototype.onNodeCreated = function() {
            origOnNodeCreated?.apply(this, arguments);
            
            // Find the widget_data widget
            const widgetDataWidget = this.widgets?.find(w => w.name === "widget_data");
            if (!widgetDataWidget) return;
            
            // AGGRESSIVELY HIDE the JSON widget
            widgetDataWidget.type = "converted-widget";
            widgetDataWidget.hidden = true;
            widgetDataWidget.computeSize = () => [0, -4];
            widgetDataWidget.draw = function() {};
            if (widgetDataWidget.element) {
                widgetDataWidget.element.style.display = "none";
            }
            
            // Create our custom widget
            const promptFlowWidget = new PromptFlowWidget(this, widgetDataWidget);
            
            // Add DOM widget
            const DEFAULT_HEIGHT = 500;
            const domWidget = this.addDOMWidget("promptflow_ui", "div", promptFlowWidget.render(), {
                serialize: false,
                hideOnZoom: true,
            });
            
            // Fixed widget size - content scrolls within
            const node = this;
            domWidget.computeSize = () => [node.size[0], DEFAULT_HEIGHT];
            
            // Set initial node size
            this.setSize([Math.max(this.size[0], 400), DEFAULT_HEIGHT + 80]);
            
            // Store reference for later
            this.promptFlowWidget = promptFlowWidget;
        };
        
        // Handle serialization
        const origOnSerialize = nodeType.prototype.onSerialize;
        nodeType.prototype.onSerialize = function(o) {
            origOnSerialize?.apply(this, arguments);
            // widget_data is automatically serialized
        };
    },
    
    async loadedGraphNode(node, app) {
        if (node.type !== NODE_TYPE) return;
        
        // Re-initialize widget after load
        if (node.promptFlowWidget) {
            const widgetDataWidget = node.widgets?.find(w => w.name === "widget_data");
            if (widgetDataWidget) {
                node.promptFlowWidget.data = parseWidgetData(widgetDataWidget);
                node.promptFlowWidget.rebuildFields();
                node.promptFlowWidget.updatePreview();
            }
        }
    }
});

console.log("[PromptFlow] Widget loaded successfully");
