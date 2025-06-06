// Pod Mods Button Fix
// This module ensures the pod mods button visibility is properly managed

class PodModsManager {
    constructor() {
        this.checkInterval = null;
        this.lastState = {
            hasPod: false,
            atRepair: false,
            inPodMode: false,
            justBought: false
        };
    }
    
    init() {
        // Start monitoring game state changes
        this.startMonitoring();
        
        // Add custom event listener for game state updates
        document.addEventListener('gameStateUpdated', (e) => {
            this.checkPodModsVisibility(e.detail);
        });
        
        console.log('Pod Mods Manager initialized');
    }
    
    startMonitoring() {
        // Check every 500ms for state changes
        this.checkInterval = setInterval(() => {
            if (window.gameEngine && window.gameEngine.gameState) {
                this.checkPodModsVisibility(window.gameEngine.gameState);
            }
        }, 500);
    }
    
    checkPodModsVisibility(gameState) {
        if (!gameState || !gameState.player_stats) return;
        
        const stats = gameState.player_stats;
        const currentState = {
            hasPod: stats.has_flight_pod || false,
            atRepair: gameState.at_repair_location || false,
            inPodMode: stats.in_pod_mode || false,
            justBought: stats.just_bought_pod || false
        };
        
        // Check if state has changed
        if (this.hasStateChanged(currentState)) {
            this.lastState = { ...currentState };
            this.updateButtonVisibility(currentState);
        }
    }
    
    hasStateChanged(newState) {
        return Object.keys(newState).some(key => newState[key] !== this.lastState[key]);
    }
    
    updateButtonVisibility(state) {
        const shouldShow = state.hasPod && state.atRepair && !state.inPodMode;
        
        if (shouldShow) {
            // Ensure UI manager shows the button
            if (window.uiManager) {
                window.uiManager.showPodModsButton(state.justBought);
            }
            
            // Double-check button exists and is visible
            setTimeout(() => {
                const btn = document.getElementById('pod-mods-btn');
                if (btn && btn.style.display === 'none') {
                    console.log('Pod Mods button was hidden, forcing visible');
                    btn.style.display = 'flex';
                }
            }, 100);
        } else {
            if (window.uiManager) {
                window.uiManager.hidePodModsButton();
            }
        }
        
        // Log state for debugging
        console.log('Pod Mods visibility check:', {
            shouldShow,
            state,
            buttonExists: !!document.getElementById('pod-mods-btn')
        });
    }
    
    // Manual trigger for debugging
    forceShowButton() {
        if (window.uiManager) {
            window.uiManager.showPodModsButton(false);
            const btn = document.getElementById('pod-mods-btn');
            if (btn) {
                btn.style.display = 'flex';
                btn.style.visibility = 'visible';
                btn.style.opacity = '1';
                console.log('Forced pod mods button visible');
            }
        }
    }
    
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
}

// Create global instance
window.podModsManager = new PodModsManager();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.podModsManager.init();
    });
} else {
    window.podModsManager.init();
}

// Export for debugging
window.debugPodMods = () => {
    const state = window.gameEngine?.gameState;
    if (!state) {
        console.log('No game state available');
        return;
    }
    
    console.log('Pod Mods Debug Info:');
    console.table({
        'Has Pod': state.player_stats.has_flight_pod,
        'At Repair': state.at_repair_location,
        'In Pod Mode': state.player_stats.in_pod_mode,
        'Just Bought': state.player_stats.just_bought_pod,
        'Button Exists': !!document.getElementById('pod-mods-btn'),
        'Button Visible': document.getElementById('pod-mods-btn')?.style.display !== 'none'
    });
};
