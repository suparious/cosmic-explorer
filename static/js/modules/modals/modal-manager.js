/**
 * ModalManager - Base class for modal management with z-index handling
 */
export class ModalManager {
    constructor() {
        // Modal z-index management
        this.modalZIndexBase = 1000;
        this.currentModalZIndex = this.modalZIndexBase;
        this.activeModals = [];
    }
    
    /**
     * Track a modal as active and set its z-index
     * @param {HTMLElement} modal - The modal element to track
     */
    trackModal(modal) {
        // Ensure this modal appears on top of all other modals
        this.currentModalZIndex += 10;
        modal.style.zIndex = this.currentModalZIndex;
        
        // Track this modal
        if (!this.activeModals.includes(modal)) {
            this.activeModals.push(modal);
        }
        
        // Show modal with proper display
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.animation = 'fade-in 0.3s ease-out';
    }
    
    /**
     * Remove a modal from tracking
     * @param {HTMLElement} modal - The modal element to untrack
     */
    untrackModal(modal) {
        // Remove from active modals
        const index = this.activeModals.indexOf(modal);
        if (index > -1) {
            this.activeModals.splice(index, 1);
        }
        
        // Reset z-index if no other modals are active
        if (this.activeModals.length === 0) {
            this.currentModalZIndex = this.modalZIndexBase;
        }
    }
    
    /**
     * Hide a modal with animation
     * @param {HTMLElement} modal - The modal element to hide
     * @param {boolean} removeFromDOM - Whether to remove the modal from DOM after hiding
     */
    hideModal(modal, removeFromDOM = false) {
        if (!modal) return;
        
        this.untrackModal(modal);
        
        modal.style.animation = 'fade-out 0.3s ease-out';
        setTimeout(() => {
            modal.style.display = 'none';
            if (removeFromDOM) {
                modal.remove();
            }
        }, 300);
    }
    
    /**
     * Close all open modals
     */
    closeAllModals() {
        // List of all modal IDs in the game
        const modalIds = [
            'choice-modal',
            'save-load-modal',
            'pod-mods-modal',
            'food-modal',
            'ship-modal',
            'star-map-modal'
        ];
        
        modalIds.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                // Remove any animations first
                modal.style.animation = 'none';
                modal.style.display = 'none';
                
                // Clear any modal content to prevent stale data
                if (modalId === 'choice-modal') {
                    const choiceList = document.getElementById('choice-list');
                    if (choiceList) {
                        choiceList.innerHTML = '';
                    }
                }
                
                // For dynamically created modals, remove them from DOM
                if (modalId === 'save-load-modal' || 
                    modalId === 'pod-mods-modal' || 
                    modalId === 'food-modal' || 
                    modalId === 'ship-modal' || 
                    modalId === 'star-map-modal') {
                    modal.remove();
                }
            }
        });
        
        // Clear active modals array
        this.activeModals = [];
        this.currentModalZIndex = this.modalZIndexBase;
        
        // Also remove any stray notifications
        document.querySelectorAll('.notification').forEach(notif => notif.remove());
    }
    
    /**
     * Show the choice modal
     * @param {string} title - The title of the choice modal
     * @param {Array<string>} choices - The choices to display
     * @param {Function} callback - The callback function when a choice is made
     */
    showChoiceModal(title, choices, callback) {
        const modal = document.getElementById('choice-modal');
        const titleEl = document.getElementById('choice-title');
        const choiceList = document.getElementById('choice-list');
        const modalFooter = modal?.querySelector('.modal-footer');
        
        if (!modal || !titleEl || !choiceList) return;
        
        // Validate choices array
        if (!Array.isArray(choices) || choices.length === 0) {
            console.error('Invalid choices array:', choices);
            // Show error message instead of empty modal
            titleEl.textContent = 'Error';
            choiceList.innerHTML = '<p style="color: var(--danger-color); text-align: center;">No choices available. Please try again.</p>';
            if (modalFooter) modalFooter.style.display = 'block';
        } else {
            // Set title
            titleEl.textContent = title;
            
            // Clear previous choices
            choiceList.innerHTML = '';
            
            // Hide footer for normal choices
            if (modalFooter) modalFooter.style.display = 'none';
            
            // Add choices
            choices.forEach((choice, index) => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.textContent = `${index + 1}. ${choice}`;
                btn.onclick = () => {
                    this.hideChoiceModal();
                    if (callback) callback(index + 1);
                };
                choiceList.appendChild(btn);
            });
        }
        
        // Set up close handlers
        this.setupChoiceModalHandlers(modal, callback);
        
        this.trackModal(modal);
    }
    
    /**
     * Set up event handlers for the choice modal
     * @param {HTMLElement} modal - The modal element
     * @param {Function} callback - The callback function
     */
    setupChoiceModalHandlers(modal, callback) {
        // Remove any existing handlers
        this.cleanupChoiceModalHandlers();
        
        // Close button handler
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            this._choiceCloseHandler = () => this.hideChoiceModal();
            closeBtn.addEventListener('click', this._choiceCloseHandler);
        }
        
        // Backdrop click handler
        const backdrop = modal.querySelector('.modal-backdrop');
        if (backdrop) {
            this._choiceBackdropHandler = (e) => {
                if (e.target === backdrop) {
                    this.hideChoiceModal();
                }
            };
            backdrop.addEventListener('click', this._choiceBackdropHandler);
        }
        
        // ESC key handler
        this._choiceEscHandler = (e) => {
            if (e.key === 'Escape' && this.activeModals.includes(modal)) {
                e.preventDefault();
                this.hideChoiceModal();
            }
        };
        document.addEventListener('keydown', this._choiceEscHandler);
    }
    
    /**
     * Clean up choice modal event handlers
     */
    cleanupChoiceModalHandlers() {
        const modal = document.getElementById('choice-modal');
        if (!modal) return;
        
        const closeBtn = modal.querySelector('.modal-close');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        if (closeBtn && this._choiceCloseHandler) {
            closeBtn.removeEventListener('click', this._choiceCloseHandler);
        }
        
        if (backdrop && this._choiceBackdropHandler) {
            backdrop.removeEventListener('click', this._choiceBackdropHandler);
        }
        
        if (this._choiceEscHandler) {
            document.removeEventListener('keydown', this._choiceEscHandler);
        }
        
        this._choiceCloseHandler = null;
        this._choiceBackdropHandler = null;
        this._choiceEscHandler = null;
    }
    
    /**
     * Hide the choice modal
     */
    hideChoiceModal() {
        const modal = document.getElementById('choice-modal');
        this.cleanupChoiceModalHandlers();
        this.hideModal(modal, false);
    }
}
