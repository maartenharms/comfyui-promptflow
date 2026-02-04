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
// THEME SYSTEM (Shared with FlowPath via localStorage)
// ============================================================================

const THEMES = {
    modern: {
        name: "Modern Dark",
        background: "#1a1a2e",
        surface: "#252540",
        surfaceHover: "#2d2d4a",
        border: "#3a3a5c",
        borderFocus: "#6366f1",
        text: "#e2e8f0",
        textMuted: "#94a3b8",
        textDim: "#64748b",
        accent: "#6366f1",
        accentHover: "#818cf8",
        accentText: "#ffffff",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        scrollbar: "#3a3a5c",
        scrollbarHover: "#4a4a6c"
    },
    ocean: {
        name: "Ocean",
        background: "#0f172a",
        surface: "#1e293b",
        surfaceHover: "#273449",
        border: "#334155",
        borderFocus: "#0ea5e9",
        text: "#e2e8f0",
        textMuted: "#94a3b8",
        textDim: "#64748b",
        accent: "#0ea5e9",
        accentHover: "#38bdf8",
        accentText: "#ffffff",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        scrollbar: "#334155",
        scrollbarHover: "#475569"
    },
    forest: {
        name: "Forest",
        background: "#14201a",
        surface: "#1c2e24",
        surfaceHover: "#243a2e",
        border: "#2d4a3a",
        borderFocus: "#22c55e",
        text: "#e2e8f0",
        textMuted: "#94a3b8",
        textDim: "#64748b",
        accent: "#22c55e",
        accentHover: "#4ade80",
        accentText: "#ffffff",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        scrollbar: "#2d4a3a",
        scrollbarHover: "#3d5a4a"
    },
    sunset: {
        name: "Sunset",
        background: "#1a1412",
        surface: "#2d2420",
        surfaceHover: "#3d322c",
        border: "#4d423a",
        borderFocus: "#f97316",
        text: "#e2e8f0",
        textMuted: "#94a3b8",
        textDim: "#64748b",
        accent: "#f97316",
        accentHover: "#fb923c",
        accentText: "#ffffff",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        scrollbar: "#4d423a",
        scrollbarHover: "#5d524a"
    },
    midnight: {
        name: "Midnight",
        background: "#0a0a0f",
        surface: "#12121a",
        surfaceHover: "#1a1a24",
        border: "#252530",
        borderFocus: "#8b5cf6",
        text: "#e2e8f0",
        textMuted: "#94a3b8",
        textDim: "#64748b",
        accent: "#8b5cf6",
        accentHover: "#a78bfa",
        accentText: "#ffffff",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        scrollbar: "#252530",
        scrollbarHover: "#353540"
    },
    light: {
        name: "Light",
        background: "#f8fafc",
        surface: "#ffffff",
        surfaceHover: "#f1f5f9",
        border: "#e2e8f0",
        borderFocus: "#6366f1",
        text: "#1e293b",
        textMuted: "#475569",
        textDim: "#94a3b8",
        accent: "#6366f1",
        accentHover: "#818cf8",
        accentText: "#ffffff",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        scrollbar: "#e2e8f0",
        scrollbarHover: "#cbd5e1"
    }
};

// Shared theme storage key (used by both FlowPath and PromptFlow)
const THEME_STORAGE_KEY = "mern_extensions_theme";
const CUSTOM_THEMES_KEY = "mern_extensions_custom_themes";

function getActiveTheme() {
    const themeName = localStorage.getItem(THEME_STORAGE_KEY) || "modern";
    
    // Check built-in themes first
    if (THEMES[themeName]) {
        return THEMES[themeName];
    }
    
    // Check custom themes
    try {
        const customThemes = JSON.parse(localStorage.getItem(CUSTOM_THEMES_KEY) || "{}");
        if (customThemes[themeName]) {
            return customThemes[themeName];
        }
    } catch (e) {
        console.warn("[PromptFlow] Error loading custom theme:", e);
    }
    
    return THEMES.modern;
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
        console.log("[PromptFlow] Preset API response status:", response.status);
        if (response.ok) {
            builtinPresets = await response.json();
            console.log("[PromptFlow] Loaded presets:", builtinPresets);
        } else {
            const errorText = await response.text();
            console.warn("[PromptFlow] Failed to load built-in presets:", response.status, errorText);
            builtinPresets = { styles: [], quality: [], negatives: [] };
        }
    } catch (e) {
        console.warn("[PromptFlow] Error loading built-in presets:", e);
        builtinPresets = { styles: [], quality: [], negatives: [] };
    }
    
    return builtinPresets;
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
            background: ${theme.background};
            border-radius: 4px;
        }
        
        .promptflow-container::-webkit-scrollbar-thumb {
            background: ${theme.scrollbar};
            border-radius: 4px;
        }
        
        .promptflow-container::-webkit-scrollbar-thumb:hover {
            background: ${theme.scrollbarHover};
        }
        
        .promptflow-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 8px;
            border-bottom: 1px solid ${theme.border};
            margin-bottom: 4px;
        }
        
        .promptflow-title {
            font-size: 14px;
            font-weight: 600;
            color: ${theme.text};
        }
        
        .promptflow-controls {
            display: flex;
            gap: 6px;
            align-items: center;
        }
        
        .promptflow-mode-select,
        .promptflow-preset-select {
            padding: 4px 8px;
            background: ${theme.surface};
            border: 1px solid ${theme.border};
            border-radius: 4px;
            color: ${theme.text};
            font-size: 11px;
            cursor: pointer;
            outline: none;
        }
        
        .promptflow-mode-select:hover,
        .promptflow-preset-select:hover {
            background: ${theme.surfaceHover};
        }
        
        .promptflow-mode-select:focus,
        .promptflow-preset-select:focus {
            border-color: ${theme.borderFocus};
        }
        
        .promptflow-save-btn {
            padding: 4px 8px;
            background: ${theme.accent};
            border: none;
            border-radius: 4px;
            color: ${theme.accentText};
            font-size: 11px;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .promptflow-save-btn:hover {
            background: ${theme.accentHover};
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
        }
        
        .promptflow-field-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .promptflow-field-label {
            font-size: 11px;
            font-weight: 500;
            color: ${theme.textMuted};
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .promptflow-field-controls {
            display: flex;
            gap: 4px;
            align-items: center;
        }
        
        .promptflow-preset-btn {
            padding: 2px 6px;
            background: transparent;
            border: 1px solid ${theme.border};
            border-radius: 3px;
            color: ${theme.textMuted};
            font-size: 10px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .promptflow-preset-btn:hover {
            background: ${theme.surface};
            border-color: ${theme.accent};
            color: ${theme.accent};
        }
        
        .promptflow-field-textarea {
            width: 100%;
            min-height: 50px;
            padding: 8px;
            background: ${theme.surface};
            border: 1px solid ${theme.border};
            border-radius: 4px;
            color: ${theme.text};
            font-size: 12px;
            font-family: inherit;
            resize: vertical;
            outline: none;
            transition: border-color 0.2s;
        }
        
        .promptflow-field-textarea::placeholder {
            color: ${theme.textDim};
        }
        
        .promptflow-field-textarea:focus {
            border-color: ${theme.borderFocus};
        }
        
        /* Extended Mode Accordion */
        .promptflow-accordion {
            background: ${theme.surface};
            border: 1px solid ${theme.border};
            border-radius: 6px;
            overflow: hidden;
        }
        
        .promptflow-accordion-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 10px;
            background: ${theme.surface};
            cursor: pointer;
            user-select: none;
            transition: background 0.2s;
        }
        
        .promptflow-accordion-header:hover {
            background: ${theme.surfaceHover};
        }
        
        .promptflow-accordion-left {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .promptflow-accordion-toggle {
            font-size: 10px;
            color: ${theme.textMuted};
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
            background: ${theme.background};
            border-radius: 3px;
            font-size: 9px;
            color: ${theme.textMuted};
            text-transform: uppercase;
        }
        
        .promptflow-drag-handle {
            padding: 2px 6px;
            color: ${theme.textDim};
            cursor: grab;
            font-size: 14px;
            user-select: none;
        }
        
        .promptflow-drag-handle:hover {
            color: ${theme.textMuted};
        }
        
        .promptflow-drag-handle:active {
            cursor: grabbing;
        }
        
        .promptflow-accordion.dragging {
            opacity: 0.5;
            border-color: ${theme.accent};
        }
        
        .promptflow-accordion.drag-over {
            border-color: ${theme.accent};
            border-style: dashed;
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
            padding-top: 8px;
            border-top: 1px solid ${theme.border};
        }
        
        /* Preview Section */
        .promptflow-preview {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid ${theme.border};
        }
        
        .promptflow-preview-label {
            font-size: 11px;
            font-weight: 500;
            color: ${theme.textMuted};
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        
        .promptflow-preview-text {
            padding: 8px;
            background: ${theme.surface};
            border: 1px solid ${theme.border};
            border-radius: 4px;
            color: ${theme.textDim};
            font-size: 11px;
            line-height: 1.4;
            max-height: 80px;
            overflow-y: auto;
            word-break: break-word;
        }
        
        /* Variations Panel */
        .promptflow-variations {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid ${theme.border};
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
            font-weight: 500;
            color: ${theme.textMuted};
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .promptflow-variations-count {
            padding: 2px 8px;
            background: ${theme.accent};
            color: ${theme.accentText};
            border-radius: 10px;
            font-size: 10px;
            font-weight: 600;
        }
        
        .promptflow-variations-toggle {
            font-size: 10px;
            color: ${theme.textMuted};
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
            background: ${theme.surface};
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
            border: 1px solid ${theme.border};
            border-radius: 3px;
            color: ${theme.textMuted};
            font-size: 10px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .promptflow-variations-btn:hover {
            background: ${theme.surface};
            border-color: ${theme.accent};
            color: ${theme.accent};
        }
        
        .promptflow-variations-list {
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid ${theme.border};
            border-radius: 4px;
        }
        
        .promptflow-variation-item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            padding: 6px 8px;
            border-bottom: 1px solid ${theme.border};
            font-size: 11px;
            color: ${theme.text};
            transition: background 0.2s;
        }
        
        .promptflow-variation-item:last-child {
            border-bottom: none;
        }
        
        .promptflow-variation-item:hover {
            background: ${theme.surfaceHover};
        }
        
        .promptflow-variation-index {
            flex-shrink: 0;
            width: 24px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${theme.background};
            border-radius: 3px;
            font-size: 10px;
            color: ${theme.textDim};
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
            color: ${theme.accent};
        }
        
        .promptflow-no-variations {
            padding: 12px;
            text-align: center;
            color: ${theme.textDim};
            font-size: 11px;
        }
        
        /* Preset Dropdown */
        .promptflow-preset-dropdown {
            position: absolute;
            z-index: 1000;
            min-width: 180px;
            max-height: 250px;
            overflow-y: auto;
            background: ${theme.surface};
            border: 1px solid ${theme.border};
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .promptflow-preset-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            font-size: 12px;
            color: ${theme.text};
            border-bottom: 1px solid ${theme.border};
            transition: background 0.2s;
        }
        
        .promptflow-preset-item:last-child {
            border-bottom: none;
        }
        
        .promptflow-preset-item:hover {
            background: ${theme.surfaceHover};
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
            padding: 4px 12px;
            font-size: 10px;
            color: ${theme.textDim};
            background: ${theme.background};
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* Save Preset Modal */
        .promptflow-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }
        
        .promptflow-modal {
            background: ${theme.surface};
            border: 1px solid ${theme.border};
            border-radius: 8px;
            padding: 20px;
            min-width: 300px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        
        .promptflow-modal-title {
            font-size: 14px;
            font-weight: 600;
            color: ${theme.text};
            margin-bottom: 16px;
        }
        
        .promptflow-modal-input {
            width: 100%;
            padding: 8px 12px;
            background: ${theme.background};
            border: 1px solid ${theme.border};
            border-radius: 4px;
            color: ${theme.text};
            font-size: 12px;
            outline: none;
            margin-bottom: 16px;
        }
        
        .promptflow-modal-input:focus {
            border-color: ${theme.borderFocus};
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
            border: 1px solid ${theme.border};
            color: ${theme.textMuted};
        }
        
        .promptflow-modal-btn.cancel:hover {
            background: ${theme.surfaceHover};
        }
        
        .promptflow-modal-btn.save {
            background: ${theme.accent};
            border: none;
            color: ${theme.accentText};
        }
        
        .promptflow-modal-btn.save:hover {
            background: ${theme.accentHover};
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
        
        controls.appendChild(modeSelect);
        controls.appendChild(presetBtn);
        controls.appendChild(saveBtn);
        controls.appendChild(exportBtn);
        controls.appendChild(importBtn);
        
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
        const fields = this.data.mode === "simple" ? SIMPLE_FIELDS : EXTENDED_FIELDS;
        const parts = [];
        
        for (const field of fields) {
            const value = this.data.categories[field.id]?.value?.trim();
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
        const globalPresets = getCustomPresets("global");
        const categoryPresets = getCustomPresets("categories");
        
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
        
        console.log("[PromptFlow] Exported presets:", globalPresets.length, "global,", Object.keys(categoryPresets).length, "category types");
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
                        alert("Invalid preset file format");
                        return;
                    }
                    
                    // Merge global presets
                    if (importData.global && Array.isArray(importData.global)) {
                        const existing = getCustomPresets("global");
                        const merged = [...existing, ...importData.global];
                        localStorage.setItem(PRESET_STORAGE.global, JSON.stringify(merged));
                    }
                    
                    // Merge category presets
                    if (importData.categories && typeof importData.categories === "object") {
                        const existing = getCustomPresets("categories");
                        for (const [category, presets] of Object.entries(importData.categories)) {
                            if (!existing[category]) {
                                existing[category] = [];
                            }
                            existing[category] = [...existing[category], ...presets];
                        }
                        localStorage.setItem(PRESET_STORAGE.categories, JSON.stringify(existing));
                    }
                    
                    console.log("[PromptFlow] Imported presets successfully");
                    alert("Presets imported successfully!");
                    
                } catch (err) {
                    console.error("[PromptFlow] Import error:", err);
                    alert("Failed to import presets: " + err.message);
                }
            };
            reader.readAsText(file);
        });
        
        input.click();
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
}

// ============================================================================
// COMFYUI INTEGRATION
// ============================================================================

app.registerExtension({
    name: "PromptFlow.Widget",
    
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
