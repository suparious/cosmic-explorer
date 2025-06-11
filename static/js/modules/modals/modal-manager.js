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
        
        if (!modal || !titleEl || !choiceList) return;
        
        // Set title
        titleEl.textContent = title;
        
        // Clear previous choices
        choiceList.innerHTML = '';
        
        // Add choices
        choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = `${index + 1}. ${choice}`;
            btn.onclick = () => {
                this.hideChoiceModal();
                callback(index + 1);
            };
            choiceList.appendChild(btn);
        });
        
        this.trackModal(modal);
    }
    
    /**
     * Hide the choice modal
     */
    hideChoiceModal() {
        const modal = document.getElementById('choice-modal');
        this.hideModal(modal, false);
    }
}
