// Visual Editor Overlay - Only runs in development mode
// This script gets injected into the page and provides visual editing capabilities

class VisualEditor {
  constructor() {
    this.isEditMode = false;
    this.isEditingMode = false;  // When actively editing a specific element
    this.selectedElement = null;
    this.hoveredElement = null;
    this.xmap = {};
    this.editButton = null;
    this.saveButton = null;
    this.hasUnsavedChanges = false;
    this.originalStyles = new Map(); // Track original styles for undo
    this.inlineEditor = null;
    
    this.init();
  }

  async init() {
    // Create the floating edit button
    this.createEditButton();
    
    // Set up event listeners
    this.setupEventListeners();
    
    console.log('[VisualEditor] Initialized (xmap will load when edit mode is activated)');
  }

  async loadXMap() {
    try {
      const response = await fetch('/__xmap');
      this.xmap = await response.json();
      console.log('[VisualEditor] Loaded xmap with', Object.keys(this.xmap).length, 'entries');
    } catch (error) {
      console.error('[VisualEditor] Failed to load xmap:', error);
    }
  }

  createEditButton() {
    this.editButton = document.createElement('button');
    this.editButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      <span style="margin-left: 8px;">Edit</span>
    `;
    
    // Style the button
    Object.assign(this.editButton.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '9999',
      padding: '12px 16px',
      backgroundColor: '#f97316',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      transition: 'all 0.2s ease',
    });

    this.editButton.addEventListener('click', () => this.toggleEditMode());
    this.editButton.addEventListener('mouseenter', () => {
      this.editButton.style.backgroundColor = '#ea580c';
      this.editButton.style.transform = 'scale(1.05)';
    });
    this.editButton.addEventListener('mouseleave', () => {
      this.editButton.style.backgroundColor = '#f97316';
      this.editButton.style.transform = 'scale(1)';
    });

    document.body.appendChild(this.editButton);
  }

  createSaveButton() {
    if (this.saveButton) return;
    
    this.saveButton = document.createElement('button');
    this.saveButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17,21 17,13 7,13 7,21"/>
        <polyline points="7,3 7,8 15,8"/>
      </svg>
      Save
    `;
    
    Object.assign(this.saveButton.style, {
      position: 'fixed',
      top: '20px',
      right: '120px', // Position next to edit button
      zIndex: '9999',
      padding: '8px 12px',
      backgroundColor: '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      transition: 'all 0.2s ease',
      animation: 'pulse 2s infinite'
    });

    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `;
    document.head.appendChild(style);

    this.saveButton.addEventListener('click', () => this.saveAllChanges());
    document.body.appendChild(this.saveButton);
  }

  removeSaveButton() {
    if (this.saveButton) {
      this.saveButton.remove();
      this.saveButton = null;
    }
  }

  markUnsaved() {
    this.hasUnsavedChanges = true;
    if (!this.saveButton) {
      this.createSaveButton();
    }
  }

  async toggleEditMode() {
    if (this.isEditMode) {
      this.disableEditMode();
    } else {
      await this.enableEditMode();
    }
  }

  async enableEditMode() {
    // Load xmap data if not already loaded
    if (Object.keys(this.xmap).length === 0) {
      console.log('[VisualEditor] Loading xmap data...');
      await this.loadXMap();
      console.log('[VisualEditor] Xmap loaded with', Object.keys(this.xmap).length, 'elements');
    }

    this.isEditMode = true;

    // Update button appearance
    this.editButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      <span style="margin-left: 8px;">Exit</span>
    `;
    this.editButton.style.backgroundColor = '#dc2626';

    // Add global styles for edit mode
    this.addEditModeStyles();
    
    // Add a global event interceptor
    this.addEventInterceptor();

    console.log('[VisualEditor] Edit mode enabled');
  }

  disableEditMode() {
    this.isEditMode = false;
    
    // Reset button
    this.editButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      <span style="margin-left: 8px;">Edit</span>
    `;
    this.editButton.style.backgroundColor = '#f97316';

    // Remove edit mode styles
    this.removeEditModeStyles();
    
    // Remove event interceptor
    this.removeEventInterceptor();
    
    // Clear selections
    this.clearSelection();
    this.clearHover();
    

    // Remove save button
    this.removeSaveButton();

    console.log('[VisualEditor] Edit mode disabled');
  }

  addEditModeStyles() {
    const style = document.createElement('style');
    style.id = 'visual-editor-styles';
    style.textContent = `
      [data-xid]:hover {
        outline: 2px solid #f97316 !important;
        outline-offset: 2px !important;
        cursor: pointer !important;
      }
      
      [data-xid].visual-editor-selected {
        outline: 3px solid #0ea5e9 !important;
        outline-offset: 2px !important;
        background-color: rgba(14, 165, 233, 0.1) !important;
      }
      
      .visual-editor-tooltip {
        position: absolute;
        background: #1f2937;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-family: monospace;
        pointer-events: none;
        z-index: 10000;
        white-space: nowrap;
      }
    `;
    document.head.appendChild(style);
  }

  removeEditModeStyles() {
    const style = document.getElementById('visual-editor-styles');
    if (style) style.remove();
  }

  addEventInterceptor() {
    this.eventInterceptor = (e) => {
      if (!this.isEditMode || this.isEditingMode) return;
      
      const target = e.target;
      const xid = target.getAttribute('data-xid');
      
      // Allow interactions with editor UI
      if (target.closest('#visual-editor-styles') || 
          target === this.editButton || 
          target.closest('[id^="properties-"]') ||
          false) {
        return;
      }
      
      // If clicking on an element with xid, handle selection
      if (e.type === 'click' && xid && this.xmap[xid]) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.handleSelection(target, xid);
        return;
      }

      // Double-click to start inline editing
      if (e.type === 'dblclick' && xid && this.xmap[xid] && this.hasTextContent(target)) {
        console.log('[VisualEditor] Double-click detected on element with xid:', xid);
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.startInlineEdit(target, xid);
        return;
      }
      
      // Block all other interactions with xid elements
      if (xid && this.xmap[xid]) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };
    
    // Add event interceptor to all relevant events
    const eventTypes = ['click', 'dblclick', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'keydown', 'keyup'];
    eventTypes.forEach(eventType => {
      document.addEventListener(eventType, this.eventInterceptor, true);
    });
  }

  removeEventInterceptor() {
    if (!this.eventInterceptor) return;
    
    const eventTypes = ['click', 'dblclick', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'keydown', 'keyup'];
    eventTypes.forEach(eventType => {
      document.removeEventListener(eventType, this.eventInterceptor, true);
    });
    
    this.eventInterceptor = null;
  }

  setupEventListeners() {
    // Handle element hover and click only in edit mode
    document.addEventListener('mouseover', (e) => {
      if (!this.isEditMode) return;
      
      const target = e.target;
      const xid = target.getAttribute('data-xid');
      
      if (xid && this.xmap[xid]) {
        this.handleHover(target, xid);
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (!this.isEditMode) return;
      this.clearHover();
    });

    // Use capture phase to intercept clicks before other handlers
    document.addEventListener('click', (e) => {
      if (!this.isEditMode) return;
      
      const target = e.target;
      const xid = target.getAttribute('data-xid');
      
      if (xid && this.xmap[xid]) {
        // Stop all event propagation immediately
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.handleSelection(target, xid);
      }
    }, true); // Use capture phase

    // Prevent all other interactions in edit mode
    document.addEventListener('mousedown', (e) => {
      if (!this.isEditMode) return;
      
      const target = e.target;
      const xid = target.getAttribute('data-xid');
      
      if (xid && this.xmap[xid]) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }, true);

    document.addEventListener('mouseup', (e) => {
      if (!this.isEditMode) return;
      
      const target = e.target;
      const xid = target.getAttribute('data-xid');
      
      if (xid && this.xmap[xid]) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }, true);

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isEditMode) {
          this.disableEditMode();
        }
      }
    });
  }

  handleHover(element, xid) {
    if (this.hoveredElement === element) return;
    
    this.clearHover();
    this.hoveredElement = element;
    
    // Show tooltip with component info
    const info = this.xmap[xid];
    const tooltip = document.createElement('div');
    tooltip.className = 'visual-editor-tooltip';
    tooltip.textContent = `<${info.componentType}> ${info.file}:${info.loc.start.line}`;
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - 30) + 'px';
    
    document.body.appendChild(tooltip);
    tooltip.id = 'visual-editor-tooltip';
  }

  clearHover() {
    const tooltip = document.getElementById('visual-editor-tooltip');
    if (tooltip) tooltip.remove();
    this.hoveredElement = null;
  }

  handleSelection(element, xid) {
    this.clearSelection();
    
    this.selectedElement = element;
    element.classList.add('visual-editor-selected');
    
    
    console.log('[VisualEditor] Selected element:', xid, this.xmap[xid]);
  }

  clearSelection() {
    if (this.selectedElement) {
      this.selectedElement.classList.remove('visual-editor-selected');
      this.selectedElement = null;
    }
  }


  hasTextContent(element) {
    const textContent = element.textContent?.trim();
    const hasText = textContent && textContent.length > 0;
    const hasInteractiveElements = element.querySelector('input, textarea, select, button');
    console.log('[VisualEditor] hasTextContent check:', {
      element: element.tagName,
      textContent,
      hasText,
      hasInteractiveElements: !!hasInteractiveElements
    });
    return hasText && !hasInteractiveElements;
  }

  startInlineEdit(element, xid) {
    const originalText = element.textContent || '';
    
    // Enter editing mode - this disables edit mode UI
    this.isEditingMode = true;
    this.removeEditModeStyles();
    this.clearHover();
    this.clearSelection();
    
    // Store original text for restoration
    element.setAttribute('data-original-text', originalText);
    element.setAttribute('data-editing', 'true');
    
    // Make element directly editable
    element.contentEditable = 'true';
    element.style.outline = '2px solid #0ea5e9';
    element.style.outlineOffset = '2px';
    element.style.cursor = 'text';
    
    // Focus and select all text initially
    setTimeout(() => {
      element.focus();
      
      // Select all text content initially
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }, 50);

    const handleKeydown = (e) => {
      // Don't prevent default for typing
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.finishInlineEdit(element, xid);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.cancelInlineEdit(element);
      }
      // Let other keys through for normal typing
    };

    const handleBlur = () => {
      this.finishInlineEdit(element, xid);
      element.removeEventListener('keydown', handleKeydown);
      element.removeEventListener('blur', handleBlur);
    };

    element.addEventListener('keydown', handleKeydown);
    element.addEventListener('blur', handleBlur);

    console.log('[VisualEditor] Started inline edit for', xid, 'contentEditable:', element.contentEditable);
  }

  finishInlineEdit(element, xid) {
    const originalText = element.getAttribute('data-original-text') || '';
    const newText = element.textContent || '';
    
    // Clean up editing state
    element.contentEditable = 'false';
    element.style.outline = '';
    element.style.outlineOffset = '';
    element.style.cursor = '';
    element.removeAttribute('data-original-text');
    element.removeAttribute('data-editing');
    
    // Exit editing mode and return to edit mode
    this.isEditingMode = false;
    this.addEditModeStyles();
    
    if (newText !== originalText) {
      this.markUnsaved();
      console.log('[VisualEditor] Text changed from', originalText, 'to', newText);
    }
  }

  cancelInlineEdit(element) {
    const originalText = element.getAttribute('data-original-text') || '';
    
    element.textContent = originalText;
    element.contentEditable = 'false';
    element.style.outline = '';
    element.style.outlineOffset = '';
    element.style.cursor = '';
    element.removeAttribute('data-original-text');
    element.removeAttribute('data-editing');
    
    // Exit editing mode and return to edit mode
    this.isEditingMode = false;
    this.addEditModeStyles();
  }



  async saveChanges(xid, newText) {
    try {
      const response = await fetch('/__save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'setText',
          xid,
          text: newText.trim(),
        }),
      });

      if (response.ok) {
        console.log('[VisualEditor] Saved changes for', xid);
        // Update the element's text content immediately for visual feedback
        if (this.selectedElement && newText.trim()) {
          this.selectedElement.textContent = newText.trim();
        }
      } else {
        console.error('[VisualEditor] Failed to save changes');
        alert('Failed to save changes. Check console for details.');
      }
    } catch (error) {
      console.error('[VisualEditor] Save error:', error);
      alert('Error saving changes. Check console for details.');
    }
  }

  async deleteElement(xid) {
    if (!confirm('Are you sure you want to delete this element?')) return;

    try {
      const response = await fetch('/__save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'remove',
          xid,
        }),
      });

      if (response.ok) {
        console.log('[VisualEditor] Deleted element', xid);
        // Remove the element from DOM immediately for visual feedback
        if (this.selectedElement) {
          this.selectedElement.style.opacity = '0.3';
          this.selectedElement.style.pointerEvents = 'none';
        }
      } else {
        console.error('[VisualEditor] Failed to delete element');
        alert('Failed to delete element. Check console for details.');
      }
    } catch (error) {
      console.error('[VisualEditor] Delete error:', error);
      alert('Error deleting element. Check console for details.');
    }
  }
}

// Initialize the visual editor when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new VisualEditor());
} else {
  new VisualEditor();
}