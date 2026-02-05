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
        name: "🌊 Ocean Blue",
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
        name: "🌲 Forest Green",
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
        name: "🎠 Pink Pony Club",
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
        name: "🧡 Odie",
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
        name: "💜 Umbrael's Umbrage",
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
        name: "⚪ Plain Jane",
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
        name: "🦇 The Dark Knight",
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

// ============================================================================
// CUSTOM THEMES SYSTEM
// ============================================================================

// Validate theme object structure
function isValidThemeObject(theme) {
    if (!theme || typeof theme !== 'object') return false;
    const required = ['name', 'primary', 'primaryLight', 'primaryDark', 'gradient', 'accent', 'secondary', 'background'];
    return required.every(key => typeof theme[key] === 'string');
}

// Custom themes storage (loaded from localStorage)
let customThemes = {};
try {
    const stored = localStorage.getItem('promptflow_custom_themes');
    if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            for (const [key, theme] of Object.entries(parsed)) {
                if (isValidThemeObject(theme)) {
                    customThemes[key] = theme;
                }
            }
        }
    }
} catch (e) {
    console.warn('[PromptFlow] Failed to load custom themes:', e);
    localStorage.removeItem('promptflow_custom_themes');
}

// Save custom themes
function saveCustomThemes() {
    try {
        localStorage.setItem('promptflow_custom_themes', JSON.stringify(customThemes));
    } catch (e) {
        console.warn('[PromptFlow] Failed to save custom themes:', e);
    }
}

// Get all themes (built-in + custom)
function getAllThemes() {
    return { ...THEMES, ...customThemes };
}

// Color helpers
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 147, g: 51, b: 234 };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Theme Editor Modal
function openThemeEditor(existingThemeKey = null) {
    const isEditing = existingThemeKey && customThemes[existingThemeKey];
    const allThemes = getAllThemes();
    const currentThemeKey = globalSettings.theme || 'umbrael';
    const baseTheme = isEditing ? customThemes[existingThemeKey] : (allThemes[currentThemeKey] || THEMES.umbrael);
    
    let themeName = isEditing ? baseTheme.name : 'My Custom Theme';
    let primaryColor = baseTheme.primary || '#9333ea';
    let accentColor = baseTheme.accent || '#fbbf24';
    let primaryLightOpacity = 0.3;
    let primaryDarkOpacity = 0.6;
    let gradientOpacity1 = 0.2;
    let gradientOpacity2 = 0.1;
    let bgColor1 = '#111827';
    let bgColor2 = '#1e1432';
    let bgOpacity1 = 0.6;
    let bgOpacity2 = 0.4;

    // Parse existing theme values
    if (baseTheme) {
        const plMatch = baseTheme.primaryLight?.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
        if (plMatch) primaryLightOpacity = parseFloat(plMatch[4]);
        
        const pdMatch = baseTheme.primaryDark?.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
        if (pdMatch) primaryDarkOpacity = parseFloat(pdMatch[4]);
        
        const gradMatch = baseTheme.gradient?.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\).*rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
        if (gradMatch) {
            gradientOpacity1 = parseFloat(gradMatch[4]);
            gradientOpacity2 = parseFloat(gradMatch[8]);
        }
        
        const bgMatch = baseTheme.background?.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\).*rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
        if (bgMatch) {
            bgColor1 = rgbToHex(parseInt(bgMatch[1]), parseInt(bgMatch[2]), parseInt(bgMatch[3]));
            bgOpacity1 = parseFloat(bgMatch[4]);
            bgColor2 = rgbToHex(parseInt(bgMatch[5]), parseInt(bgMatch[6]), parseInt(bgMatch[7]));
            bgOpacity2 = parseFloat(bgMatch[8]);
        }
    }

    const getPreviewTheme = () => {
        const rgb = hexToRgb(primaryColor);
        const rgb2 = hexToRgb(accentColor);
        const bgRgb1 = hexToRgb(bgColor1);
        const bgRgb2 = hexToRgb(bgColor2);
        // Auto-derive secondary from primary (lighter version)
        const secondaryRgb = {
            r: Math.min(255, rgb.r + 40),
            g: Math.min(255, rgb.g + 40),
            b: Math.min(255, rgb.b + 40)
        };
        const autoSecondary = rgbToHex(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
        // Auto-derive textMuted from primary (lighter, more transparent feel)
        const textMutedRgb = {
            r: Math.min(255, Math.round(rgb.r * 0.7 + 255 * 0.3)),
            g: Math.min(255, Math.round(rgb.g * 0.7 + 255 * 0.3)),
            b: Math.min(255, Math.round(rgb.b * 0.7 + 255 * 0.3))
        };
        const autoTextMuted = rgbToHex(textMutedRgb.r, textMutedRgb.g, textMutedRgb.b);
        // Auto-derive textDim from primary (darker version)
        const textDimRgb = {
            r: Math.round(rgb.r * 0.6),
            g: Math.round(rgb.g * 0.6),
            b: Math.round(rgb.b * 0.6)
        };
        const autoTextDim = rgbToHex(textDimRgb.r, textDimRgb.g, textDimRgb.b);
        return {
            name: themeName,
            primary: primaryColor,
            primaryLight: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${primaryLightOpacity})`,
            primaryDark: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${primaryDarkOpacity})`,
            gradient: `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${gradientOpacity1}), rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, ${gradientOpacity2}))`,
            accent: accentColor,
            secondary: autoSecondary,
            background: `linear-gradient(180deg, rgba(${bgRgb1.r}, ${bgRgb1.g}, ${bgRgb1.b}, ${bgOpacity1}) 0%, rgba(${bgRgb2.r}, ${bgRgb2.g}, ${bgRgb2.b}, ${bgOpacity2}) 100%)`,
            text: "#e2e8f0",
            textMuted: autoTextMuted,
            textDim: autoTextDim,
            success: "#22c55e",
            warning: "#fbbf24",
            error: "#ef4444"
        };
    };

    // Create modal
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.85); z-index: 100000;
        display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(4px);
    `;

    const container = document.createElement('div');
    container.style.cssText = `
        display: flex; gap: 24px; max-height: 90vh;
        font-family: system-ui, -apple-system, sans-serif;
    `;

    // Controls panel
    const controlsPanel = document.createElement('div');
    controlsPanel.style.cssText = `
        background: #2a2a2a; border: 1px solid #444; border-radius: 12px;
        padding: 24px; width: 420px; max-height: 90vh; overflow-y: auto;
    `;

    // Preview panel
    const previewPanel = document.createElement('div');
    previewPanel.style.cssText = `
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        padding: 30px; background: #1e1e1e; border-radius: 12px; border: 1px solid #333;
        min-width: 350px;
    `;

    const previewLabel = document.createElement('div');
    previewLabel.textContent = 'Live Preview';
    previewLabel.style.cssText = 'color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;';
    previewPanel.appendChild(previewLabel);

    // Dummy preview node - realistic PromptFlow preview
    const dummyNode = document.createElement('div');
    dummyNode.style.cssText = 'width: 340px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.4); background: #353535;';
    
    const nodeTitleBar = document.createElement('div');
    nodeTitleBar.style.cssText = 'background: linear-gradient(180deg, #454545 0%, #353535 100%); padding: 8px 12px; font-size: 13px; font-weight: 600; color: #ddd; border-bottom: 1px solid #2a2a2a;';
    nodeTitleBar.textContent = '📝 PromptFlow';
    
    const nodeContent = document.createElement('div');
    nodeContent.innerHTML = `
        <div class="pf-preview-widget">
            <div class="pf-preview-header-bar">
                <span class="pf-preview-title">📝 PromptFlow</span>
                <div class="pf-preview-controls">
                    <div class="pf-preview-mode-container">
                        <div class="pf-preview-mode-switch">
                            <span class="pf-preview-mode active">Simple</span>
                            <span class="pf-preview-mode">Extended</span>
                        </div>
                        <span class="pf-preview-info-icon">i</span>
                    </div>
                    <div class="pf-preview-btn-group">
                        <span class="pf-preview-btn">Save</span>
                        <span class="pf-preview-btn">Load</span>
                        <span class="pf-preview-btn last">•••</span>
                    </div>
                </div>
            </div>
            <div class="pf-preview-field-section">
                <div class="pf-preview-field-header">
                    <span class="pf-preview-field-label">Main Prompt</span>
                    <span class="pf-preview-field-mode">FIXED</span>
                </div>
                <div class="pf-preview-textarea">A beautiful portrait of a fantasy character with {red|blue|golden} hair</div>
            </div>
            <div class="pf-preview-field-section">
                <div class="pf-preview-field-header">
                    <span class="pf-preview-field-label">Style</span>
                    <span class="pf-preview-field-mode">RANDOM</span>
                </div>
                <div class="pf-preview-textarea">digital art, {vibrant|muted} colors, __art_styles__</div>
            </div>
            <div class="pf-preview-accordion">
                <div class="pf-preview-accordion-header">
                    <span class="pf-preview-arrow">▶</span>
                    <span class="pf-preview-field-label">Quality</span>
                    <span class="pf-preview-field-mode">FIXED</span>
                </div>
            </div>
            <div class="pf-preview-negative">
                <div class="pf-preview-neg-label">Negative</div>
                <div class="pf-preview-neg-text">ugly, blurry, low quality</div>
            </div>
        </div>
    `;

    const updatePreview = () => {
        const t = getPreviewTheme();
        
        // Main widget container
        const widget = nodeContent.querySelector('.pf-preview-widget');
        widget.style.cssText = `background: ${t.background}; padding: 10px; border: 1px solid ${t.primaryLight}; border-radius: 6px; margin: 6px;`;
        
        // Header bar
        const headerBar = nodeContent.querySelector('.pf-preview-header-bar');
        headerBar.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; background: ${t.gradient}; border: 1px solid ${t.primaryLight}; border-radius: 4px; margin-bottom: 8px; min-height: 28px; flex-wrap: wrap; gap: 6px;`;
        
        // Title
        const title = nodeContent.querySelector('.pf-preview-title');
        title.style.cssText = `color: ${t.accent}; font-size: 12px; font-weight: 600; white-space: nowrap;`;
        
        // Controls
        const controls = nodeContent.querySelector('.pf-preview-controls');
        controls.style.cssText = `display: flex; align-items: center; gap: 6px; flex-shrink: 0;`;
        
        // Mode container (switch + info icon)
        const modeContainer = nodeContent.querySelector('.pf-preview-mode-container');
        modeContainer.style.cssText = `display: flex; align-items: center; gap: 4px; flex-shrink: 0;`;
        
        // Mode switch
        const modeSwitch = nodeContent.querySelector('.pf-preview-mode-switch');
        modeSwitch.style.cssText = `display: flex; align-items: center; background: rgba(0,0,0,0.3); border-radius: 4px; padding: 2px; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0;`;
        nodeContent.querySelectorAll('.pf-preview-mode').forEach((m, i) => {
            const isActive = m.classList.contains('active');
            m.style.cssText = `padding: 3px 5px; font-size: 8px; font-weight: 600; border-radius: 3px; cursor: pointer; background: ${isActive ? t.accent : 'rgba(0,0,0,0.2)'}; color: ${isActive ? '#000' : 'rgba(255,255,255,0.6)'}; white-space: nowrap;`;
        });
        
        // Info icon
        const infoIcon = nodeContent.querySelector('.pf-preview-info-icon');
        infoIcon.style.cssText = `
            display: inline-flex; align-items: center; justify-content: center;
            width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
            background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
            color: rgba(255,255,255,0.5); font-size: 8px; font-weight: bold;
            font-style: italic; font-family: Georgia, serif;
        `;
        
        // Button group
        const btnGroup = nodeContent.querySelector('.pf-preview-btn-group');
        btnGroup.style.cssText = `display: flex; background: rgba(0,0,0,0.3); border-radius: 4px; overflow: hidden; border: 1px solid ${t.primaryLight}; flex-shrink: 0;`;
        nodeContent.querySelectorAll('.pf-preview-btn').forEach(b => {
            const isLast = b.classList.contains('last');
            b.style.cssText = `padding: 3px 6px; font-size: 8px; color: ${t.text}; ${isLast ? '' : `border-right: 1px solid ${t.primaryLight};`} cursor: pointer; white-space: nowrap;`;
        });
        
        // Field sections
        nodeContent.querySelectorAll('.pf-preview-field-section').forEach(s => {
            s.style.cssText = `margin-bottom: 6px;`;
        });
        
        // Field headers
        nodeContent.querySelectorAll('.pf-preview-field-header').forEach(h => {
            h.style.cssText = `display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;`;
        });
        
        // Field labels
        nodeContent.querySelectorAll('.pf-preview-field-label').forEach(l => {
            l.style.cssText = `color: ${t.text}; font-size: 11px; font-weight: 500;`;
        });
        
        // Field modes - all use accent color like actual node
        nodeContent.querySelectorAll('.pf-preview-field-mode').forEach(m => {
            m.style.cssText = `padding: 2px 6px; background: ${t.accent}; color: #1a1a2e; font-size: 8px; border-radius: 3px; font-weight: 600; text-transform: uppercase;`;
        });
        
        // Textareas
        nodeContent.querySelectorAll('.pf-preview-textarea').forEach(ta => {
            ta.style.cssText = `padding: 8px; background: rgba(0,0,0,0.3); border: 1px solid ${t.primaryLight}; border-radius: 4px; color: ${t.text}; font-size: 10px; line-height: 1.4;`;
        });
        
        // Accordion
        const accordion = nodeContent.querySelector('.pf-preview-accordion');
        accordion.style.cssText = `background: ${t.gradient}; border: 1px solid ${t.primaryLight}; border-radius: 4px; margin-bottom: 6px;`;
        
        const accordionHeader = nodeContent.querySelector('.pf-preview-accordion-header');
        accordionHeader.style.cssText = `display: flex; align-items: center; gap: 8px; padding: 6px 8px;`;
        
        const arrow = nodeContent.querySelector('.pf-preview-arrow');
        arrow.style.cssText = `color: ${t.accent}; font-size: 8px;`;
        
        // Negative section
        const negative = nodeContent.querySelector('.pf-preview-negative');
        negative.style.cssText = `padding: 6px; background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05)); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px;`;
        
        const negLabel = nodeContent.querySelector('.pf-preview-neg-label');
        negLabel.style.cssText = `color: #ffffff; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;`;
        
        const negText = nodeContent.querySelector('.pf-preview-neg-text');
        negText.style.cssText = `padding: 6px; background: rgba(0,0,0,0.3); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 3px; color: #9ca3af; font-size: 10px;`;
    };

    dummyNode.appendChild(nodeTitleBar);
    dummyNode.appendChild(nodeContent);
    previewPanel.appendChild(dummyNode);

    // Helper to create color row (matching FlowPath style)
    const createColorRow = (label, value, onChange) => {
        const row = document.createElement('div');
        row.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-bottom: 10px;';
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.style.cssText = 'width: 120px; color: #ccc; font-size: 12px;';
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = value;
        colorInput.style.cssText = 'width: 40px; height: 28px; border: 1px solid #555; border-radius: 4px; cursor: pointer; background: transparent;';
        const hexInput = document.createElement('input');
        hexInput.type = 'text';
        hexInput.value = value;
        hexInput.style.cssText = 'width: 80px; padding: 6px; background: #1a1a1a; border: 1px solid #444; border-radius: 4px; color: #fff; font-family: monospace; font-size: 12px;';
        colorInput.oninput = () => { hexInput.value = colorInput.value; onChange(colorInput.value); updatePreview(); };
        hexInput.oninput = () => { if (/^#[0-9a-f]{6}$/i.test(hexInput.value)) { colorInput.value = hexInput.value; onChange(hexInput.value); updatePreview(); }};
        row.appendChild(labelEl);
        row.appendChild(colorInput);
        row.appendChild(hexInput);
        return row;
    };

    // Helper to create slider row (matching FlowPath style)
    const createSliderRow = (label, value, min, max, step, onChange) => {
        const row = document.createElement('div');
        row.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-bottom: 10px;';
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.style.cssText = 'width: 120px; color: #ccc; font-size: 12px;';
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min; slider.max = max; slider.step = step; slider.value = value;
        slider.style.cssText = 'flex: 1; cursor: pointer;';
        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = value;
        valueDisplay.style.cssText = 'width: 40px; color: #999; font-size: 12px; text-align: right;';
        slider.oninput = () => { valueDisplay.textContent = slider.value; onChange(parseFloat(slider.value)); updatePreview(); };
        row.appendChild(labelEl);
        row.appendChild(slider);
        row.appendChild(valueDisplay);
        return row;
    };

    // Build controls
    const title = document.createElement('h2');
    title.textContent = isEditing ? 'Edit Theme' : 'Create Custom Theme';
    title.style.cssText = 'margin: 0 0 16px 0; color: #fff; font-size: 18px; font-weight: 600;';
    controlsPanel.appendChild(title);

    // Theme name
    const nameRow = document.createElement('div');
    nameRow.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-bottom: 16px;';
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Theme Name';
    nameLabel.style.cssText = 'width: 120px; color: #ccc; font-size: 12px;';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = themeName;
    nameInput.maxLength = 24;
    nameInput.placeholder = 'Max 24 characters';
    nameInput.style.cssText = 'flex: 1; padding: 8px; background: #1a1a1a; border: 1px solid #444; border-radius: 4px; color: #fff; font-size: 13px;';
    nameInput.oninput = () => { themeName = nameInput.value; };
    nameRow.appendChild(nameLabel);
    nameRow.appendChild(nameInput);
    controlsPanel.appendChild(nameRow);

    // Colors section
    const colorsTitle = document.createElement('div');
    colorsTitle.textContent = 'Colors';
    colorsTitle.style.cssText = 'color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 16px 0 10px 0; padding-top: 12px; border-top: 1px solid #333;';
    controlsPanel.appendChild(colorsTitle);
    controlsPanel.appendChild(createColorRow('Primary', primaryColor, v => { primaryColor = v; }));
    controlsPanel.appendChild(createColorRow('Accent', accentColor, v => { accentColor = v; }));

    // Background section
    const bgTitle = document.createElement('div');
    bgTitle.textContent = 'Background';
    bgTitle.style.cssText = 'color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 16px 0 10px 0; padding-top: 12px; border-top: 1px solid #333;';
    controlsPanel.appendChild(bgTitle);
    controlsPanel.appendChild(createColorRow('Top Color', bgColor1, v => { bgColor1 = v; }));
    controlsPanel.appendChild(createColorRow('Bottom Color', bgColor2, v => { bgColor2 = v; }));
    controlsPanel.appendChild(createSliderRow('Top Opacity', bgOpacity1, 0.2, 1.0, 0.05, v => { bgOpacity1 = v; }));
    controlsPanel.appendChild(createSliderRow('Bottom Opacity', bgOpacity2, 0.1, 0.8, 0.05, v => { bgOpacity2 = v; }));

    // Opacity section
    const opacityTitle = document.createElement('div');
    opacityTitle.textContent = 'Element Opacity';
    opacityTitle.style.cssText = 'color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 16px 0 10px 0; padding-top: 12px; border-top: 1px solid #333;';
    controlsPanel.appendChild(opacityTitle);
    controlsPanel.appendChild(createSliderRow('Border Light', primaryLightOpacity, 0.1, 0.8, 0.05, v => { primaryLightOpacity = v; }));
    controlsPanel.appendChild(createSliderRow('Border Dark', primaryDarkOpacity, 0.2, 1.0, 0.05, v => { primaryDarkOpacity = v; }));
    controlsPanel.appendChild(createSliderRow('Gradient Start', gradientOpacity1, 0.05, 0.5, 0.05, v => { gradientOpacity1 = v; }));
    controlsPanel.appendChild(createSliderRow('Gradient End', gradientOpacity2, 0.02, 0.3, 0.02, v => { gradientOpacity2 = v; }));

    // Buttons
    const buttonRow = document.createElement('div');
    buttonRow.style.cssText = 'display: flex; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #333;';

    if (isEditing) {
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.cssText = 'padding: 10px 16px; background: transparent; border: 1px solid #ef4444; border-radius: 6px; color: #ef4444; font-size: 13px; cursor: pointer; transition: all 0.2s;';
        deleteBtn.onmouseover = () => { deleteBtn.style.background = 'rgba(239,68,68,0.1)'; };
        deleteBtn.onmouseout = () => { deleteBtn.style.background = 'transparent'; };
        deleteBtn.onclick = () => {
            if (confirm(`Delete theme "${themeName}"?`)) {
                delete customThemes[existingThemeKey];
                saveCustomThemes();
                setTheme('umbrael');
                app.ui.settings.setSettingValue("📝 PromptFlow.Theme", 'umbrael');
                overlay.remove();
            }
        };
        buttonRow.appendChild(deleteBtn);
    }

    const spacer = document.createElement('div');
    spacer.style.flex = '1';
    buttonRow.appendChild(spacer);

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = 'padding: 10px 20px; background: transparent; border: 1px solid #555; border-radius: 6px; color: #aaa; font-size: 13px; cursor: pointer; transition: all 0.2s;';
    cancelBtn.onmouseover = () => { cancelBtn.style.borderColor = '#777'; cancelBtn.style.color = '#fff'; };
    cancelBtn.onmouseout = () => { cancelBtn.style.borderColor = '#555'; cancelBtn.style.color = '#aaa'; };
    cancelBtn.onclick = () => overlay.remove();

    const saveBtn = document.createElement('button');
    saveBtn.textContent = isEditing ? 'Update Theme' : 'Save Theme';
    saveBtn.style.cssText = 'padding: 10px 20px; background: #10b981; border: none; border-radius: 6px; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;';
    saveBtn.onmouseover = () => { saveBtn.style.background = '#059669'; };
    saveBtn.onmouseout = () => { saveBtn.style.background = '#10b981'; };
    saveBtn.onclick = () => {
        if (!themeName.trim()) {
            nameInput.style.borderColor = '#ef4444';
            setTimeout(() => { nameInput.style.borderColor = '#444'; }, 300);
            return;
        }
        if (!isEditing && Object.keys(customThemes).length >= 1) {
            saveBtn.textContent = 'Limit reached (1 custom theme)';
            setTimeout(() => { saveBtn.textContent = 'Save Theme'; }, 1500);
            return;
        }
        const themeKey = isEditing ? existingThemeKey : 'custom_' + Date.now();
        customThemes[themeKey] = getPreviewTheme();
        saveCustomThemes();
        setTheme(themeKey);
        app.ui.settings.setSettingValue("📝 PromptFlow.Theme", themeKey);
        overlay.remove();
    };

    buttonRow.appendChild(cancelBtn);
    buttonRow.appendChild(saveBtn);
    controlsPanel.appendChild(buttonRow);

    container.appendChild(controlsPanel);
    container.appendChild(previewPanel);
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    updatePreview();

    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    const escHandler = (e) => { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', escHandler); }};
    document.addEventListener('keydown', escHandler);
}

// Expose theme editor globally for other PromptFlow widgets (e.g., Variations)
window.promptFlowOpenThemeEditor = openThemeEditor;

// ============================================================================
// UNDO/REDO SYSTEM
// ============================================================================

class UndoManager {
    constructor(maxHistory = 50) {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistory = maxHistory;
    }
    
    push(state) {
        // Remove any states after current index (redo history)
        this.history = this.history.slice(0, this.currentIndex + 1);
        this.history.push(JSON.stringify(state));
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
    }
    
    undo() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            return JSON.parse(this.history[this.currentIndex]);
        }
        return null;
    }
    
    redo() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            return JSON.parse(this.history[this.currentIndex]);
        }
        return null;
    }
    
    canUndo() { return this.currentIndex > 0; }
    canRedo() { return this.currentIndex < this.history.length - 1; }
}

// Global settings
let globalSettings = {
    theme: "umbrael",
    stickyHeader: false
};

// Get active theme (includes custom themes)
function getActiveTheme() {
    const allThemes = getAllThemes();
    return allThemes[globalSettings.theme] || THEMES.umbrael;
}

// Set theme and trigger re-render (supports custom themes)
function setTheme(themeKey) {
    const allThemes = getAllThemes();
    if (allThemes[themeKey]) {
        globalSettings.theme = themeKey;
        const theme = allThemes[themeKey];
        // Re-render all PromptFlow nodes
        if (app.graph && app.graph._nodes) {
            // Update PromptFlowCore nodes
            const coreNodes = app.graph._nodes.filter(n => n.comfyClass === "PromptFlowCore");
            coreNodes.forEach(node => {
                if (node.promptFlowWidget) {
                    node.promptFlowWidget.theme = theme;
                    node.promptFlowWidget.injectStyles();
                }
            });
            
            // Update PromptFlowVariations nodes
            const variationsNodes = app.graph._nodes.filter(n => n.comfyClass === "PromptFlowVariations");
            variationsNodes.forEach(node => {
                if (node.variationsWidget) {
                    node.variationsWidget.theme = theme;
                    node.variationsWidget.injectStyles();
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
    { id: "expression", label: "Expression", placeholder: "Facial expression, emotion..." },
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
    
    // Facial expression/Emotion
    expression: [
        "smiling", "smile", "grinning", "grin", "laughing", "happy", "joyful",
        "sad", "crying", "tears", "frowning", "angry", "furious", "rage",
        "surprised", "shocked", "confused", "worried", "anxious", "nervous",
        "serious", "stern", "stoic", "calm", "peaceful", "serene",
        "seductive", "flirty", "winking", "blushing", "embarrassed", "shy",
        "scared", "fearful", "disgusted", "tired", "sleepy", "bored",
        "excited", "determined", "confident", "smug", "playful", "mischievous",
        "open mouth", "closed eyes", "half-closed eyes", "wide eyes", "narrowed eyes"
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
        expression: [],
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
// WILDCARD SYSTEM
// ============================================================================

// Cache for wildcard data
let wildcardCache = {
    list: null,          // List of all wildcard names
    contents: {},        // Map of wildcard name -> options array
    lastFetch: 0,        // Timestamp of last list fetch
    cacheTimeout: 30000  // 30 seconds cache timeout
};

// Wildcard settings (stored in localStorage)
const WILDCARD_STORAGE_KEY = "promptflow_wildcard_settings";

function getWildcardSettings() {
    try {
        return JSON.parse(localStorage.getItem(WILDCARD_STORAGE_KEY) || '{}');
    } catch (e) {
        return {};
    }
}

function saveWildcardSettings(settings) {
    localStorage.setItem(WILDCARD_STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Get list of all available wildcards
 * @returns {Promise<Array>} Array of wildcard objects with name, source, etc.
 */
async function listWildcards() {
    const now = Date.now();
    
    // Return cached if still valid
    if (wildcardCache.list && (now - wildcardCache.lastFetch) < wildcardCache.cacheTimeout) {
        return wildcardCache.list;
    }
    
    try {
        const response = await api.fetchApi("/promptflow/wildcards");
        if (response.ok) {
            const data = await response.json();
            wildcardCache.list = data.wildcards || [];
            wildcardCache.lastFetch = now;
            console.log("[PromptFlow] Loaded", wildcardCache.list.length, "wildcards");
            return wildcardCache.list;
        } else {
            console.warn("[PromptFlow] Wildcards API returned", response.status);
            return [];
        }
    } catch (e) {
        console.warn("[PromptFlow] Could not load wildcards:", e.message);
        return [];
    }
}

/**
 * Get contents of a specific wildcard
 * @param {string} name - Wildcard name (e.g., "animals" or "styles/anime")
 * @returns {Promise<Array|null>} Array of options or null if not found
 */
async function getWildcardContents(name) {
    // Return cached if available
    if (wildcardCache.contents[name]) {
        return wildcardCache.contents[name];
    }
    
    try {
        // Don't encode slashes - the route pattern handles them
        const safeName = name.replace(/\//g, '---SLASH---');
        const response = await api.fetchApi(`/promptflow/wildcards/${encodeURIComponent(safeName)}`);
        if (response.ok) {
            const data = await response.json();
            wildcardCache.contents[name] = data.options || [];
            console.log(`[PromptFlow] Loaded wildcard '${name}':`, wildcardCache.contents[name].length, "options");
            return wildcardCache.contents[name];
        } else {
            console.warn(`[PromptFlow] Wildcard '${name}' not found (status: ${response.status})`);
            return null;
        }
    } catch (e) {
        console.warn(`[PromptFlow] Error loading wildcard '${name}':`, e.message);
        return null;
    }
}

/**
 * Save a new wildcard file
 * @param {string} name - Wildcard name
 * @param {Array<string>} options - List of options
 * @param {boolean} overwrite - Whether to overwrite existing
 * @returns {Promise<Object>} Result with success status
 */
async function saveWildcard(name, options, overwrite = false) {
    try {
        const response = await api.fetchApi("/promptflow/wildcards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, options, overwrite })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Invalidate cache
            wildcardCache.list = null;
            delete wildcardCache.contents[name];
        }
        
        return result;
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * Clear the wildcard cache (force refresh)
 */
function clearWildcardCache() {
    wildcardCache.list = null;
    wildcardCache.contents = {};
    wildcardCache.lastFetch = 0;
    console.log("[PromptFlow] Wildcard cache cleared");
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
        negative: "",
        wildcardExpandMode: "expand"  // "expand" or "placeholder"
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
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 10px;
            background: ${theme.background};
            border: 1px solid ${theme.primaryLight};
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 11px;
            color: ${theme.text};
            box-sizing: border-box;
            overflow: visible;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }
        
        .promptflow-container::-webkit-scrollbar {
            width: 10px;
        }
        
        .promptflow-container::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 5px;
        }
        
        .promptflow-container::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.25);
            border-radius: 5px;
        }
        
        .promptflow-container::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.35);
        }
        
        .promptflow-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 8px;
            background: ${theme.gradient};
            border: 1px solid ${theme.primaryLight};
            border-radius: 4px;
            margin-bottom: 4px;
            flex-wrap: wrap;
            gap: 4px;
        }
        
        .promptflow-title {
            font-size: 12px;
            font-weight: 600;
            color: ${theme.accent};
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            flex-shrink: 0;
        }
        
        .promptflow-controls {
            display: flex;
            gap: 4px;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .promptflow-mode-switch {
            display: flex;
            align-items: center;
            background: rgba(0,0,0,0.3);
            border-radius: 4px;
            padding: 2px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .promptflow-mode-btn {
            padding: 3px 6px;
            font-size: 10px;
            font-weight: 600;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            transition: all 0.2s;
            background: rgba(0,0,0,0.2);
            color: rgba(255,255,255,0.6);
        }
        
        .promptflow-mode-btn.active {
            background: ${theme.accent};
            color: #000;
        }
        
        .promptflow-mode-btn:hover:not(.active) {
            background: rgba(255,255,255,0.1);
        }
        
        .promptflow-preset-select {
            padding: 4px 8px;
            background: #1a1a1f;
            border: 1px solid ${theme.primaryLight};
            border-radius: 4px;
            color: ${theme.text};
            font-size: 11px;
            cursor: pointer;
            outline: none;
            transition: all 0.2s;
        }
        
        .promptflow-preset-select option {
            background: #1a1a1f;
            color: ${theme.text};
            padding: 6px;
        }
        
        .promptflow-preset-select:hover {
            border-color: ${theme.primary};
            box-shadow: 0 0 0 2px ${theme.primaryLight};
        }
        
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
            gap: 4px;
        }
        
        /* Simple Mode Field */
        .promptflow-field {
            display: flex;
            flex-direction: column;
            gap: 3px;
            padding: 6px;
            background: ${theme.gradient};
            border: 1px solid ${theme.primaryLight};
            border-radius: 4px;
        }
        
        .promptflow-field-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .promptflow-field-label {
            font-size: 11px;
            font-weight: 600;
            color: #ffffff;
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
            color: ${theme.text};
            font-size: 10px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .promptflow-preset-btn:hover {
            border-color: ${theme.primary};
            color: ${theme.text};
            box-shadow: 0 0 0 2px ${theme.primaryLight};
        }
        
        /* Icon buttons (Save/Load) */
        .promptflow-icon-btn {
            width: 24px;
            height: 22px;
            padding: 0;
            background: transparent;
            border: 1px solid transparent;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .promptflow-icon-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: ${theme.primaryLight};
        }
        
        .promptflow-icon-btn.promptflow-save-btn {
            box-shadow: none;
            background: transparent;
            transition: opacity 0.2s, background 0.2s;
        }
        
        .promptflow-icon-btn.promptflow-save-btn:hover {
            background: rgba(34, 197, 94, 0.2);
            border-color: rgba(34, 197, 94, 0.5);
            transform: none;
        }
        
        .promptflow-icon-btn.promptflow-load-btn {
            box-shadow: none;
        }
        
        .promptflow-icon-btn.promptflow-load-btn:hover {
            background: rgba(59, 130, 246, 0.2);
            border-color: rgba(59, 130, 246, 0.5);
        }
        
        .promptflow-field-textarea {
            width: 100%;
            min-height: 40px;
            max-height: 200px;
            padding: 8px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid ${theme.primaryLight};
            border-radius: 4px;
            color: ${theme.text};
            font-size: 11px;
            font-family: inherit;
            resize: none;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
            box-sizing: border-box;
            line-height: 1.5;
            overflow-y: auto;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE/Edge */
        }
        
        .promptflow-field-textarea::-webkit-scrollbar {
            display: none; /* Chrome/Safari */
        }
        
        .promptflow-field-textarea::placeholder {
            color: rgba(255, 255, 255, 0.4);
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
            padding: 6px 10px;
            background: transparent;
            cursor: pointer;
            user-select: none;
            transition: background 0.2s;
            min-height: 20px;
            box-sizing: border-box;
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
            color: ${theme.accent};
        }
        
        .promptflow-accordion-label {
            font-size: 11px;
            font-weight: 500;
            color: #ffffff;
        }
        
        .promptflow-accordion-right {
            display: flex;
            gap: 4px;
            align-items: center;
        }
        
        .promptflow-mode-badge {
            padding: 2px 6px;
            background: ${theme.accent};
            border-radius: 3px;
            font-size: 9px;
            color: #1a1a2e;
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
            opacity: 0.6;
            cursor: grabbing;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .promptflow-accordion-content {
            padding: 0 10px 8px 10px;
            display: none;
        }
        
        .promptflow-accordion-content.expanded {
            display: block;
        }
        
        /* Negative Section */
        .promptflow-negative {
            margin-top: 4px;
            padding: 6px;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 4px;
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
            color: rgba(255, 255, 255, 0.4);
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
        
        .promptflow-autosort-preview::-webkit-scrollbar {
            width: 8px;
        }
        
        .promptflow-autosort-preview::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 4px;
        }
        
        .promptflow-autosort-preview::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.18);
            border-radius: 5px;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .promptflow-autosort-preview::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.25);
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
            background: #1a1a1f;
            border: 1px solid ${theme.primaryLight};
            border-radius: 6px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            padding: 4px 0;
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
        
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.95); }
        }
        
        /* Preset Dropdown */
        .promptflow-preset-dropdown {
            position: absolute;
            z-index: 1000;
            min-width: 180px;
            max-height: 250px;
            overflow-y: auto;
            background: #1a1a1f;
            border: 1px solid ${theme.primaryLight};
            border-radius: 6px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
        }
        
        .promptflow-preset-dropdown::-webkit-scrollbar {
            width: 8px;
        }
        
        .promptflow-preset-dropdown::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 4px;
        }
        
        .promptflow-preset-dropdown::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.18);
            border-radius: 5px;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .promptflow-preset-dropdown::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.25);
        }
        
        .promptflow-preset-item {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            font-size: 12px;
            color: ${theme.text};
            border-bottom: 1px solid rgba(255,255,255,0.05);
            transition: all 0.2s;
            cursor: pointer;
            border-left: 3px solid transparent;
        }
        
        .promptflow-preset-item:last-child {
            border-bottom: none;
        }
        
        .promptflow-preset-item:hover {
            background: ${theme.primaryLight};
            color: ${theme.text};
        }
        
        .promptflow-preset-item.active {
            background: rgba(34, 197, 94, 0.15);
            border-left-color: rgba(34, 197, 94, 0.8);
            box-shadow: inset 0 0 12px rgba(34, 197, 94, 0.08);
        }
        
        .promptflow-preset-item.active:hover {
            background: rgba(34, 197, 94, 0.25);
        }
        
        .promptflow-preset-item-content {
            flex: 1;
            cursor: pointer;
            overflow: hidden;
        }
        
        .promptflow-preset-item-name {
            font-weight: 500;
            color: ${theme.text};
            margin-bottom: 2px;
        }
        
        .promptflow-preset-item-preview {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.6);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 200px;
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
            color: ${theme.accent};
            background: rgba(0,0,0,0.3);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
            border-bottom: 1px solid ${theme.primaryLight};
        }
        
        /* Save Preset Modal */
        .promptflow-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(4px);
        }
        
        .promptflow-modal {
            background: linear-gradient(135deg, #2a2a2a, #1f1f1f);
            border: 2px solid ${theme.primary};
            border-radius: 12px;
            padding: 24px;
            min-width: 320px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
        }
        
        .promptflow-modal-title {
            font-size: 16px;
            font-weight: bold;
            color: #fff;
            margin-bottom: 16px;
        }
        
        .promptflow-modal-input {
            width: 100%;
            padding: 10px;
            background: rgba(0, 0, 0, 0.4);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            color: ${theme.text};
            font-size: 14px;
            outline: none;
            box-sizing: border-box;
            transition: all 0.3s;
        }
        
        .promptflow-modal-input:focus {
            border-color: ${theme.primary};
            box-shadow: 0 0 0 3px ${theme.primaryLight};
        }
        
        .promptflow-modal-buttons {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        
        .promptflow-modal-btn {
            padding: 8px 20px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .promptflow-modal-btn.cancel {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #fff;
        }
        
        .promptflow-modal-btn.cancel:hover {
            background: rgba(255, 255, 255, 0.15);
        }
        
        .promptflow-modal-btn.save {
            background: ${theme.primary};
            border: none;
            color: #ffffff;
            font-weight: bold;
            box-shadow: 0 2px 8px ${theme.primaryLight};
        }
        
        .promptflow-modal-btn.save:hover {
            box-shadow: 0 4px 12px ${theme.primaryLight};
            transform: translateY(-2px);
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
        
        // Drag state (FlowPath-style indicator)
        this.draggedFieldId = null;
        this.dragDropTarget = null;
        this.dragDropPosition = null;
        
        // Undo/Redo system
        this.undoManager = new UndoManager(50);
        this.undoManager.push(this.data);
        this.isUndoRedoAction = false;
        
        // Load presets on init
        loadBuiltinPresets();
    }
    
    /**
     * Save state for undo
     */
    saveUndoState() {
        if (!this.isUndoRedoAction) {
            this.undoManager.push(JSON.parse(JSON.stringify(this.data)));
        }
    }
    
    /**
     * Undo last action
     */
    undo() {
        const state = this.undoManager.undo();
        if (state) {
            this.isUndoRedoAction = true;
            this.data = state;
            this.syncToWidget();
            this.rebuildFields();
            this.syncUI();
            this.updatePreview();
            this.resizeAllTextareas();
            this.isUndoRedoAction = false;
        }
    }
    
    /**
     * Redo last undone action
     */
    redo() {
        const state = this.undoManager.redo();
        if (state) {
            this.isUndoRedoAction = true;
            this.data = state;
            this.syncToWidget();
            this.rebuildFields();
            this.syncUI();
            this.updatePreview();
            this.resizeAllTextareas();
            this.isUndoRedoAction = false;
        }
    }
    
    /**
     * Resize all textareas to fit content
     */
    resizeAllTextareas() {
        setTimeout(() => {
            const textareas = this.container.querySelectorAll('textarea');
            textareas.forEach(ta => this.autoResizeTextarea(ta));
        }, 10);
    }
    
    /**
     * Collapse all fields
     */
    collapseAll() {
        this.data.expandedCategories = [];
        this.saveUndoState();
        this.syncToWidget();
        this.rebuildFields();
        setTimeout(() => this.updateNodeSize?.(), 50);
    }
    
    /**
     * Expand all fields
     */
    expandAll() {
        const fields = this.data.mode === 'simple' ? SIMPLE_FIELDS : EXTENDED_FIELDS;
        this.data.expandedCategories = fields.map(f => f.id);
        this.saveUndoState();
        this.syncToWidget();
        this.rebuildFields();
        setTimeout(() => this.updateNodeSize?.(), 50);
    }
    
    /**
     * Set and display the last generated/resolved prompt
     */
    setLastGenerated(positive, negative) {
        this.lastGeneratedPositive = positive;
        this.lastGeneratedNegative = negative;
    }
    
    /**
     * Show popup with last generated prompt
     */
    showLastGeneratedPopup() {
        if (!this.lastGeneratedPositive && !this.lastGeneratedNegative) {
            return;
        }
        
        // Remove any existing popup
        document.querySelectorAll('.pf-lastgen-popup').forEach(el => el.remove());
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'pf-lastgen-popup';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Create popup
        const popup = document.createElement('div');
        popup.style.cssText = `
            background: #1a1a1f;
            border: 1px solid ${this.theme.primary};
            border-radius: 8px;
            padding: 16px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        `;
        
        // Title
        const title = document.createElement('div');
        title.style.cssText = `
            font-size: 14px;
            font-weight: 600;
            color: ${this.theme.accent};
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        title.innerHTML = `<span>📝 Last Generated Prompt</span>`;
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: #888;
            font-size: 16px;
            cursor: pointer;
            padding: 4px 8px;
        `;
        closeBtn.onclick = () => overlay.remove();
        title.appendChild(closeBtn);
        
        // Positive section
        const positiveSection = document.createElement('div');
        positiveSection.style.marginBottom = '12px';
        
        const positiveLabel = document.createElement('div');
        positiveLabel.style.cssText = `
            font-size: 10px;
            color: ${this.theme.textMuted};
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        positiveLabel.innerHTML = '<span>Positive</span>';
        
        // Copy button for positive
        const copyPosBtn = document.createElement('button');
        copyPosBtn.innerHTML = '📋 Copy';
        copyPosBtn.style.cssText = `
            background: ${this.theme.primaryLight};
            border: none;
            border-radius: 4px;
            color: #fff;
            font-size: 10px;
            padding: 2px 8px;
            cursor: pointer;
        `;
        copyPosBtn.onclick = () => {
            navigator.clipboard.writeText(this.lastGeneratedPositive || '');
            copyPosBtn.innerHTML = '✓ Copied';
            setTimeout(() => copyPosBtn.innerHTML = '📋 Copy', 1500);
        };
        positiveLabel.appendChild(copyPosBtn);
        
        const positiveText = document.createElement('div');
        positiveText.style.cssText = `
            font-size: 12px;
            color: ${this.theme.text};
            background: rgba(0, 0, 0, 0.3);
            padding: 8px;
            border-radius: 4px;
            word-break: break-word;
            white-space: pre-wrap;
            max-height: 200px;
            overflow-y: auto;
        `;
        positiveText.textContent = this.lastGeneratedPositive || '(empty)';
        
        positiveSection.appendChild(positiveLabel);
        positiveSection.appendChild(positiveText);
        
        // Negative section
        const negativeSection = document.createElement('div');
        
        const negativeLabel = document.createElement('div');
        negativeLabel.style.cssText = `
            font-size: 10px;
            color: ${this.theme.textMuted};
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        negativeLabel.innerHTML = '<span>Negative</span>';
        
        // Copy button for negative
        const copyNegBtn = document.createElement('button');
        copyNegBtn.innerHTML = '📋 Copy';
        copyNegBtn.style.cssText = `
            background: ${this.theme.primaryLight};
            border: none;
            border-radius: 4px;
            color: #fff;
            font-size: 10px;
            padding: 2px 8px;
            cursor: pointer;
        `;
        copyNegBtn.onclick = () => {
            navigator.clipboard.writeText(this.lastGeneratedNegative || '');
            copyNegBtn.innerHTML = '✓ Copied';
            setTimeout(() => copyNegBtn.innerHTML = '📋 Copy', 1500);
        };
        negativeLabel.appendChild(copyNegBtn);
        
        const negativeText = document.createElement('div');
        negativeText.style.cssText = `
            font-size: 12px;
            color: ${this.theme.textMuted};
            background: rgba(0, 0, 0, 0.3);
            padding: 8px;
            border-radius: 4px;
            word-break: break-word;
            white-space: pre-wrap;
            max-height: 100px;
            overflow-y: auto;
        `;
        negativeText.textContent = this.lastGeneratedNegative || '(empty)';
        
        negativeSection.appendChild(negativeLabel);
        negativeSection.appendChild(negativeText);
        
        popup.appendChild(title);
        popup.appendChild(positiveSection);
        popup.appendChild(negativeSection);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        // Close on overlay click
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };
        
        // Close on Escape
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    /**
     * Import prompt from text - parses comma-separated tags into fields
     */
    importFromText(text) {
        if (!text.trim()) return;
        
        // Split by commas
        const tags = text.split(',').map(t => t.trim()).filter(t => t);
        
        // For simple mode, put everything in main_prompt
        if (this.data.mode === 'simple') {
            this.data.categories.main_prompt = { value: text, mode: 'fixed' };
        } else {
            // For extended mode, try to categorize each tag
            const categorized = {};
            const uncategorized = [];
            
            for (const tag of tags) {
                const category = this.categorizeTag(tag);
                if (category) {
                    if (!categorized[category]) categorized[category] = [];
                    categorized[category].push(tag);
                } else {
                    uncategorized.push(tag);
                }
            }
            
            // Apply categorized tags
            for (const [category, categoryTags] of Object.entries(categorized)) {
                const existing = this.data.categories[category]?.value || '';
                const newValue = existing ? existing + ', ' + categoryTags.join(', ') : categoryTags.join(', ');
                this.data.categories[category] = { value: newValue, mode: 'fixed' };
            }
            
            // Put uncategorized in custom field
            if (uncategorized.length > 0) {
                const existing = this.data.categories.custom?.value || '';
                const newValue = existing ? existing + ', ' + uncategorized.join(', ') : uncategorized.join(', ');
                this.data.categories.custom = { value: newValue, mode: 'fixed' };
            }
        }
        
        this.saveUndoState();
        this.syncToWidget();
        this.rebuildFields();
        this.syncUI();
        this.updatePreview();
    }
    
    /**
     * Categorize a tag based on keyword matching
     */
    categorizeTag(tag) {
        const tagLower = tag.toLowerCase();
        for (const [category, keywords] of Object.entries(TAG_DATABASE)) {
            for (const keyword of keywords) {
                if (tagLower.includes(keyword.toLowerCase())) {
                    return category;
                }
            }
        }
        return null;
    }
    
    /**
     * Auto-resize textarea to fit content
     */
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        // Clamp between 40px min and 200px max to prevent huge textareas on reload
        const height = Math.min(200, Math.max(40, textarea.scrollHeight));
        textarea.style.height = height + 'px';
        // Immediate node size update (ResizeObserver will catch it, but call anyway for responsiveness)
        this.updateNodeSize?.();
    }
    
    /**
     * Update header sticky state based on global setting
     */
    updateHeaderSticky() {
        if (!this.headerElement) return;
        
        if (globalSettings.stickyHeader) {
            this.headerElement.style.position = "sticky";
            this.headerElement.style.top = "0";
            this.headerElement.style.zIndex = "10";
            this.headerElement.style.background = "#1a1a1f"; // Solid opaque dark background when sticky
        } else {
            this.headerElement.style.position = "";
            this.headerElement.style.top = "";
            this.headerElement.style.zIndex = "";
            this.headerElement.style.background = ""; // Back to gradient from CSS
        }
    }
    
    // FlowPath-style drag indicator using box-shadow
    updateDropIndicator(clientY) {
        if (!this.draggedFieldId || !this.fieldsContainer) return;
        
        const accordions = Array.from(this.fieldsContainer.querySelectorAll('.promptflow-accordion[data-field-id]'));
        if (accordions.length === 0) return;
        
        let targetRow = null;
        let position = null;
        let targetFieldId = null;
        
        // Find which accordion the cursor is over and determine position
        for (let i = 0; i < accordions.length; i++) {
            const accordion = accordions[i];
            const rect = accordion.getBoundingClientRect();
            
            // Check if cursor is in the gap before this accordion (between prev item and this one)
            if (clientY < rect.top) {
                if (i === 0) {
                    // Before first item
                    targetRow = accordion;
                    targetFieldId = accordion.dataset.fieldId;
                    position = 'before';
                } else {
                    // In gap between previous item and this one - show indicator after previous
                    const prevAccordion = accordions[i - 1];
                    targetRow = prevAccordion;
                    targetFieldId = prevAccordion.dataset.fieldId;
                    position = 'after';
                }
                break;
            }
            
            // Check if cursor is within this accordion's vertical bounds
            if (clientY >= rect.top && clientY <= rect.bottom) {
                const midpoint = rect.top + rect.height / 2;
                targetRow = accordion;
                targetFieldId = accordion.dataset.fieldId;
                position = clientY < midpoint ? 'before' : 'after';
                break;
            }
            
            // Check if cursor is after the last accordion
            if (i === accordions.length - 1 && clientY > rect.bottom) {
                targetRow = accordion;
                targetFieldId = accordion.dataset.fieldId;
                position = 'after';
                break;
            }
        }
        
        // Don't show indicator if hovering over the dragged item itself
        if (targetFieldId === this.draggedFieldId) {
            targetRow = null;
            position = null;
        }
        
        // Check if drop would result in same position
        if (targetRow && position) {
            const order = [...(this.data.categoryOrder || CATEGORY_FIELDS.map(f => f.id))];
            const draggedIdx = order.indexOf(this.draggedFieldId);
            const targetIdx = order.indexOf(targetFieldId);
            
            // Skip indicator if move would result in same position
            if (position === 'before' && targetIdx === draggedIdx + 1) {
                targetRow = null;
                position = null;
            } else if (position === 'after' && targetIdx === draggedIdx - 1) {
                targetRow = null;
                position = null;
            }
        }
        
        // Only update if changed
        if (targetRow !== this.dragDropTarget || position !== this.dragDropPosition) {
            // Clear previous indicator
            if (this.dragDropTarget) {
                const restoreShadow = this.dragDropTarget.dataset.originalBoxShadow;
                this.dragDropTarget.style.boxShadow = (restoreShadow && restoreShadow !== 'none') ? restoreShadow : '';
            }
            
            // Apply new indicator using box-shadow
            if (targetRow && position) {
                if (targetRow.dataset.originalBoxShadow === undefined) {
                    const currentShadow = targetRow.style.boxShadow;
                    targetRow.dataset.originalBoxShadow = (currentShadow && currentShadow !== 'none') ? currentShadow : '';
                }
                
                const indicatorColor = this.theme.accent;
                const indicatorShadow = position === 'before'
                    ? `0 -4px 0 0 ${indicatorColor}, 0 -8px 16px 0 ${indicatorColor}`
                    : `0 4px 0 0 ${indicatorColor}, 0 8px 16px 0 ${indicatorColor}`;
                
                const originalShadow = targetRow.dataset.originalBoxShadow;
                targetRow.style.boxShadow = originalShadow
                    ? `${indicatorShadow}, ${originalShadow}`
                    : indicatorShadow;
            }
            
            this.dragDropTarget = targetRow;
            this.dragDropPosition = position;
        }
    }
    
    clearDropIndicator() {
        if (this.dragDropTarget) {
            const restoreShadow = this.dragDropTarget.dataset.originalBoxShadow;
            this.dragDropTarget.style.boxShadow = (restoreShadow && restoreShadow !== 'none') ? restoreShadow : '';
        }
        this.dragDropTarget = null;
        this.dragDropPosition = null;
    }
    
    handleDocumentDragOver(e) {
        if (!this.draggedFieldId || !this.fieldsContainer) return;
        
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        e.preventDefault();
        
        this.updateDropIndicator(e.clientY);
    }
    
    handleDocumentDrop(e) {
        if (!this.draggedFieldId || !this.fieldsContainer) return;
        
        // If drop is inside container, the accordion drop handler will handle it
        if (e.target && this.fieldsContainer.contains(e.target)) return;
        
        e.preventDefault();
        this.clearDropIndicator();
        
        // Calculate insert position based on cursor
        const accordions = Array.from(this.fieldsContainer.querySelectorAll('.promptflow-accordion[data-field-id]'));
        if (accordions.length === 0) return;
        
        let targetFieldId = accordions[accordions.length - 1].dataset.fieldId;
        let insertAfter = true;
        
        for (const accordion of accordions) {
            const rect = accordion.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            if (e.clientY < midpoint) {
                targetFieldId = accordion.dataset.fieldId;
                insertAfter = false;
                break;
            }
        }
        
        if (targetFieldId !== this.draggedFieldId) {
            this.reorderFieldsWithPosition(this.draggedFieldId, targetFieldId, insertAfter);
        }
    }
    
    handleDocumentDragEnd(e) {
        this.clearDropIndicator();
        this.draggedFieldId = null;
    }
    
    render() {
        // Create container
        this.container = document.createElement("div");
        this.container.className = "promptflow-container";
        
        // Auto-height - content determines size
        this.container.style.height = "auto";
        
        // Allow middle mouse button events to pass through for canvas panning
        this.container.addEventListener("pointerdown", (e) => {
            if (e.button === 1) {
                // Middle mouse - disable pointer events to let canvas handle panning
                this.container.style.pointerEvents = "none";
                
                // Re-enable on mouse up (anywhere in document)
                const onPointerUp = () => {
                    this.container.style.pointerEvents = "";
                    document.removeEventListener("pointerup", onPointerUp);
                };
                document.addEventListener("pointerup", onPointerUp);
            }
        }, true);
        
        // Allow wheel scrolling within the container
        this.container.addEventListener("wheel", (e) => {
            // If container can scroll, handle it, otherwise let it bubble for canvas zoom
            const canScroll = this.container.scrollHeight > this.container.clientHeight;
            if (canScroll) {
                e.stopPropagation();
            }
        }, { passive: true });
        
        // Inject styles
        this.injectStyles();
        
        // Setup document-level drag listeners (FlowPath-style)
        this.setupDragListeners();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Build UI
        this.buildHeader();
        this.buildFields();
        this.buildNegativeField();
        this.buildDonationBanner();
        // Last Generated section removed - now shown via header button
        
        return this.container;
    }
    
    setupKeyboardShortcuts() {
        this.container.addEventListener("keydown", (e) => {
            // Only handle if focused inside this widget
            if (!this.container.contains(document.activeElement)) return;
            
            // Ctrl+Z = Undo
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            // Ctrl+Y or Ctrl+Shift+Z = Redo
            else if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
                e.preventDefault();
                this.redo();
            }
        });
    }
    
    setupDragListeners() {
        // Bind handlers to this instance
        this._boundDragOver = (e) => this.handleDocumentDragOver(e);
        this._boundDrop = (e) => this.handleDocumentDrop(e);
        this._boundDragEnd = (e) => this.handleDocumentDragEnd(e);
        
        // Use capture phase like FlowPath
        document.addEventListener('dragover', this._boundDragOver, { capture: true });
        document.addEventListener('drop', this._boundDrop, { capture: true });
        document.addEventListener('dragend', this._boundDragEnd, { capture: true });
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
        this.headerElement = header; // Store reference for settings updates
        
        // Apply sticky styling if enabled
        if (globalSettings.stickyHeader) {
            header.style.position = "sticky";
            header.style.top = "0";
            header.style.zIndex = "10";
            header.style.background = "#1a1a1f"; // Solid opaque dark background when sticky
        }
        
        // Title
        const title = document.createElement("span");
        title.className = "promptflow-title";
        title.textContent = "📝 PromptFlow";
        
        // Controls
        const controls = document.createElement("div");
        controls.className = "promptflow-controls";
        
        // Mode switch (Simple/Extended) with info icon
        const modeSwitchContainer = document.createElement("div");
        modeSwitchContainer.style.cssText = "display: flex; align-items: center; gap: 4px;";
        
        const modeSwitch = document.createElement("div");
        modeSwitch.className = "promptflow-mode-switch";
        
        const simpleBtn = document.createElement("button");
        simpleBtn.className = `promptflow-mode-btn ${this.data.mode === "simple" ? "active" : ""}`;
        simpleBtn.textContent = "Simple";
        simpleBtn.title = "Simple mode: Main Prompt, Style, Quality";
        
        const extendedBtn = document.createElement("button");
        extendedBtn.className = `promptflow-mode-btn ${this.data.mode === "extended" ? "active" : ""}`;
        extendedBtn.textContent = "Extended";
        extendedBtn.title = "Extended mode: Detailed categories for precise control";
        
        // Mode info icon
        const modeInfoIcon = document.createElement("span");
        modeInfoIcon.innerHTML = "i";
        modeInfoIcon.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            color: rgba(255,255,255,0.5);
            font-size: 9px;
            font-weight: bold;
            font-style: italic;
            font-family: Georgia, serif;
            cursor: help;
            transition: all 0.2s;
        `;
        modeInfoIcon.title = `Prompt Modes:

SIMPLE (3 fields):
• Main Prompt - Your core description
• Style - Art style, medium, aesthetic
• Quality - Quality boosters

EXTENDED (10 fields):
• Subject, Character, Outfit, Pose
• Location, Style, Camera, Lighting
• Quality, Custom

Fields can be reordered by dragging.
Content migrates when switching modes.`;
        
        const switchMode = (newMode) => {
            const oldMode = this.data.mode;
            if (oldMode === newMode) return;
            
            // Migrate data between modes
            this.migrateData(oldMode, newMode);
            
            this.data.mode = newMode;
            this.data.categoryOrder = (newMode === "simple" ? SIMPLE_FIELDS : EXTENDED_FIELDS).map(f => f.id);
            this.saveData();
            this.rebuildFields();
            this.updatePreview();
            
            // Update button states
            simpleBtn.classList.toggle("active", newMode === "simple");
            extendedBtn.classList.toggle("active", newMode === "extended");
        };
        
        simpleBtn.addEventListener("click", () => switchMode("simple"));
        extendedBtn.addEventListener("click", () => switchMode("extended"));
        
        modeSwitch.appendChild(simpleBtn);
        modeSwitch.appendChild(extendedBtn);
        
        modeSwitchContainer.appendChild(modeSwitch);
        modeSwitchContainer.appendChild(modeInfoIcon);
        
        // Store references for syncing on reload
        this.modeSwitch = modeSwitch;
        this.simpleBtn = simpleBtn;
        this.extendedBtn = extendedBtn;
        
        // Preset buttons container - compact pill style
        const presetBtns = document.createElement("div");
        presetBtns.style.cssText = `
            display: flex;
            align-items: center;
            background: rgba(0,0,0,0.3);
            border-radius: 4px;
            overflow: hidden;
            border: 1px solid ${this.theme.primaryLight};
        `;
        
        // Save button
        const globalSaveBtn = document.createElement("button");
        globalSaveBtn.style.cssText = `
            padding: 4px 8px;
            background: transparent;
            border: none;
            color: ${this.theme.text};
            font-size: 10px;
            cursor: pointer;
            transition: background 0.2s;
            border-right: 1px solid ${this.theme.primaryLight};
        `;
        globalSaveBtn.textContent = "Save";
        globalSaveBtn.title = "Save all fields as preset";
        globalSaveBtn.onmouseenter = () => globalSaveBtn.style.background = this.theme.primaryLight;
        globalSaveBtn.onmouseleave = () => globalSaveBtn.style.background = "transparent";
        globalSaveBtn.addEventListener("click", () => this.showSavePresetModal());
        
        // Load button
        const globalLoadBtn = document.createElement("button");
        globalLoadBtn.style.cssText = `
            padding: 4px 8px;
            background: transparent;
            border: none;
            color: ${this.theme.text};
            font-size: 10px;
            cursor: pointer;
            transition: background 0.2s;
            border-right: 1px solid ${this.theme.primaryLight};
        `;
        globalLoadBtn.textContent = "Load";
        globalLoadBtn.title = "Load preset";
        globalLoadBtn.onmouseenter = () => globalLoadBtn.style.background = this.theme.primaryLight;
        globalLoadBtn.onmouseleave = () => globalLoadBtn.style.background = "transparent";
        globalLoadBtn.addEventListener("click", (e) => this.showGlobalPresetsLoadOnly(e.target));
        
        // More button
        const moreBtn = document.createElement("button");
        moreBtn.style.cssText = `
            padding: 4px 8px;
            background: transparent;
            border: none;
            color: ${this.theme.text};
            font-size: 10px;
            cursor: pointer;
            transition: background 0.2s;
        `;
        moreBtn.textContent = "☰";
        moreBtn.title = "More actions";
        moreBtn.onmouseenter = () => moreBtn.style.background = this.theme.primaryLight;
        moreBtn.onmouseleave = () => moreBtn.style.background = "transparent";
        moreBtn.addEventListener("click", (e) => this.showMoreMenu(e.target));
        
        presetBtns.appendChild(globalSaveBtn);
        presetBtns.appendChild(globalLoadBtn);
        presetBtns.appendChild(moreBtn);
        
        controls.appendChild(modeSwitchContainer);
        controls.appendChild(presetBtns);
        
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
        
        // Resize all visible textareas and update node size
        setTimeout(() => {
            // Simple mode textareas
            const simpleTextareas = this.fieldsContainer.querySelectorAll('.promptflow-field textarea');
            simpleTextareas.forEach(ta => this.autoResizeTextarea(ta));
            // Extended mode textareas (only expanded ones)
            const accordionTextareas = this.fieldsContainer.querySelectorAll('.promptflow-accordion-content.expanded textarea');
            accordionTextareas.forEach(ta => this.autoResizeTextarea(ta));
            this.updateNodeSize?.();
        }, 100);
    }
    
    // Sync UI elements with current data (called after reload)
    syncUI() {
        // Sync mode switch buttons
        const currentMode = this.data.mode || "simple";
        if (this.simpleBtn && this.extendedBtn) {
            this.simpleBtn.classList.toggle("active", currentMode === "simple");
            this.extendedBtn.classList.toggle("active", currentMode === "extended");
        }
        
        // Rebuild fields to match current mode
        this.rebuildFields();
        
        // Update negative textarea
        const negTextarea = this.container?.querySelector('.promptflow-negative textarea');
        if (negTextarea) {
            negTextarea.value = this.data.negative || "";
        }
        
        // Update preview
        this.updatePreview();
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
        
        const currentValue = this.data.categories[field.id]?.value || "";
        
        // Save button (💾) - only visible when field has content
        const saveBtn = document.createElement("button");
        saveBtn.className = "promptflow-icon-btn promptflow-save-btn";
        saveBtn.innerHTML = "💾";
        saveBtn.title = "Save as preset";
        saveBtn.style.opacity = currentValue.trim() ? "1" : "0";
        saveBtn.style.pointerEvents = currentValue.trim() ? "auto" : "none";
        saveBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const value = this.data.categories[field.id]?.value?.trim();
            if (value) {
                this.showSaveCategoryPresetModal(field.id, value);
            }
        });
        
        // Load button (📂) - shows presets dropdown
        const loadBtn = document.createElement("button");
        loadBtn.className = "promptflow-icon-btn promptflow-load-btn";
        loadBtn.innerHTML = "📂";
        loadBtn.title = "Load preset";
        loadBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            await this.showCategoryPresetsLoadOnly(field.id, e.target);
        });
        
        controls.appendChild(saveBtn);
        controls.appendChild(loadBtn);
        header.appendChild(label);
        header.appendChild(controls);
        
        // Store reference for updating visibility
        this._fieldSaveBtns = this._fieldSaveBtns || {};
        this._fieldSaveBtns[field.id] = saveBtn;
        
        // Textarea
        const textarea = document.createElement("textarea");
        textarea.className = "promptflow-field-textarea";
        textarea.placeholder = field.placeholder;
        textarea.value = currentValue;
        textarea.title = "Tip: Use {option1|option2|option3} for random selection wildcards";
        textarea.addEventListener("input", (e) => {
            if (!this.data.categories[field.id]) {
                this.data.categories[field.id] = { value: "", mode: "fixed" };
            }
            this.data.categories[field.id].value = e.target.value;
            this.saveData();
            this.updatePreview();
            this.autoResizeTextarea(textarea);
            
            // Update save button visibility
            const hasContent = e.target.value.trim().length > 0;
            saveBtn.style.opacity = hasContent ? "1" : "0";
            saveBtn.style.pointerEvents = hasContent ? "auto" : "none";
        });
        // Save undo state on blur (not every keystroke)
        textarea.addEventListener("blur", () => this.saveUndoState());
        textarea.addEventListener("contextmenu", (e) => this.showContextMenu(e, field.id, textarea));
        
        // Auto-resize on initial load (delay for DOM to render)
        setTimeout(() => this.autoResizeTextarea(textarea), 50);
        
        fieldEl.appendChild(header);
        fieldEl.appendChild(textarea);
        
        return fieldEl;
    }
    
    createAccordionField(field) {
        const accordion = document.createElement("div");
        accordion.className = "promptflow-accordion";
        accordion.dataset.fieldId = field.id;
        
        const isExpanded = this.data.expandedCategories?.includes(field.id) ?? false;
        const fieldData = this.data.categories[field.id] || { value: "", mode: "fixed" };
        
        // Drag events on accordion for drop targets
        accordion.addEventListener("dragover", (e) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        });
        
        accordion.addEventListener("drop", (e) => {
            e.preventDefault();
            this.clearDropIndicator();
            
            if (!this.draggedFieldId || this.draggedFieldId === field.id) return;
            
            // Determine insert position based on cursor Y relative to this accordion's midpoint
            const rect = accordion.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            const insertAfter = e.clientY >= midpoint;
            
            this.reorderFieldsWithPosition(this.draggedFieldId, field.id, insertAfter);
        });
        
        // Header (this is the draggable part, not the whole accordion)
        const header = document.createElement("div");
        header.className = "promptflow-accordion-header";
        header.draggable = true;
        
        // Drag events on header only - so text selection in textarea works
        header.addEventListener("dragstart", (e) => {
            e.stopPropagation();
            accordion.classList.add("dragging");
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", field.id);
            this.draggedFieldId = field.id;
        });
        
        header.addEventListener("dragend", () => {
            accordion.classList.remove("dragging");
            this.clearDropIndicator();
            this.draggedFieldId = null;
        });
        
        const left = document.createElement("div");
        left.className = "promptflow-accordion-left";
        
        const toggle = document.createElement("span");
        toggle.className = `promptflow-accordion-toggle ${isExpanded ? "expanded" : ""}`;
        toggle.textContent = isExpanded ? "▼" : "▶";
        
        const label = document.createElement("span");
        label.className = "promptflow-accordion-label";
        label.textContent = field.label;
        
        left.appendChild(toggle);
        left.appendChild(label);
        
        const right = document.createElement("div");
        right.className = "promptflow-accordion-right";
        
        // Save button (💾) - only visible when field has content
        const saveBtn = document.createElement("button");
        saveBtn.className = "promptflow-icon-btn promptflow-save-btn";
        saveBtn.innerHTML = "💾";
        saveBtn.title = "Save as preset";
        saveBtn.style.opacity = fieldData.value?.trim() ? "1" : "0";
        saveBtn.style.pointerEvents = fieldData.value?.trim() ? "auto" : "none";
        saveBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const currentValue = this.data.categories[field.id]?.value?.trim();
            if (currentValue) {
                this.showSaveCategoryPresetModal(field.id, currentValue);
            }
        });
        
        // Load button (📂) - shows presets dropdown
        const loadBtn = document.createElement("button");
        loadBtn.className = "promptflow-icon-btn promptflow-load-btn";
        loadBtn.innerHTML = "📂";
        loadBtn.title = "Load preset";
        loadBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            await this.showCategoryPresetsLoadOnly(field.id, e.target);
        });
        
        // Mode badge
        const modeBadge = document.createElement("span");
        modeBadge.className = "promptflow-mode-badge";
        modeBadge.textContent = fieldData.mode || "fixed";
        modeBadge.title = `Click to cycle: FIXED → RANDOM → INCREMENT → DECREMENT

• FIXED: Always first wildcard option
• RANDOM: Random option each time
• INCREMENT: Cycle options with seed (for batch)
• DECREMENT: Reverse cycle with seed`;
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
        
        right.appendChild(saveBtn);
        right.appendChild(loadBtn);
        right.appendChild(dragHandle);
        
        // Store reference to save button for updating visibility
        this._fieldSaveBtns = this._fieldSaveBtns || {};
        this._fieldSaveBtns[field.id] = saveBtn;
        
        header.appendChild(left);
        header.appendChild(right);
        
        // Content
        const content = document.createElement("div");
        content.className = `promptflow-accordion-content ${isExpanded ? "expanded" : ""}`;
        
        const textarea = document.createElement("textarea");
        textarea.className = "promptflow-field-textarea";
        textarea.placeholder = field.placeholder;
        textarea.value = fieldData.value || "";
        textarea.title = "Tip: Use {option1|option2|option3} for random selection wildcards";
        textarea.addEventListener("input", (e) => {
            if (!this.data.categories[field.id]) {
                this.data.categories[field.id] = { value: "", mode: "fixed" };
            }
            this.data.categories[field.id].value = e.target.value;
            this.saveData();
            this.updatePreview();
            this.autoResizeTextarea(textarea);
            
            // Update save button visibility
            const hasContent = e.target.value.trim().length > 0;
            if (this._fieldSaveBtns && this._fieldSaveBtns[field.id]) {
                this._fieldSaveBtns[field.id].style.opacity = hasContent ? "1" : "0";
                this._fieldSaveBtns[field.id].style.pointerEvents = hasContent ? "auto" : "none";
            }
        });
        // Save undo state on blur (not every keystroke)
        textarea.addEventListener("blur", () => this.saveUndoState());
        textarea.addEventListener("contextmenu", (e) => this.showContextMenu(e, field.id, textarea));
        
        // Auto-resize on initial load (only if expanded and visible)
        if (isExpanded) {
            setTimeout(() => this.autoResizeTextarea(textarea), 50);
        }
        
        content.appendChild(textarea);
        
        // Double-click to collapse/expand all
        header.addEventListener("dblclick", (e) => {
            e.stopPropagation();
            // If any are expanded, collapse all; otherwise expand all
            const hasExpanded = this.data.expandedCategories?.length > 0;
            if (hasExpanded) {
                this.collapseAll();
            } else {
                this.expandAll();
            }
        });
        
        // Toggle handler (single click)
        header.addEventListener("click", () => {
            const isNowExpanded = !content.classList.contains("expanded");
            content.classList.toggle("expanded");
            toggle.classList.toggle("expanded");
            toggle.textContent = isNowExpanded ? "▼" : "▶";
            
            if (isNowExpanded) {
                if (!this.data.expandedCategories) {
                    this.data.expandedCategories = [];
                }
                if (!this.data.expandedCategories.includes(field.id)) {
                    this.data.expandedCategories.push(field.id);
                }
                // Resize textarea now that it's visible
                setTimeout(() => this.autoResizeTextarea(textarea), 10);
            } else {
                this.data.expandedCategories = this.data.expandedCategories?.filter(id => id !== field.id) || [];
            }
            this.saveData();
            
            // Update node size after accordion toggle
            setTimeout(() => this.updateNodeSize?.(), 50);
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
        
        const currentValue = this.data.negative || "";
        
        // Save button (💾)
        const saveBtn = document.createElement("button");
        saveBtn.className = "promptflow-icon-btn promptflow-save-btn";
        saveBtn.innerHTML = "💾";
        saveBtn.title = "Save as preset";
        saveBtn.style.opacity = currentValue.trim() ? "1" : "0";
        saveBtn.style.pointerEvents = currentValue.trim() ? "auto" : "none";
        saveBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const value = this.data.negative?.trim();
            if (value) {
                this.showSaveCategoryPresetModal("negative", value);
            }
        });
        
        // Load button (📂)
        const loadBtn = document.createElement("button");
        loadBtn.className = "promptflow-icon-btn promptflow-load-btn";
        loadBtn.innerHTML = "📂";
        loadBtn.title = "Load preset";
        loadBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            await this.showCategoryPresetsLoadOnly("negative", e.target);
        });
        
        controls.appendChild(saveBtn);
        controls.appendChild(loadBtn);
        header.appendChild(label);
        header.appendChild(controls);
        
        const textarea = document.createElement("textarea");
        textarea.className = "promptflow-field-textarea";
        textarea.placeholder = "Negative prompt...";
        textarea.value = currentValue;
        textarea.addEventListener("input", (e) => {
            this.data.negative = e.target.value;
            this.saveData();
            this.autoResizeTextarea(textarea);
            
            // Update save button visibility
            const hasContent = e.target.value.trim().length > 0;
            saveBtn.style.opacity = hasContent ? "1" : "0";
            saveBtn.style.pointerEvents = hasContent ? "auto" : "none";
        });
        textarea.addEventListener("contextmenu", (e) => this.showContextMenu(e, "negative", textarea));
        
        // Auto-resize on initial load
        setTimeout(() => this.autoResizeTextarea(textarea), 0);
        
        negativeSection.appendChild(header);
        negativeSection.appendChild(textarea);
        this.container.appendChild(negativeSection);
    }
    
    buildDonationBanner() {
        // Session-based dismissal - shows again on refresh/new workflow
        const bannerDismissKey = `promptflow_banner_dismissed`;
        const isBannerDismissed = sessionStorage.getItem(bannerDismissKey) === "true";
        
        if (isBannerDismissed) return;
        
        const theme = this.theme;
        const donationBanner = document.createElement("div");
        
        // Use blue/purple gradient for Umbrael's Umbrage, otherwise use theme colors
        const bannerGradient = globalSettings.theme === "umbrael" 
            ? "linear-gradient(135deg, rgba(66, 153, 225, 0.25), rgba(168, 85, 247, 0.25))"
            : `linear-gradient(135deg, ${theme.primaryLight}, ${theme.primaryDark.replace('0.6', '0.25')})`;
        
        donationBanner.style.cssText = `
            margin-top: 12px;
            padding: 12px;
            background: ${bannerGradient};
            border: 1px solid ${theme.primary};
            border-radius: 8px;
            position: relative;
        `;

        const bannerContent = document.createElement("div");
        bannerContent.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        const heartIcon = document.createElement("span");
        heartIcon.textContent = "💝";
        heartIcon.style.cssText = `
            font-size: 20px;
        `;

        const bannerText = document.createElement("div");
        bannerText.style.cssText = `
            flex: 1;
            color: rgba(255, 255, 255, 0.9);
            font-size: 12px;
            line-height: 1.4;
        `;
        bannerText.innerHTML = `
            <strong style="color: ${theme.accent};">PromptFlow is free & open source!</strong><br>
            If you find it useful, consider <a href="https://ko-fi.com/maartenharms" target="_blank" style="color: ${theme.accent}; text-decoration: underline;">supporting development</a> ☕
        `;

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "×";
        closeBtn.title = "Dismiss (for this session)";
        closeBtn.style.cssText = `
            position: absolute;
            top: 4px;
            right: 4px;
            width: 20px;
            height: 20px;
            padding: 0;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            color: rgba(255, 255, 255, 0.7);
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        `;
        
        closeBtn.onmouseenter = () => {
            closeBtn.style.background = "rgba(255, 255, 255, 0.2)";
            closeBtn.style.color = "#fff";
        };
        
        closeBtn.onmouseleave = () => {
            closeBtn.style.background = "rgba(255, 255, 255, 0.1)";
            closeBtn.style.color = "rgba(255, 255, 255, 0.7)";
        };

        closeBtn.onclick = () => {
            sessionStorage.setItem(bannerDismissKey, "true");
            donationBanner.style.animation = "fadeOut 0.3s ease-out";
            setTimeout(() => {
                donationBanner.remove();
                this.updateNodeSize?.();
            }, 300);
        };

        bannerContent.appendChild(heartIcon);
        bannerContent.appendChild(bannerText);
        donationBanner.appendChild(bannerContent);
        donationBanner.appendChild(closeBtn);
        this.container.appendChild(donationBanner);
        
        // Make the Ko-fi link actually clickable (canvas may block default behavior)
        const kofiLink = bannerText.querySelector('a');
        if (kofiLink) {
            kofiLink.style.cursor = 'pointer';
            kofiLink.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open('https://ko-fi.com/maartenharms', '_blank');
            };
        }
    }
    
    // NOTE: Preview and Variations functionality moved to separate PromptFlowVariations node
    
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
        const wildcards = [];
        
        // Pattern for inline wildcards: {option1|option2|option3}
        const inlinePattern = /\{([^}]+)\}/g;
        let match;
        
        while ((match = inlinePattern.exec(text)) !== null) {
            const options = match[1].split("|").map(o => o.trim()).filter(o => o);
            if (options.length > 1) {
                wildcards.push({
                    type: "inline",
                    full: match[0],
                    options: options
                });
            }
        }
        
        // Pattern for file-based wildcards: __name__ or __path/name__
        const filePattern = /__([a-zA-Z0-9_\-\/]+)__/g;
        
        while ((match = filePattern.exec(text)) !== null) {
            wildcards.push({
                type: "file",
                full: match[0],
                name: match[1],
                options: null  // Will be loaded async
            });
        }
        
        if (wildcards.length > 0) {
            console.log("[PromptFlow] Extracted wildcards:", wildcards.map(w => ({ type: w.type, full: w.full, name: w.name })));
        }
        
        return wildcards;
    }
    
    /**
     * Extract wildcards and load file-based wildcard contents
     * @param {string} text - The prompt text
     * @returns {Promise<Array>} Wildcards with options loaded
     */
    async extractWildcardsAsync(text) {
        const wildcards = this.extractWildcards(text);
        
        // Load file-based wildcard contents
        for (const wildcard of wildcards) {
            if (wildcard.type === "file" && wildcard.options === null) {
                const options = await getWildcardContents(wildcard.name);
                wildcard.options = options || [];
                wildcard.notFound = options === null;
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
        
        // Get current value for this category
        const currentValue = category === "negative" 
            ? this.data.negative 
            : this.data.categories[category]?.value;
        
        // Save Current option at top (only if there's content to save)
        if (currentValue && currentValue.trim()) {
            const saveItem = document.createElement("div");
            saveItem.className = "promptflow-preset-item";
            saveItem.style.borderBottom = `1px solid ${this.theme.primaryLight}`;
            saveItem.innerHTML = `<span style="color: ${this.theme.accent};">💾 Save Current...</span>`;
            saveItem.addEventListener("click", () => {
                dropdown.remove();
                this.showSaveCategoryPresetModal(category, currentValue.trim());
            });
            dropdown.appendChild(saveItem);
        }
        
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
            empty.style.color = this.theme.textDim;
            empty.style.cursor = "default";
            if (currentValue && currentValue.trim()) {
                empty.textContent = "No saved presets yet";
            } else {
                empty.innerHTML = "No presets available<br><span style='font-size: 10px; opacity: 0.7;'>Add content to save as preset</span>";
            }
            dropdown.appendChild(empty);
        }
        
        // Position dropdown
        const rect = targetEl.getBoundingClientRect();
        dropdown.style.position = "fixed";
        dropdown.style.top = `${rect.bottom + 4}px`;
        dropdown.style.left = `${rect.left}px`;
        
        document.body.appendChild(dropdown);
        
        // Close on outside click or scroll
        const closeHandler = (e) => {
            if (!dropdown.contains(e.target) && e.target !== targetEl) {
                dropdown.remove();
                document.removeEventListener("click", closeHandler);
                document.removeEventListener("scroll", scrollHandler, true);
            }
        };
        const scrollHandler = (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener("click", closeHandler);
                document.removeEventListener("scroll", scrollHandler, true);
            }
        };
        setTimeout(() => {
            document.addEventListener("click", closeHandler);
            document.addEventListener("scroll", scrollHandler, true);
        }, 0);
    }
    
    async showCategoryPresetsLoadOnly(category, targetEl) {
        // Remove any existing dropdown
        document.querySelectorAll(".promptflow-preset-dropdown").forEach(el => el.remove());
        
        const dropdown = document.createElement("div");
        dropdown.className = "promptflow-preset-dropdown";
        
        // Get presets for this category
        const builtins = await loadBuiltinPresets();
        const custom = getCustomPresets("categories");
        
        // Map category to preset type
        const presetMap = {
            "style": "styles",
            "quality": "quality",
            "negative": "negatives"
        };
        
        const presetType = presetMap[category];
        const builtinItems = presetType ? (builtins[presetType] || []) : [];
        const customItems = custom[category] || [];
        
        // Built-in presets
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
            divider.textContent = "Saved";
            dropdown.appendChild(divider);
            
            customItems.forEach((preset, idx) => {
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
                
                // Delete button
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "promptflow-preset-delete";
                deleteBtn.textContent = "×";
                deleteBtn.title = "Delete preset";
                deleteBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.deleteCategoryPreset(category, idx);
                    item.remove();
                });
                
                item.appendChild(content);
                item.appendChild(deleteBtn);
                dropdown.appendChild(item);
            });
        }
        
        if (builtinItems.length === 0 && customItems.length === 0) {
            const empty = document.createElement("div");
            empty.className = "promptflow-preset-item";
            empty.style.color = this.theme.textDim;
            empty.style.cursor = "default";
            empty.innerHTML = "No presets available<br><span style='font-size: 10px; opacity: 0.7;'>Use 💾 to save current content</span>";
            dropdown.appendChild(empty);
        }
        
        // Position dropdown
        const rect = targetEl.getBoundingClientRect();
        dropdown.style.position = "fixed";
        dropdown.style.top = `${rect.bottom + 4}px`;
        dropdown.style.left = `${rect.left}px`;
        
        document.body.appendChild(dropdown);
        
        // Close on outside click or scroll
        const closeHandler = (e) => {
            if (!dropdown.contains(e.target) && e.target !== targetEl) {
                dropdown.remove();
                document.removeEventListener("click", closeHandler);
                document.removeEventListener("scroll", scrollHandler, true);
            }
        };
        const scrollHandler = (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener("click", closeHandler);
                document.removeEventListener("scroll", scrollHandler, true);
            }
        };
        setTimeout(() => {
            document.addEventListener("click", closeHandler);
            document.addEventListener("scroll", scrollHandler, true);
        }, 0);
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
    
    showSaveCategoryPresetModal(category, value) {
        const maxLength = 32;
        const theme = this.theme;
        
        const overlay = document.createElement("div");
        overlay.className = "promptflow-modal-overlay";
        
        const modal = document.createElement("div");
        modal.className = "promptflow-modal";
        modal.style.minWidth = "320px";
        
        const title = document.createElement("div");
        title.className = "promptflow-modal-title";
        title.textContent = `Save ${category.charAt(0).toUpperCase() + category.slice(1)} Preset`;
        
        // Preview of what will be saved
        const preview = document.createElement("div");
        preview.style.cssText = `
            font-size: 11px;
            color: ${theme.textDim};
            background: rgba(0,0,0,0.2);
            padding: 8px;
            border-radius: 4px;
            margin-bottom: 12px;
            max-height: 60px;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        preview.textContent = value.length > 100 ? value.substring(0, 100) + "..." : value;
        
        const input = document.createElement("input");
        input.type = "text";
        input.className = "promptflow-modal-input";
        input.placeholder = "Enter preset name...";
        input.maxLength = maxLength;
        input.style.marginBottom = "8px";
        
        // Character count
        const charCount = document.createElement("div");
        charCount.style.cssText = `
            color: rgba(255, 255, 255, 0.5);
            font-size: 11px;
            text-align: right;
            margin-bottom: 12px;
        `;
        charCount.textContent = `0/${maxLength}`;
        
        input.addEventListener("input", () => {
            charCount.textContent = `${input.value.length}/${maxLength}`;
            if (input.value.length >= maxLength) {
                charCount.style.color = 'rgba(239, 68, 68, 0.9)';
            } else {
                charCount.style.color = 'rgba(255, 255, 255, 0.5)';
            }
        });
        
        // Save function
        const doSave = () => {
            const name = input.value.trim();
            if (name) {
                saveCustomPreset("categories", {
                    category: category,
                    name: name,
                    value: value
                });
                showNotification(`Preset "${name}" saved to ${category}`, "success");
                overlay.remove();
            }
        };
        
        // Enter key to save, Escape to cancel
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                doSave();
            } else if (e.key === "Escape") {
                overlay.remove();
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
        modal.appendChild(preview);
        modal.appendChild(input);
        modal.appendChild(charCount);
        modal.appendChild(buttons);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Focus input
        setTimeout(() => input.focus(), 100);
        
        // Close on overlay click
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
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
        // Toggle: if this dropdown is already open, close it
        const existing = document.querySelector('.promptflow-preset-dropdown[data-owner="presets"]');
        if (existing) {
            existing.remove();
            return;
        }
        
        // Remove any other dropdowns
        document.querySelectorAll(".promptflow-preset-dropdown").forEach(el => el.remove());
        
        const presets = getCustomPresets("global");
        
        const dropdown = document.createElement("div");
        dropdown.className = "promptflow-preset-dropdown";
        dropdown.dataset.owner = "presets";
        
        // Save Current option at top
        const saveItem = document.createElement("div");
        saveItem.className = "promptflow-preset-item";
        saveItem.style.borderBottom = `1px solid ${this.theme.primaryLight}`;
        saveItem.innerHTML = `<span style="color: ${this.theme.accent};">💾 Save Current...</span>`;
        saveItem.addEventListener("click", () => {
            dropdown.remove();
            this.showSavePresetModal();
        });
        dropdown.appendChild(saveItem);
        
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
                });
                
                item.appendChild(content);
                item.appendChild(deleteBtn);
                dropdown.appendChild(item);
            });
        } else {
            const empty = document.createElement("div");
            empty.className = "promptflow-preset-item";
            empty.textContent = "No saved presets yet";
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
        
        // Close on outside click or scroll
        const closeHandler = (e) => {
            if (!dropdown.contains(e.target) && e.target !== targetEl) {
                dropdown.remove();
                document.removeEventListener("click", closeHandler);
                document.removeEventListener("scroll", scrollHandler, true);
            }
        };
        const scrollHandler = (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener("click", closeHandler);
                document.removeEventListener("scroll", scrollHandler, true);
            }
        };
        setTimeout(() => {
            document.addEventListener("click", closeHandler);
            document.addEventListener("scroll", scrollHandler, true);
        }, 0);
    }
    
    showGlobalPresetsLoadOnly(targetEl) {
        // Toggle: if this dropdown is already open, close it
        const existing = document.querySelector('.promptflow-preset-dropdown[data-owner="presets-load"]');
        if (existing) {
            existing.remove();
            return;
        }
        
        // Remove any other dropdowns
        document.querySelectorAll(".promptflow-preset-dropdown").forEach(el => el.remove());
        
        const presets = getCustomPresets("global");
        
        const dropdown = document.createElement("div");
        dropdown.className = "promptflow-preset-dropdown";
        dropdown.dataset.owner = "presets-load";
        
        // Add "Blank" preset at the top - resets everything to default
        const blankItem = document.createElement("div");
        blankItem.className = "promptflow-preset-item";
        blankItem.style.borderBottom = `1px solid ${this.theme.primaryLight}`;
        
        const blankContent = document.createElement("div");
        blankContent.className = "promptflow-preset-item-content";
        blankContent.innerHTML = `
            <div class="promptflow-preset-item-name" style="color: ${this.theme.accent};">🗑️ Blank</div>
            <div class="promptflow-preset-item-preview">Reset all fields</div>
        `;
        blankContent.addEventListener("click", () => {
            this.loadBlankPreset();
            dropdown.remove();
        });
        
        blankItem.appendChild(blankContent);
        dropdown.appendChild(blankItem);
        
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
                });
                
                item.appendChild(content);
                item.appendChild(deleteBtn);
                dropdown.appendChild(item);
            });
        }
        
        // Position dropdown
        const rect = targetEl.getBoundingClientRect();
        dropdown.style.position = "fixed";
        dropdown.style.top = `${rect.bottom + 4}px`;
        dropdown.style.left = `${rect.left}px`;
        
        document.body.appendChild(dropdown);
        
        // Close on outside click or scroll
        const closeHandler = (e) => {
            if (!dropdown.contains(e.target) && e.target !== targetEl) {
                dropdown.remove();
                document.removeEventListener("click", closeHandler);
                document.removeEventListener("scroll", scrollHandler, true);
            }
        };
        const scrollHandler = (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener("click", closeHandler);
                document.removeEventListener("scroll", scrollHandler, true);
            }
        };
        setTimeout(() => {
            document.addEventListener("click", closeHandler);
            document.addEventListener("scroll", scrollHandler, true);
        }, 0);
    }
    
    loadGlobalPreset(index) {
        const presets = getCustomPresets("global");
        const preset = presets[index];
        
        if (preset) {
            this.data = { ...this.data, ...preset.data };
            this.saveData();
            this.rebuildFields();
            this.updatePreview();
            this.updateVariationsPanel();
            
            // Update negative textarea
            const negTextarea = this.container.querySelector(".promptflow-negative textarea");
            if (negTextarea) {
                negTextarea.value = this.data.negative || "";
            }
        }
    }
    
    loadBlankPreset() {
        // Reset to default state
        const currentMode = this.data.mode || "simple";
        const defaultFields = currentMode === "simple" ? SIMPLE_FIELDS : EXTENDED_FIELDS;
        
        // Clear all categories
        this.data.categories = {};
        defaultFields.forEach(field => {
            this.data.categories[field.id] = { value: "", mode: "fixed" };
        });
        
        // Reset category order to default
        this.data.categoryOrder = defaultFields.map(f => f.id);
        
        // Reset expanded categories to default (first few expanded)
        if (currentMode === "simple") {
            this.data.expandedCategories = ["main_prompt", "style", "quality"];
        } else {
            this.data.expandedCategories = ["subject"];
        }
        
        // Clear negative prompt
        this.data.negative = "";
        
        // Save and rebuild
        this.saveUndoState();
        this.saveData();
        this.rebuildFields();
        this.updatePreview();
        this.updateVariationsPanel();
        
        // Update negative textarea
        const negTextarea = this.container.querySelector(".promptflow-negative textarea");
        if (negTextarea) {
            negTextarea.value = "";
            this.autoResizeTextarea(negTextarea);
        }
    }
    
    showSavePresetModal() {
        const maxLength = 32;
        const theme = this.theme;
        
        // Add shake animation keyframes if not present
        if (!document.querySelector('#promptflow-dialog-animations')) {
            const style = document.createElement('style');
            style.id = 'promptflow-dialog-animations';
            style.textContent = `
                @keyframes promptflowDialogShake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
                    20%, 40%, 60%, 80% { transform: translateX(6px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        const overlay = document.createElement("div");
        overlay.className = "promptflow-modal-overlay";
        
        const modal = document.createElement("div");
        modal.className = "promptflow-modal";
        modal.style.minWidth = "320px";
        modal.style.transition = "border-color 0.15s, box-shadow 0.15s";
        
        // Store original styles for reset
        const originalBorder = `1px solid ${theme.primaryLight}`;
        const originalShadow = '0 8px 32px rgba(0, 0, 0, 0.6)';
        
        const title = document.createElement("div");
        title.className = "promptflow-modal-title";
        title.textContent = "Save Preset";
        
        const input = document.createElement("input");
        input.type = "text";
        input.className = "promptflow-modal-input";
        input.placeholder = "Enter preset name...";
        input.maxLength = maxLength;
        input.style.marginBottom = "8px";
        
        // Character count and limit warning row
        const inputInfoRow = document.createElement("div");
        inputInfoRow.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            min-height: 20px;
        `;
        
        const limitWarning = document.createElement("div");
        limitWarning.style.cssText = `
            color: rgba(239, 68, 68, 0.9);
            font-size: 11px;
            font-weight: 500;
            opacity: 0;
            transition: opacity 0.2s;
        `;
        limitWarning.textContent = `Maximum ${maxLength} characters`;
        
        const charCount = document.createElement("div");
        charCount.style.cssText = `
            color: rgba(255, 255, 255, 0.5);
            font-size: 11px;
            margin-left: auto;
        `;
        charCount.textContent = `0/${maxLength}`;
        
        inputInfoRow.appendChild(limitWarning);
        inputInfoRow.appendChild(charCount);
        
        // Shake animation function
        const shakeModal = () => {
            modal.style.animation = 'none';
            modal.offsetHeight; // Trigger reflow
            modal.style.animation = 'promptflowDialogShake 0.4s ease-in-out';
        };
        
        // Flash red function
        const flashRed = () => {
            modal.style.border = '2px solid rgba(239, 68, 68, 0.9)';
            modal.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(239, 68, 68, 0.4)';
            limitWarning.style.opacity = '1';
            
            setTimeout(() => {
                modal.style.border = originalBorder;
                modal.style.boxShadow = originalShadow;
            }, 300);
        };
        
        // Input handler for character limit
        input.addEventListener("input", () => {
            charCount.textContent = `${input.value.length}/${maxLength}`;
            
            if (input.value.length >= maxLength) {
                charCount.style.color = 'rgba(239, 68, 68, 0.9)';
                flashRed();
                shakeModal();
            } else if (input.value.length >= maxLength * 0.8) {
                charCount.style.color = 'rgba(234, 179, 8, 0.9)';
                limitWarning.style.opacity = '0';
            } else {
                charCount.style.color = 'rgba(255, 255, 255, 0.5)';
                limitWarning.style.opacity = '0';
            }
        });
        
        // Save function
        const doSave = () => {
            const name = input.value.trim();
            if (name) {
                saveCustomPreset("global", {
                    name,
                    created: new Date().toISOString(),
                    data: { ...this.data }
                });
                showNotification(`Preset "${name}" saved`, "success");
                console.log("[PromptFlow] Preset saved successfully:", name);
                overlay.remove();
            }
        };
        
        // Enter key to save, Escape to cancel
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                doSave();
            } else if (e.key === "Escape") {
                overlay.remove();
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
        modal.appendChild(inputInfoRow);
        modal.appendChild(buttons);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Focus and select input
        setTimeout(() => {
            input.focus();
            input.select();
        }, 100);
        
        // Close on overlay click
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }
    
    showImportModal() {
        const theme = this.theme;
        
        const overlay = document.createElement("div");
        overlay.className = "promptflow-modal-overlay";
        
        const modal = document.createElement("div");
        modal.className = "promptflow-modal";
        modal.style.minWidth = "400px";
        
        const title = document.createElement("div");
        title.className = "promptflow-modal-title";
        title.textContent = "Import Prompt";
        
        const description = document.createElement("div");
        description.style.cssText = `
            color: ${theme.textMuted};
            font-size: 11px;
            margin-bottom: 12px;
            line-height: 1.5;
        `;
        description.innerHTML = `Paste a comma-separated prompt. Tags will be auto-categorized into fields.<br>
        <span style="color: ${theme.accent}">Tip:</span> Use {option1|option2} for wildcards.`;
        
        const textarea = document.createElement("textarea");
        textarea.className = "promptflow-modal-input";
        textarea.placeholder = "Paste your prompt here...\nExample: 1girl, long hair, blue eyes, standing, forest background, digital art";
        textarea.style.cssText = `
            height: 120px;
            resize: vertical;
            font-family: inherit;
            line-height: 1.5;
        `;
        
        const buttonRow = document.createElement("div");
        buttonRow.className = "promptflow-modal-buttons";
        
        const cancelBtn = document.createElement("button");
        cancelBtn.className = "promptflow-modal-btn promptflow-modal-btn-secondary";
        cancelBtn.textContent = "Cancel";
        cancelBtn.addEventListener("click", () => overlay.remove());
        
        const importBtn = document.createElement("button");
        importBtn.className = "promptflow-modal-btn promptflow-modal-btn-primary";
        importBtn.textContent = "Import";
        importBtn.addEventListener("click", () => {
            const text = textarea.value.trim();
            if (text) {
                this.importFromText(text);
                overlay.remove();
                showNotification("Prompt imported", "success");
            }
        });
        
        buttonRow.appendChild(cancelBtn);
        buttonRow.appendChild(importBtn);
        
        modal.appendChild(title);
        modal.appendChild(description);
        modal.appendChild(textarea);
        modal.appendChild(buttonRow);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        setTimeout(() => textarea.focus(), 100);
        
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.remove();
        });
        
        // Handle Escape key
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
    
    reorderFieldsWithPosition(draggedId, targetId, insertAfter) {
        const order = [...this.data.categoryOrder];
        const draggedIdx = order.indexOf(draggedId);
        const targetIdx = order.indexOf(targetId);
        
        if (draggedIdx === -1 || targetIdx === -1) return;
        if (draggedId === targetId) return;
        
        // Remove dragged item
        order.splice(draggedIdx, 1);
        
        // Calculate new insert position
        let newTargetIdx = order.indexOf(targetId);
        if (insertAfter) {
            newTargetIdx += 1;
        }
        
        // Insert at new position
        order.splice(newTargetIdx, 0, draggedId);
        
        this.data.categoryOrder = order;
        this.saveData();
        this.rebuildFields();
        this.updatePreview();
        
        console.log("[PromptFlow] Reordered fields:", order);
    }
    
    clearAllFields() {
        // Clear all category values
        for (const key in this.data.categories) {
            this.data.categories[key] = { value: "", mode: "fixed" };
        }
        
        // Clear negative prompt
        this.data.negative = "";
        
        // Update the negative textarea directly if it exists
        const negTextarea = this.container.querySelector('.promptflow-negative textarea');
        if (negTextarea) {
            negTextarea.value = "";
        }
        
        this.saveData();
        this.rebuildFields();
        this.updatePreview();
        this.updateVariationsPanel();
        
        showNotification("All fields cleared", "success");
        console.log("[PromptFlow] All fields cleared");
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
            const extendedOnlyFields = ["subject", "character", "expression", "outfit", "pose", "location", "camera", "lighting", "custom"];
            
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
        description.style.color = "#9ca3af";
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
        previewLabel.style.color = "#9ca3af";
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
            
            categorized = autoCategorize(text, this.data.mode);
            previewContainer.style.display = "block";
            
            // Build preview - different categories for simple vs extended mode
            previewContent.innerHTML = "";
            
            // For simple mode, merge all non-style/quality into main_prompt for preview
            let previewData = categorized;
            if (this.data.mode === "simple") {
                const mainPromptTags = [];
                const simpleCats = ["style", "quality"];
                
                for (const [category, tags] of Object.entries(categorized)) {
                    if (category === "unmatched") continue;
                    if (simpleCats.includes(category)) continue;
                    mainPromptTags.push(...tags);
                }
                
                previewData = {
                    main_prompt: mainPromptTags,
                    style: categorized.style || [],
                    quality: categorized.quality || []
                };
            }
            
            const categoriesToShow = this.data.mode === "simple" 
                ? ["main_prompt", "style", "quality"]
                : ["subject", "character", "expression", "outfit", "pose", "location", "style", "camera", "lighting", "quality", "custom"];
            
            for (const cat of categoriesToShow) {
                const tags = previewData[cat] || [];
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
        replaceLabel.style.color = "#9ca3af";
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
            let duplicatesRemoved = 0;
            
            // Helper to normalize tags for comparison (lowercase, trim)
            const normalizeTag = (tag) => tag.toLowerCase().trim();
            
            // For simple mode, merge all non-style/quality into main_prompt
            let categoriesToApply = categorized;
            if (this.data.mode === "simple") {
                const mainPromptTags = [];
                const simpleCats = ["style", "quality"];
                
                for (const [category, tags] of Object.entries(categorized)) {
                    if (category === "unmatched") continue;
                    if (simpleCats.includes(category)) continue;
                    mainPromptTags.push(...tags);
                }
                
                categoriesToApply = {
                    main_prompt: mainPromptTags,
                    style: categorized.style || [],
                    quality: categorized.quality || []
                };
            }
            
            // Apply categorized content to fields
            for (const [category, tags] of Object.entries(categoriesToApply)) {
                if (category === "unmatched") continue;
                if (tags.length === 0) continue;
                
                if (!this.data.categories[category]) {
                    this.data.categories[category] = { value: "", mode: "fixed" };
                }
                
                if (replace || !this.data.categories[category].value) {
                    // Remove duplicates within the new tags themselves
                    const seen = new Set();
                    const uniqueTags = tags.filter(tag => {
                        const normalized = normalizeTag(tag);
                        if (seen.has(normalized)) {
                            duplicatesRemoved++;
                            return false;
                        }
                        seen.add(normalized);
                        return true;
                    });
                    this.data.categories[category].value = uniqueTags.join(", ");
                } else {
                    // Append - but remove duplicates that already exist
                    const existing = this.data.categories[category].value.trim();
                    const existingTags = existing.split(",").map(t => t.trim()).filter(t => t);
                    const existingNormalized = new Set(existingTags.map(normalizeTag));
                    
                    const newUniqueTags = tags.filter(tag => {
                        const normalized = normalizeTag(tag);
                        if (existingNormalized.has(normalized)) {
                            duplicatesRemoved++;
                            return false;
                        }
                        existingNormalized.add(normalized); // Prevent duplicates within new tags too
                        return true;
                    });
                    
                    if (newUniqueTags.length > 0) {
                        this.data.categories[category].value = existing 
                            ? `${existing}, ${newUniqueTags.join(", ")}`
                            : newUniqueTags.join(", ");
                    }
                }
            }
            
            this.saveData();
            this.rebuildFields();
            this.updatePreview();
            overlay.remove();
            
            // Show notification with duplicate count
            if (duplicatesRemoved > 0) {
                showNotification(`Auto-sorted! Removed ${duplicatesRemoved} duplicate${duplicatesRemoved > 1 ? 's' : ''}`, "success");
            } else {
                showNotification("Auto-sorted successfully", "success");
            }
            
            console.log(`[PromptFlow] Auto-sorted prompt into categories (${duplicatesRemoved} duplicates removed)`);
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
        // Preview section removed - this method kept for compatibility with existing calls
        // The prompt is visible directly in the node's output connections
    }
    
    showMoreMenu(targetEl) {
        // Toggle: if this dropdown is already open, close it
        const existing = document.querySelector('.promptflow-preset-dropdown[data-owner="more"]');
        if (existing) {
            existing.remove();
            return;
        }
        
        // Remove any other dropdowns
        document.querySelectorAll(".promptflow-preset-dropdown").forEach(el => el.remove());
        
        const dropdown = document.createElement("div");
        dropdown.className = "promptflow-preset-dropdown";
        dropdown.dataset.owner = "more";
        dropdown.style.minWidth = "140px";
        
        // Menu items with icons
        const menuItems = [];
        
        // View Last Generated - shows resolved prompt from last generation
        menuItems.push({
            icon: "📝",
            label: "Last Generated",
            action: () => this.showLastGeneratedPopup(),
            disabled: !this.lastGeneratedPositive
        });
        
        // Auto-Sort available in both modes
        menuItems.push({ 
            icon: "🔀", 
            label: "Auto-Sort", 
            action: () => this.showAutoSortModal(),
            highlight: true
        });
        
        menuItems.push(
            { icon: "🗑️", label: "Clear All", action: () => this.clearAllFields() },
            { icon: "📤", label: "Export Presets", action: () => this.exportPresets() },
            { icon: "📥", label: "Import Presets", action: () => this.importPresets() }
        );
        
        menuItems.forEach((item, idx) => {
            const menuItem = document.createElement("div");
            menuItem.className = "promptflow-preset-item";
            
            // Add separator after Auto-Sort or Last Generated
            if ((item.highlight || item.label === "Last Generated") && idx < menuItems.length - 1) {
                menuItem.style.borderBottom = `1px solid ${this.theme.primaryLight}`;
            }
            
            // Handle disabled items
            if (item.disabled) {
                menuItem.style.opacity = "0.4";
                menuItem.style.cursor = "not-allowed";
            }
            
            const icon = document.createElement("span");
            icon.textContent = item.icon;
            icon.style.marginRight = "8px";
            icon.style.fontSize = "13px";
            
            const label = document.createElement("span");
            label.textContent = item.label;
            if (item.highlight) {
                label.style.color = this.theme.success;
            }
            if (item.disabled) {
                label.textContent += " (run first)";
            }
            
            menuItem.appendChild(icon);
            menuItem.appendChild(label);
            
            if (!item.disabled) {
                menuItem.addEventListener("click", () => {
                    dropdown.remove();
                    item.action();
                });
            }
            
            dropdown.appendChild(menuItem);
        });
        
        // Position dropdown
        const rect = targetEl.getBoundingClientRect();
        dropdown.style.position = "fixed";
        dropdown.style.top = `${rect.bottom + 4}px`;
        dropdown.style.left = `${rect.left}px`;
        
        document.body.appendChild(dropdown);
        
        // Adjust if off-screen
        const dropRect = dropdown.getBoundingClientRect();
        if (dropRect.right > window.innerWidth) {
            dropdown.style.left = `${rect.right - dropRect.width}px`;
        }
        
        // Close on outside click or scroll
        const closeHandler = (e) => {
            if (!dropdown.contains(e.target) && e.target !== targetEl) {
                dropdown.remove();
                document.removeEventListener("click", closeHandler);
                document.removeEventListener("scroll", scrollHandler, true);
            }
        };
        const scrollHandler = (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener("click", closeHandler);
                document.removeEventListener("scroll", scrollHandler, true);
            }
        };
        setTimeout(() => {
            document.addEventListener("click", closeHandler);
            document.addEventListener("scroll", scrollHandler, true);
        }, 0);
    }
    
    showThemeSelector(targetEl) {
        // Toggle: if this dropdown is already open, close it
        const existing = document.querySelector('.promptflow-preset-dropdown[data-owner="theme"]');
        if (existing) {
            existing.remove();
            return;
        }
        
        // Remove any other dropdowns
        document.querySelectorAll(".promptflow-preset-dropdown").forEach(el => el.remove());
        
        const dropdown = document.createElement("div");
        dropdown.className = "promptflow-preset-dropdown";
        dropdown.dataset.owner = "theme";
        dropdown.style.minWidth = "180px";
        
        // Add title
        const title = document.createElement("div");
        title.className = "promptflow-preset-divider";
        title.textContent = "Select Theme";
        dropdown.appendChild(title);
        
        // Theme emojis for visual identification
        const themeEmojis = {
            ocean: "🌊",
            forest: "🌲",
            pinkpony: "🦄",
            odie: "🐕",
            umbrael: "🔮",
            plainjane: "📝",
            batman: "🦇"
        };
        
        // Add theme options
        for (const [key, theme] of Object.entries(THEMES)) {
            const isActive = globalSettings.theme === key;
            const item = document.createElement("div");
            item.className = `promptflow-preset-item${isActive ? ' active' : ''}`;
            item.style.cursor = "pointer";
            
            // Emoji indicator
            const emoji = document.createElement("span");
            emoji.textContent = themeEmojis[key] || "🎨";
            emoji.style.marginRight = "8px";
            emoji.style.fontSize = "14px";
            
            const label = document.createElement("span");
            label.textContent = theme.name;
            label.style.flex = "1";
            
            // Check mark for current theme
            if (isActive) {
                const check = document.createElement("span");
                check.textContent = "✓";
                check.style.color = this.theme.accent;
                check.style.marginLeft = "8px";
                item.appendChild(emoji);
                item.appendChild(label);
                item.appendChild(check);
            } else {
                item.appendChild(emoji);
                item.appendChild(label);
            }
            
            item.addEventListener("click", () => {
                // Update theme
                globalSettings.theme = key;
                this.theme = THEMES[key];
                this.injectStyles();
                
                // Save to ComfyUI settings
                if (app.ui.settings.setSettingValue) {
                    app.ui.settings.setSettingValue("📝 PromptFlow.Theme", key);
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
        
        // Close on outside click or scroll
        const closeHandler = (e) => {
            if (!dropdown.contains(e.target) && e.target !== targetEl) {
                dropdown.remove();
                document.removeEventListener("click", closeHandler);
                document.removeEventListener("scroll", scrollHandler, true);
            }
        };
        const scrollHandler = (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener("click", closeHandler);
                document.removeEventListener("scroll", scrollHandler, true);
            }
        };
        setTimeout(() => {
            document.addEventListener("click", closeHandler);
            document.addEventListener("scroll", scrollHandler, true);
        }, 0);
    }
    
    showContextMenu(e, fieldId, textarea) {
        e.preventDefault();
        e.stopPropagation();
        
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
        
        // Close on click outside or scroll
        const closeHandler = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener("click", closeHandler);
                document.removeEventListener("scroll", scrollHandler, true);
            }
        };
        const scrollHandler = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener("click", closeHandler);
                document.removeEventListener("scroll", scrollHandler, true);
            }
        };
        setTimeout(() => {
            document.addEventListener("click", closeHandler);
            document.addEventListener("scroll", scrollHandler, true);
        }, 0);
    }
}

// ============================================================================
// COMFYUI INTEGRATION
// ============================================================================

app.registerExtension({
    name: "📝 PromptFlow.Widget",
    
    async setup() {
        // Build theme options (built-in + custom)
        const buildThemeOptions = () => {
            const options = Object.entries(THEMES).map(([key, theme]) => ({
                value: key,
                text: theme.name
            }));
            // Add custom themes
            Object.entries(customThemes).forEach(([key, theme]) => {
                options.push({ value: key, text: theme.name + " (Custom)" });
            });
            return options;
        };
        
        // Add theme setting to ComfyUI's settings menu
        app.ui.settings.addSetting({
            id: "📝 PromptFlow.Theme",
            name: "📝 PromptFlow Theme",
            type: "combo",
            tooltip: "Choose a color theme for PromptFlow nodes. Right-click node to create custom themes.",
            options: buildThemeOptions(),
            defaultValue: "umbrael",
            onChange: (value) => {
                setTheme(value);
            }
        });
        
        // Add sticky header setting
        app.ui.settings.addSetting({
            id: "📝 PromptFlow.StickyHeader",
            name: "📝 PromptFlow Sticky Header",
            type: "boolean",
            tooltip: "Keep the header (mode switch, presets, settings) visible at the top when scrolling through fields.",
            defaultValue: false,
            onChange: (value) => {
                globalSettings.stickyHeader = value;
                
                // Update all PromptFlow nodes
                if (app.graph && app.graph._nodes) {
                    const nodes = app.graph._nodes.filter(n => n.comfyClass === "PromptFlowCore");
                    nodes.forEach(node => {
                        if (node.promptFlowWidget) {
                            node.promptFlowWidget.updateHeaderSticky();
                        }
                    });
                }
            }
        });
        
        // Load saved settings
        const savedTheme = app.ui.settings.getSettingValue("📝 PromptFlow.Theme", "umbrael");
        const savedStickyHeader = app.ui.settings.getSettingValue("📝 PromptFlow.StickyHeader", false);
        
        globalSettings.theme = savedTheme;
        globalSettings.stickyHeader = savedStickyHeader;
        
        // Listen for resolved prompt from Python backend
        api.addEventListener("promptflow.resolved", (event) => {
            const { node_id, positive, negative } = event.detail;
            
            // Find the node and update its last generated display
            if (app.graph && app.graph._nodes) {
                const node = app.graph._nodes.find(n => n.id === parseInt(node_id));
                if (node && node.promptFlowWidget) {
                    node.promptFlowWidget.setLastGenerated(positive, negative);
                }
            }
        });
        
        // Close dropdowns on middle mouse (canvas panning)
        const closeAllDropdowns = () => {
            document.querySelectorAll(".promptflow-preset-dropdown").forEach(el => el.remove());
            document.querySelectorAll(".promptflow-context-menu").forEach(el => el.remove());
        };
        
        document.addEventListener("mousedown", (e) => {
            if (e.button === 1) closeAllDropdowns();
        }, true);
        
        // Also close on auxclick (middle click) and when canvas starts panning
        document.addEventListener("auxclick", (e) => {
            if (e.button === 1) closeAllDropdowns();
        }, true);
        
        // Close when pointer leaves the dropdown area during any mouse activity
        document.addEventListener("pointermove", (e) => {
            if (e.buttons === 4) closeAllDropdowns(); // Middle button held
        }, true);
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
            const container = promptFlowWidget.render();
            const domWidget = this.addDOMWidget("promptflow_ui", "div", container, {
                serialize: false,
                hideOnZoom: false,
            });
            
            // Dynamic height - auto-resize based on content
            const node = this;
            
            domWidget.computeSize = function() {
                // Get actual content height
                const contentHeight = container.scrollHeight || 200;
                return [node.size[0], contentHeight + 10];
            };
            
            // Function to update node size based on content
            const updateNodeSize = () => {
                // Force layout recalculation
                container.offsetHeight;
                const contentHeight = container.scrollHeight || 200;
                const minHeight = 200;
                const newHeight = Math.max(contentHeight + 80, minHeight);
                const currentHeight = node.size[1];
                
                // Only update if height actually changed
                if (Math.abs(newHeight - currentHeight) > 5) {
                    node.setSize([Math.max(node.size[0], 420), newHeight]);
                    app.graph.setDirtyCanvas(true, true);
                }
            };
            
            // Store update function on widget for external calls
            promptFlowWidget.updateNodeSize = updateNodeSize;
            
            // Use ResizeObserver for immediate response to content changes
            const resizeObserver = new ResizeObserver(() => {
                updateNodeSize();
            });
            resizeObserver.observe(container);
            
            // Set initial node size
            setTimeout(updateNodeSize, 50);
            
            // Store reference for later
            this.promptFlowWidget = promptFlowWidget;
        };
        
        // Add right-click menu option for custom theme editor
        const origGetExtraMenuOptions = nodeType.prototype.getExtraMenuOptions;
        nodeType.prototype.getExtraMenuOptions = function(_, options) {
            origGetExtraMenuOptions?.apply(this, arguments);
            
            // Check if custom theme exists
            const customThemeKey = Object.keys(customThemes)[0]; // Only 1 custom theme allowed
            const hasCustomTheme = !!customThemeKey;
            
            options.unshift(
                {
                    content: hasCustomTheme ? "🎨 Edit Custom Theme" : "🎨 Create Custom Theme",
                    callback: () => {
                        if (hasCustomTheme) {
                            openThemeEditor(customThemeKey);
                        } else {
                            openThemeEditor();
                        }
                    }
                },
                null // Separator
            );
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
        
        // Wait a bit for onNodeCreated to complete
        setTimeout(() => {
            if (node.promptFlowWidget) {
                const widgetDataWidget = node.widgets?.find(w => w.name === "widget_data");
                if (widgetDataWidget) {
                    node.promptFlowWidget.data = parseWidgetData(widgetDataWidget);
                    node.promptFlowWidget.rebuildFields();
                    node.promptFlowWidget.syncUI();
                    node.promptFlowWidget.updatePreview();
                    node.promptFlowWidget.resizeAllTextareas();
                }
            }
        }, 100);
    }
});

console.log("📝 PromptFlow widget loaded successfully");
