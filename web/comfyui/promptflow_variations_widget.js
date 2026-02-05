/**
 * PromptFlow Variations Widget
 * Displays wildcard variations and enables batch generation
 */

import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

const NODE_TYPE = "PromptFlowVariations";

// ============================================================================
// THEMES (reuse from main widget)
// ============================================================================

// Full theme definitions matching main widget
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
    },
};

// Load custom themes from localStorage
function getCustomThemes() {
    try {
        const stored = localStorage.getItem('promptflow_custom_themes');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('[PromptFlow Variations] Failed to load custom themes:', e);
    }
    return {};
}

// Get all themes (built-in + custom)
function getAllThemes() {
    return { ...THEMES, ...getCustomThemes() };
}

// Get saved theme from settings
function getActiveTheme() {
    try {
        const savedTheme = app.ui?.settings?.getSettingValue("📝 PromptFlow.Theme", "umbrael");
        const allThemes = getAllThemes();
        return allThemes[savedTheme] || THEMES.umbrael;
    } catch {
        return THEMES.umbrael;
    }
}

// Global settings (synced with main PromptFlow)
const globalSettings = {
    theme: "umbrael"
};

// Initialize settings
try {
    globalSettings.theme = app.ui?.settings?.getSettingValue("📝 PromptFlow.Theme", "umbrael") || "umbrael";
} catch {}

// Set theme and refresh all variations widgets
function setTheme(themeKey) {
    globalSettings.theme = themeKey;
    // Refresh all variations nodes
    if (app.graph && app.graph._nodes) {
        const nodes = app.graph._nodes.filter(n => n.comfyClass === "PromptFlowVariations");
        nodes.forEach(node => {
            if (node.variationsWidget) {
                node.variationsWidget.theme = getAllThemes()[themeKey] || THEMES.umbrael;
                node.variationsWidget.injectStyles();
            }
        });
    }
}

// Use the global theme editor from main PromptFlow widget
function openThemeEditor(existingThemeKey = null) {
    if (window.promptFlowOpenThemeEditor) {
        window.promptFlowOpenThemeEditor(existingThemeKey);
    } else {
        console.warn('[PromptFlow Variations] Theme editor not available. Make sure PromptFlow node is loaded.');
    }
}

// ============================================================================
// WILDCARD API
// ============================================================================

const wildcardCache = {
    contents: {},
};

async function getWildcardContents(name) {
    if (wildcardCache.contents[name]) {
        return wildcardCache.contents[name];
    }
    
    try {
        const safeName = name.replace(/\//g, '---SLASH---');
        const response = await api.fetchApi(`/promptflow/wildcards/${encodeURIComponent(safeName)}`);
        if (response.ok) {
            const data = await response.json();
            wildcardCache.contents[name] = data.options || [];
            return wildcardCache.contents[name];
        }
        return null;
    } catch (e) {
        console.warn(`[PromptFlow Variations] Error loading wildcard '${name}':`, e.message);
        return null;
    }
}

// ============================================================================
// VARIATIONS WIDGET
// ============================================================================

class VariationsWidget {
    constructor(node) {
        this.node = node;
        this.container = null;
        this.theme = getActiveTheme();
        this.selectedVariations = new Set();
        this.promptText = "";
    }
    
    render() {
        this.container = document.createElement("div");
        this.container.className = "pf-variations-container";
        
        // Initial height - will be updated dynamically
        this.container.style.height = "350px";
        
        this.injectStyles();
        this.buildUI();
        
        return this.container;
    }
    
    injectStyles() {
        const styleId = "promptflow-variations-styles";
        
        // Remove existing styles to allow theme updates
        const existing = document.getElementById(styleId);
        if (existing) existing.remove();
        
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
            .pf-variations-container {
                position: relative;
                display: flex;
                flex-direction: column;
                gap: 4px;
                padding: 10px;
                background: ${this.theme.background};
                border: 1px solid ${this.theme.primaryLight};
                border-radius: 8px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                font-size: 11px;
                color: ${this.theme.text};
                box-sizing: border-box;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
                overflow: hidden;
            }
            
            .pf-variations-content {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .pf-variations-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 8px;
                background: ${this.theme.gradient};
                border: 1px solid ${this.theme.primaryLight};
                border-radius: 4px;
                margin-bottom: 4px;
            }
            
            .pf-variations-title {
                font-size: 12px;
                font-weight: 600;
                color: ${this.theme.accent};
                text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            }
            
            .pf-variations-count {
                padding: 2px 8px;
                background: linear-gradient(135deg, ${this.theme.primary}, ${this.theme.secondary});
                color: #ffffff;
                border-radius: 10px;
                font-size: 10px;
                font-weight: 600;
            }
            
            .pf-prompt-section {
                background: ${this.theme.gradient};
                border: 1px solid ${this.theme.primaryLight};
                border-radius: 4px;
                padding: 6px;
                margin-bottom: 4px;
            }
            
            .pf-prompt-label {
                font-size: 10px;
                font-weight: 600;
                color: ${this.theme.accent};
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }
            
            .pf-variations-prompt {
                padding: 8px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid ${this.theme.primaryLight};
                border-radius: 4px;
                font-size: 11px;
                line-height: 1.5;
                color: ${this.theme.text};
                word-break: break-word;
            }
            
            .pf-variations-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 8px;
                background: linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.2));
                border: 1px solid ${this.theme.primaryLight};
                border-radius: 4px;
                font-size: 10px;
                color: #fff;
            }
            
            .pf-variations-actions {
                display: flex;
                gap: 4px;
            }
            
            .pf-variations-btn {
                padding: 4px 10px;
                background: transparent;
                border: 1px solid ${this.theme.primaryLight};
                border-radius: 3px;
                color: ${this.theme.text};
                font-size: 10px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .pf-variations-btn:hover {
                background: ${this.theme.primaryLight};
            }
            
            .pf-queue-btn {
                padding: 4px 12px;
                background: ${this.theme.success};
                border: none;
                border-radius: 4px;
                color: #000;
                font-size: 10px;
                font-weight: 600;
                cursor: pointer;
            }
            
            .pf-queue-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .pf-variations-list {
                max-height: 200px;
                overflow-y: auto;
                border: 1px solid ${this.theme.primaryLight};
                border-radius: 4px;
                background: rgba(0,0,0,0.2);
            }
            
            .pf-variations-list::-webkit-scrollbar {
                width: 10px;
            }
            
            .pf-variations-list::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 5px;
            }
            
            .pf-variations-list::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.25);
                border-radius: 5px;
            }
            
            .pf-variations-list::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.35);
            }
            
            .pf-variation-item {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                padding: 6px 8px;
                border-bottom: 1px solid ${this.theme.primaryLight};
                font-size: 11px;
                cursor: pointer;
                user-select: none;
            }
            
            .pf-variation-item:last-child {
                border-bottom: none;
            }
            
            .pf-variation-item:hover {
                background: ${this.theme.primaryLight};
            }
            
            .pf-variation-item.selected {
                background: ${this.theme.primaryLight};
            }
            
            .pf-variation-checkbox {
                flex-shrink: 0;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                border: 2px solid ${this.theme.primaryLight};
                background: transparent;
                cursor: pointer;
                transition: all 0.15s;
            }
            
            .pf-variation-checkbox.checked {
                background: ${this.theme.accent};
                border-color: ${this.theme.accent};
            }
            
            .pf-variation-text {
                flex: 1;
                word-break: break-word;
                line-height: 1.4;
                color: ${this.theme.text};
            }
            
            .pf-no-variations {
                padding: 20px;
                text-align: center;
                color: ${this.theme.textDim};
                font-size: 11px;
            }
            
            .pf-select-all {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 8px;
                font-size: 10px;
                color: #fff;
                cursor: pointer;
            }
            
            .pf-select-all:hover {
                color: #fff;
            }
        `;
        document.head.appendChild(style);
    }
    
    buildUI() {
        // Header
        const header = document.createElement("div");
        header.className = "pf-variations-header";
        
        const title = document.createElement("span");
        title.className = "pf-variations-title";
        title.textContent = "🎲 PromptFlow Variations";
        
        this.countBadge = document.createElement("span");
        this.countBadge.className = "pf-variations-count";
        this.countBadge.textContent = "0";
        
        header.appendChild(title);
        header.appendChild(this.countBadge);
        this.container.appendChild(header);
        
        // Prompt preview section
        const promptSection = document.createElement("div");
        promptSection.className = "pf-prompt-section";
        
        const promptLabel = document.createElement("div");
        promptLabel.className = "pf-prompt-label";
        promptLabel.textContent = "Input Prompt";
        
        this.promptPreview = document.createElement("div");
        this.promptPreview.className = "pf-variations-prompt";
        this.promptPreview.textContent = "Connect a prompt to see variations...";
        
        promptSection.appendChild(promptLabel);
        promptSection.appendChild(this.promptPreview);
        this.container.appendChild(promptSection);
        
        // Content area - flex container to fill remaining space
        this.contentArea = document.createElement("div");
        this.contentArea.className = "pf-variations-content";
        this.container.appendChild(this.contentArea);
        
        // Initial state
        this.showNoVariations("Connect a prompt with wildcards to see variations");
    }
    
    showNoVariations(message) {
        this.contentArea.innerHTML = "";
        const noVars = document.createElement("div");
        noVars.className = "pf-no-variations";
        noVars.innerHTML = message;
        this.contentArea.appendChild(noVars);
    }
    
    async updateFromPrompt(promptText) {
        this.promptText = promptText || "";
        this.promptPreview.textContent = this.promptText || "(empty)";
        
        if (!this.promptText) {
            this.countBadge.textContent = "0";
            this.showNoVariations("Connect a prompt to see variations");
            this.triggerNodeResize();
            return;
        }
        
        // Extract wildcards
        const wildcards = this.extractWildcards(this.promptText);
        
        if (wildcards.length === 0) {
            this.countBadge.textContent = "0";
            this.showNoVariations("No wildcards found<br><span style='opacity:0.7;font-size:10px'>Use {a|b|c} or __wildcard__ syntax</span>");
            this.triggerNodeResize();
            return;
        }
        
        // Show loading for file wildcards
        const hasFileWildcards = wildcards.some(w => w.type === "file");
        if (hasFileWildcards) {
            this.showNoVariations("Loading file wildcards...");
            
            for (const wildcard of wildcards) {
                if (wildcard.type === "file" && wildcard.options === null) {
                    const options = await getWildcardContents(wildcard.name);
                    wildcard.options = options || [];
                    wildcard.notFound = options === null;
                }
            }
        }
        
        // Generate combinations
        const effectiveWildcards = wildcards.filter(w => w.options && w.options.length > 0);
        const combinations = this.generateCombinations(effectiveWildcards, this.promptText);
        
        this.countBadge.textContent = combinations.length > 1000 ? "1000+" : combinations.length.toString();
        
        if (combinations.length === 0) {
            this.showNoVariations("No valid variations found");
            this.triggerNodeResize();
            return;
        }
        
        this.renderVariations(combinations, wildcards);
        this.triggerNodeResize();
    }
    
    triggerNodeResize() {
        // Trigger node to recalculate size after DOM changes
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
            if (this.node && this.container) {
                // Temporarily set to auto to measure natural content height
                this.container.style.height = 'auto';
                const contentHeight = this.container.scrollHeight;
                
                // Set container height explicitly
                this.container.style.height = contentHeight + 'px';
                
                // Set node size (add padding for node title bar)
                const newHeight = Math.max(contentHeight + 50, 300);
                this.node.setSize([this.node.size[0], newHeight]);
                
                // Force graph to redraw
                if (this.node.graph) {
                    this.node.graph.setDirtyCanvas(true, true);
                }
            }
        });
    }
    
    extractWildcards(text) {
        const wildcards = [];
        
        // Inline wildcards
        const inlinePattern = /\{([^}]+)\}/g;
        let match;
        while ((match = inlinePattern.exec(text)) !== null) {
            const options = match[1].split("|").map(o => o.trim()).filter(o => o);
            if (options.length > 1) {
                wildcards.push({ type: "inline", full: match[0], options });
            }
        }
        
        // File wildcards
        const filePattern = /__([a-zA-Z0-9_\-\/]+)__/g;
        while ((match = filePattern.exec(text)) !== null) {
            wildcards.push({ type: "file", full: match[0], name: match[1], options: null });
        }
        
        return wildcards;
    }
    
    generateCombinations(wildcards, template) {
        if (wildcards.length === 0) return [];
        
        const combinations = [];
        const maxCombinations = 1000;
        
        function generate(current, index) {
            if (combinations.length >= maxCombinations) return;
            
            if (index === wildcards.length) {
                // Clean up the result
                const cleaned = cleanupPrompt(current);
                combinations.push(cleaned);
                return;
            }
            
            const wildcard = wildcards[index];
            for (const option of wildcard.options) {
                if (combinations.length >= maxCombinations) return;
                const newText = current.replace(wildcard.full, option);
                generate(newText, index + 1);
            }
        }
        
        // Helper to clean up duplicate commas and whitespace
        function cleanupPrompt(text) {
            return text
                // Replace multiple commas (with optional whitespace) with single comma
                .replace(/,(\s*,)+/g, ',')
                // Remove leading/trailing commas
                .replace(/^[\s,]+|[\s,]+$/g, '')
                // Normalize spaces around commas
                .replace(/\s*,\s*/g, ', ')
                // Remove multiple spaces
                .replace(/\s+/g, ' ')
                .trim();
        }
        
        generate(template, 0);
        return combinations;
    }
    
    renderVariations(combinations, wildcards) {
        this.contentArea.innerHTML = "";
        this.selectedVariations = new Set();
        
        // Info bar
        const info = document.createElement("div");
        info.className = "pf-variations-info";
        
        const infoText = document.createElement("span");
        infoText.textContent = `${combinations.length} variation${combinations.length !== 1 ? 's' : ''} from ${wildcards.length} wildcard${wildcards.length !== 1 ? 's' : ''}`;
        
        const actions = document.createElement("div");
        actions.className = "pf-variations-actions";
        
        const copyAllBtn = document.createElement("button");
        copyAllBtn.className = "pf-variations-btn";
        copyAllBtn.textContent = "Copy All";
        copyAllBtn.addEventListener("click", () => {
            const allText = combinations.map((c, i) => `${i + 1}: ${c}`).join("\n\n");
            navigator.clipboard.writeText(allText).then(() => {
                copyAllBtn.textContent = "Copied!";
                setTimeout(() => copyAllBtn.textContent = "Copy All", 1500);
            });
        });
        
        this.queueBtn = document.createElement("button");
        this.queueBtn.className = "pf-queue-btn";
        this.queueBtn.textContent = "Queue (0)";
        this.queueBtn.disabled = true;
        this.queueBtn.addEventListener("click", () => this.queueSelected(combinations));
        
        actions.appendChild(copyAllBtn);
        actions.appendChild(this.queueBtn);
        info.appendChild(infoText);
        info.appendChild(actions);
        this.contentArea.appendChild(info);
        
        // Select all
        const selectAllRow = document.createElement("div");
        selectAllRow.className = "pf-select-all";
        
        const selectAllCheckbox = document.createElement("div");
        selectAllCheckbox.className = "pf-variation-checkbox";
        
        const selectAllLabel = document.createElement("label");
        selectAllLabel.textContent = "Select All";
        selectAllLabel.style.cssText = `cursor: pointer; color: #fff;`;
        
        const displayLimit = Math.min(combinations.length, 50);
        
        // Variations list (create first so we can reference it in select all handler)
        const list = document.createElement("div");
        list.className = "pf-variations-list";
        
        let allSelected = false;
        const toggleSelectAll = () => {
            allSelected = !allSelected;
            selectAllCheckbox.classList.toggle("checked", allSelected);
            const items = list.querySelectorAll('.pf-variation-item');
            items.forEach((item, idx) => {
                const cb = item.querySelector('.pf-variation-checkbox');
                if (cb) {
                    cb.classList.toggle("checked", allSelected);
                    item.classList.toggle("selected", allSelected);
                    if (allSelected) {
                        this.selectedVariations.add(idx);
                    } else {
                        this.selectedVariations.delete(idx);
                    }
                }
            });
            this.updateQueueButton();
        };
        
        selectAllCheckbox.addEventListener("click", toggleSelectAll);
        selectAllLabel.addEventListener("click", toggleSelectAll);
        
        selectAllRow.appendChild(selectAllCheckbox);
        selectAllRow.appendChild(selectAllLabel);
        this.contentArea.appendChild(selectAllRow);
        
        // Track last clicked index for shift-select
        let lastClickedIndex = null;
        
        // Helper to toggle a single item
        const toggleItem = (index, checkbox, forceState = null) => {
            const isChecked = forceState !== null ? forceState : !checkbox.classList.contains("checked");
            checkbox.classList.toggle("checked", isChecked);
            // Also toggle selected class on parent item
            const item = checkbox.parentElement;
            if (item) item.classList.toggle("selected", isChecked);
            if (isChecked) {
                this.selectedVariations.add(index);
            } else {
                this.selectedVariations.delete(index);
            }
        };
        
        // Helper to select range
        const selectRange = (startIdx, endIdx, list) => {
            const min = Math.min(startIdx, endIdx);
            const max = Math.max(startIdx, endIdx);
            const checkboxes = list.querySelectorAll('.pf-variation-checkbox');
            for (let j = min; j <= max && j < checkboxes.length; j++) {
                toggleItem(j, checkboxes[j], true);
            }
        };
        
        for (let i = 0; i < displayLimit; i++) {
            const item = document.createElement("div");
            item.className = "pf-variation-item";
            item.style.cursor = "pointer";
            
            const checkbox = document.createElement("div");
            checkbox.className = "pf-variation-checkbox";
            
            // Row click handler (includes shift-select)
            const handleRowClick = (e) => {
                e.stopPropagation();
                
                if (e.shiftKey && lastClickedIndex !== null) {
                    // Shift-click: select range
                    selectRange(lastClickedIndex, i, list);
                } else {
                    // Normal click: toggle single item
                    toggleItem(i, checkbox);
                    lastClickedIndex = i;
                }
                this.updateQueueButton();
            };
            
            // Make entire row clickable
            item.addEventListener("click", handleRowClick);
            
            const text = document.createElement("span");
            text.className = "pf-variation-text";
            text.textContent = combinations[i];
            
            item.appendChild(checkbox);
            item.appendChild(text);
            list.appendChild(item);
        }
        
        if (combinations.length > displayLimit) {
            const more = document.createElement("div");
            more.className = "pf-variation-item";
            more.style.justifyContent = "center";
            more.style.color = this.theme.textDim;
            more.textContent = `... and ${combinations.length - displayLimit} more`;
            list.appendChild(more);
        }
        
        this.contentArea.appendChild(list);
    }
    
    updateQueueButton() {
        if (this.queueBtn) {
            const count = this.selectedVariations.size;
            this.queueBtn.textContent = `Queue (${count})`;
            this.queueBtn.disabled = count === 0;
        }
    }
    
    async queueSelected(combinations) {
        if (this.selectedVariations.size === 0) return;
        
        const selectedIndices = Array.from(this.selectedVariations).sort((a, b) => a - b);
        const total = selectedIndices.length;
        const originalText = this.queueBtn.textContent;
        this.queueBtn.disabled = true;
        
        try {
            for (let i = 0; i < selectedIndices.length; i++) {
                this.queueBtn.textContent = `Queueing ${i + 1}/${total}...`;
                
                // Get seed widget and set it
                const seedWidget = this.node.widgets?.find(w => w.name === "seed");
                if (seedWidget) {
                    seedWidget.value = selectedIndices[i];
                }
                
                await app.queuePrompt(0, 1);
                
                if (i < selectedIndices.length - 1) {
                    await new Promise(r => setTimeout(r, 100));
                }
            }
            
            this.queueBtn.textContent = `Queued ${total}!`;
            setTimeout(() => {
                this.queueBtn.textContent = originalText;
                this.queueBtn.disabled = this.selectedVariations.size === 0;
            }, 2000);
        } catch (error) {
            console.error("Error queueing:", error);
            this.queueBtn.textContent = "Error!";
            setTimeout(() => {
                this.queueBtn.textContent = originalText;
                this.queueBtn.disabled = this.selectedVariations.size === 0;
            }, 2000);
        }
    }
}

// ============================================================================
// COMFYUI INTEGRATION
// ============================================================================

app.registerExtension({
    name: "🎲 PromptFlow.Variations",
    
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name !== NODE_TYPE) return;
        
        const origOnNodeCreated = nodeType.prototype.onNodeCreated;
        
        nodeType.prototype.onNodeCreated = function() {
            origOnNodeCreated?.apply(this, arguments);
            
            // Create widget
            const variationsWidget = new VariationsWidget(this);
            
            // Add DOM widget
            const container = variationsWidget.render();
            const domWidget = this.addDOMWidget("variations_ui", "div", container, {
                serialize: false,
                hideOnZoom: false,
            });
            
            // Dynamic height
            const node = this;
            domWidget.computeSize = function() {
                const height = container.offsetHeight || 300;
                return [node.size[0], height + 10];
            };
            
            this.setSize([Math.max(this.size[0], 350), 400]);
            this.variationsWidget = variationsWidget;
        };
        
        // Watch for input changes
        const origOnConnectionsChange = nodeType.prototype.onConnectionsChange;
        nodeType.prototype.onConnectionsChange = function(type, index, connected, link_info) {
            origOnConnectionsChange?.apply(this, arguments);
            
            // Update variations when prompt input changes
            if (this.variationsWidget && type === 1 && index === 0) { // Input connection
                if (connected) {
                    this.startWatchingSource();
                } else {
                    this.stopWatchingSource();
                    this.variationsWidget.updateFromPrompt("");
                }
            }
        };
        
        nodeType.prototype.startWatchingSource = function() {
            // Stop any existing watcher
            this.stopWatchingSource();
            
            // Initial update
            this.updateVariationsFromInput();
            
            // Start polling for changes (every 500ms)
            this._lastWidgetData = null;
            this._watchInterval = setInterval(() => {
                this.checkForSourceChanges();
            }, 500);
        };
        
        nodeType.prototype.stopWatchingSource = function() {
            if (this._watchInterval) {
                clearInterval(this._watchInterval);
                this._watchInterval = null;
            }
            this._lastWidgetData = null;
        };
        
        nodeType.prototype.checkForSourceChanges = function() {
            if (!this.variationsWidget) return;
            
            const promptInput = this.inputs?.[0];
            if (!promptInput || promptInput.link == null) return;
            
            const link = app.graph.links[promptInput.link];
            if (!link) return;
            
            const sourceNode = app.graph.getNodeById(link.origin_id);
            if (!sourceNode) return;
            
            // Check if it's a PromptFlow node
            const widgetData = sourceNode.widgets?.find(w => w.name === "widget_data");
            if (widgetData && widgetData.value) {
                // Only update if data has changed
                if (widgetData.value !== this._lastWidgetData) {
                    this._lastWidgetData = widgetData.value;
                    this.updateVariationsFromInput();
                }
            }
        };
        
        nodeType.prototype.updateVariationsFromInput = function() {
            if (!this.variationsWidget) return;
            
            // Get prompt from input
            const promptInput = this.inputs?.[0];
            if (promptInput && promptInput.link != null) {
                const link = app.graph.links[promptInput.link];
                if (link) {
                    const sourceNode = app.graph.getNodeById(link.origin_id);
                    if (sourceNode) {
                        // Check if it's a PromptFlow node
                        const widgetData = sourceNode.widgets?.find(w => w.name === "widget_data");
                        if (widgetData && widgetData.value) {
                            try {
                                const data = JSON.parse(widgetData.value);
                                const categories = data.categories || {};
                                const mode = data.mode || "simple";
                                
                                // Get field order
                                const SIMPLE_FIELDS = ["main_prompt", "style", "quality"];
                                const EXTENDED_FIELDS = ["subject", "character", "outfit", "pose", "location", "style", "camera", "lighting", "quality", "custom"];
                                const fieldOrder = data.categoryOrder || (mode === "simple" ? SIMPLE_FIELDS : EXTENDED_FIELDS);
                                
                                // Build prompt respecting order
                                const parts = [];
                                for (const fieldId of fieldOrder) {
                                    const cat = categories[fieldId];
                                    if (cat?.value?.trim()) {
                                        parts.push(cat.value.trim());
                                    }
                                }
                                this.variationsWidget.updateFromPrompt(parts.join(", "));
                                return;
                            } catch (e) {
                                console.warn("Could not parse source widget data:", e);
                            }
                        }
                        
                        // Fallback: try cached output
                        const outputSlot = link.origin_slot;
                        if (sourceNode.outputs?.[outputSlot]?.cached_value) {
                            this.variationsWidget.updateFromPrompt(sourceNode.outputs[outputSlot].cached_value);
                            return;
                        }
                    }
                }
            }
            
            this.variationsWidget.updateFromPrompt("");
        };
        
        // Clean up on node removal
        const origOnRemoved = nodeType.prototype.onRemoved;
        nodeType.prototype.onRemoved = function() {
            this.stopWatchingSource();
            origOnRemoved?.apply(this, arguments);
        };
        
        // Handle execution to get actual output
        const origOnExecuted = nodeType.prototype.onExecuted;
        nodeType.prototype.onExecuted = function(output) {
            origOnExecuted?.apply(this, arguments);
            
            if (output?.prompt && this.variationsWidget) {
                this.variationsWidget.updateFromPrompt(output.prompt[0]);
            }
        };
        
        // Add right-click menu option for theme editor (linked with main PromptFlow)
        const origGetExtraMenuOptions = nodeType.prototype.getExtraMenuOptions;
        nodeType.prototype.getExtraMenuOptions = function(_, options) {
            origGetExtraMenuOptions?.apply(this, arguments);
            
            // Add theme editor at top - theme selection is in ComfyUI Settings
            const currentThemeKey = globalSettings.theme || 'umbrael';
            const isCustomTheme = currentThemeKey.startsWith('custom_');
            options.unshift(
                {
                    content: isCustomTheme ? "🎨 Edit Current Theme" : "🎨 Create Custom Theme",
                    callback: () => {
                        if (isCustomTheme) {
                            openThemeEditor(currentThemeKey);
                        } else {
                            openThemeEditor();
                        }
                    }
                },
                null // Separator
            );
        };
    },
    
    async loadedGraphNode(node, app) {
        if (node.type !== "PromptFlowVariations") return;
        
        // Wait for widget to be created, then check connections
        setTimeout(() => {
            if (node.variationsWidget && node.inputs?.[0]?.link) {
                node.startWatchingSource();
            }
        }, 200);
    }
});

console.log("🎲 PromptFlow Variations widget loaded");
