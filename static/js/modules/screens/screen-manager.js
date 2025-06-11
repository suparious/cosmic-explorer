/**
 * ScreenManager - Handles screen transitions and active screen state
 */
export class ScreenManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.screens = {
            loading: document.getElementById('loading-screen'),
            mainMenu: document.getElementById('main-menu'),
            game: document.getElementById('game-screen'),
            settings: document.getElementById('settings-screen')
        };
        this.currentScreen = 'loading';
        
        // Verify all screens were found
        for (const [name, element] of Object.entries(this.screens)) {
            if (!element) {
                console.error(`Screen element '${name}' not found`);
            }
        }
    }
    
    /**
     * Show a specific screen
     * @param {string} screenName - The name of the screen to show
     */
    showScreen(screenName) {
        // Check if screens are loaded
        if (!this.screens[screenName]) {
            console.error(`Screen ${screenName} not found`);
            return;
        }
        
        // Close all open modals when switching screens
        if (this.uiManager.modalManager) {
            this.uiManager.modalManager.closeAllModals();
        }
        
        // Small delay to ensure modals are fully closed
        setTimeout(() => {
            // Hide all screens
            Object.values(this.screens).forEach(screen => {
                if (screen) {
                    screen.classList.remove('active');
                }
            });
            
            // Show requested screen
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
            
            // Update Continue button visibility when showing main menu
            if (screenName === 'mainMenu') {
                this.updateContinueButtonVisibility();
            }
        }, 50);
    }
    
    /**
     * Update the visibility of the continue button based on active game state
     */
    updateContinueButtonVisibility() {
        const continueBtn = document.getElementById('continue-btn');
        const newGameBtn = document.getElementById('new-game-btn');
        
        if (continueBtn && newGameBtn) {
            if (this.uiManager.hasActiveGame) {
                continueBtn.style.display = 'block';
                newGameBtn.classList.remove('primary');
            } else {
                continueBtn.style.display = 'none';
                newGameBtn.classList.add('primary');
            }
        }
    }
    
    /**
     * Get the current active screen
     * @returns {string} The name of the current screen
     */
    getCurrentScreen() {
        return this.currentScreen;
    }
    
    /**
     * Check if a specific screen is active
     * @param {string} screenName - The name of the screen to check
     * @returns {boolean} True if the screen is active
     */
    isScreenActive(screenName) {
        return this.currentScreen === screenName;
    }
}
