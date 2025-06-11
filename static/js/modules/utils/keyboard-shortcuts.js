/**
 * KeyboardShortcuts - Handles keyboard shortcuts for the UI
 */
export class KeyboardShortcuts {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.setupKeyboardShortcuts();
    }
    
    /**
     * Set up keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // F5 - Quick Save
            if (e.key === 'F5') {
                e.preventDefault();
                if (this.uiManager.saveLoadModal) {
                    this.uiManager.saveLoadModal.show('save');
                }
            }
            // F9 - Quick Load
            else if (e.key === 'F9') {
                e.preventDefault();
                if (this.uiManager.saveLoadModal) {
                    this.uiManager.saveLoadModal.show('load');
                }
            }
            // ESC - Close modals or return to main menu
            else if (e.key === 'Escape') {
                if (this.uiManager.modalManager && this.uiManager.modalManager.activeModals.length > 0) {
                    // Close the topmost modal
                    const topModal = this.uiManager.modalManager.activeModals[this.uiManager.modalManager.activeModals.length - 1];
                    if (topModal) {
                        this.uiManager.modalManager.hideModal(topModal, true);
                    }
                } else if (this.uiManager.screenManager && this.uiManager.screenManager.isScreenActive('game')) {
                    // Return to main menu if in game
                    this.uiManager.screenManager.showScreen('mainMenu');
                }
            }
        });
    }
}
