// Game Actions Module for Cosmic Explorer
// Handles all player actions and API communication

class GameActions {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
    }
    
    async sendAction(action, data = {}) {
        const response = await fetch(`${GameConfig.game.apiUrl}/game/action/${this.gameEngine.sessionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...data })
        });
        
        const result = await response.json();
        if (result.success) {
            // Update game state
            if (result.game_state) {
                this.gameEngine.gameState = result.game_state;
                
                // Dispatch custom event for state changes
                document.dispatchEvent(new CustomEvent('gameStateUpdated', {
                    detail: this.gameEngine.gameState
                }));
            }
        } else {
            this.gameEngine.uiManager.showNotification('Action failed', 'danger');
        }
        
        return result;
    }
    
    async startNewGame() {
        // Clear any existing save data to force new star map generation
        localStorage.removeItem('cosmic_explorer_save');
        
        // Close any open modals before starting new game
        this.gameEngine.uiManager.closeAllModals();
        
        const response = await fetch(`${GameConfig.game.apiUrl}/game/new`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: this.gameEngine.sessionId, force_new: true })
        });
        
        const result = await response.json();
        if (result.success) {
            this.gameEngine.gameState = result.game_state;
            this.gameEngine.uiManager.updateHUD(this.gameEngine.gameState);
            this.gameEngine.audioManager.playMusic();
            this.gameEngine.generateSpaceEnvironment();
            
            // Update region theme immediately
            if (this.gameEngine.gameState.current_location && this.gameEngine.gameState.current_location.region) {
                this.gameEngine.renderer.updateRegionTheme(this.gameEngine.gameState.current_location.region);
            }
            
            // Show welcome message
            this.gameEngine.uiManager.addEventMessage('Welcome to Cosmic Explorer! Your journey begins...', 'info');
        }
        
        return result;
    }
    
    navigate() {
        this.sendAction('navigate');
        
        // Animate ship movement
        const angle = Math.random() * Math.PI * 2;
        const distance = 200 + Math.random() * 300;
        const targetX = this.gameEngine.renderer.ship.x + Math.cos(angle) * distance;
        const targetY = this.gameEngine.renderer.ship.y + Math.sin(angle) * distance;
        
        // Different effects for pod mode
        if (this.gameEngine.gameState && this.gameEngine.gameState.player_stats.in_pod_mode) {
            this.gameEngine.audioManager.playSound('alert');
            // Slower, more erratic movement in pod
            this.gameEngine.effectsManager.animatePodMovement(targetX, targetY);
        } else {
            // Create warp effect
            this.gameEngine.audioManager.playWarpSound();
            this.gameEngine.effectsManager.createWarpEffect();
            // Move ship
            this.gameEngine.effectsManager.animateShipMovement(targetX, targetY);
        }
    }
    
    scanArea() {
        this.sendAction('event');
        this.gameEngine.renderer.startScanEffect();
        this.gameEngine.audioManager.playSound('scan');
    }
    
    repair() {
        if (this.gameEngine.gameState && this.gameEngine.gameState.at_repair_location) {
            this.sendAction('repair');
        }
    }
    
    buyPod() {
        this.sendAction('buy_pod');
    }
    
    buyShip() {
        this.sendAction('buy_ship');
    }
    
    buyAugmentation(augId) {
        this.sendAction('buy_augmentation', { augmentation_id: augId });
    }
    
    sendDistressSignal() {
        this.sendAction('distress_signal');
    }
    
    mine() {
        this.sendAction('mine');
        // Play mining sound effect
        this.gameEngine.audioManager.playSound('scan'); // Using scan sound for now
        // Add visual effect
        const ship = this.gameEngine.renderer.ship;
        if (ship) {
            // Create mining beam effect
            for (let i = 0; i < 20; i++) {
                const angle = (Math.PI * 2 * i) / 20;
                const particle = {
                    x: ship.x + Math.cos(angle) * 50,
                    y: ship.y + Math.sin(angle) * 50,
                    vx: Math.cos(angle) * 2,
                    vy: Math.sin(angle) * 2,
                    life: 30,
                    maxLife: 30,
                    size: 2,
                    color: '255, 200, 0'
                };
                this.gameEngine.renderer.particles.push(particle);
            }
        }
    }
    
    consumeFood(amount) {
        this.sendAction('consume_food', { amount: amount });
    }
    
    showInventory() {
        // Open ship modal directly to inventory tab
        this.gameEngine.uiManager.showShipModal();
        setTimeout(() => this.gameEngine.uiManager.showShipTab('inventory'), 100);
    }
    
    showQuests() {
        if (this.gameEngine.gameState && this.gameEngine.gameState.active_quest) {
            const quest = this.gameEngine.gameState.active_quest;
            this.gameEngine.uiManager.showChoiceModal(
                `Quest: ${quest.name}`,
                [`Status: ${quest.status}`, 'Close'],
                () => {}
            );
        } else {
            this.gameEngine.uiManager.showNotification('No active quests', 'info');
        }
    }
    
    showMap() {
        // Show star map with navigation options
        if (this.gameEngine.gameState && this.gameEngine.gameState.star_map) {
            this.fetchNavigationOptions().then(options => {
                this.gameEngine.uiManager.showStarMap(this.gameEngine.gameState.star_map, options);
            });
        } else {
            this.gameEngine.uiManager.showNotification('Star map unavailable!', 'error');
        }
    }
    
    showAugmentations() {
        // Show pod augmentations modal
        if (this.gameEngine.gameState && this.gameEngine.gameState.at_repair_location && 
            this.gameEngine.gameState.player_stats.has_flight_pod) {
            this.gameEngine.uiManager.showAugmentationsModal();
        } else {
            this.gameEngine.uiManager.showNotification('Must be at repair location with pod to view augmentations', 'info');
        }
    }
    
    showPodMods() {
        if (!this.gameEngine.gameState || !this.gameEngine.gameState.player_stats.has_flight_pod) {
            this.gameEngine.uiManager.showNotification('You need a pod to install modifications!', 'danger');
            return;
        }
        
        if (this.gameEngine.gameState.player_stats.in_pod_mode) {
            this.gameEngine.uiManager.showNotification('Cannot modify pod while in pod mode!', 'danger');
            return;
        }
        
        // Show available augmentations
        this.gameEngine.uiManager.showPodModsModal(this.gameEngine.gameState);
    }
    
    async fetchNavigationOptions() {
        try {
            const response = await fetch(`${GameConfig.game.apiUrl}/game/navigation_options/${this.gameEngine.sessionId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching navigation options:', error);
            return { options: [] };
        }
    }
    
    async navigateToNode(nodeId) {
        await this.sendAction('navigate', { target_node_id: nodeId });
    }
    
    async navigateToRegion(regionId) {
        await this.sendAction('navigate', { target_region_id: regionId });
    }
}

// Export for use in other modules
export default GameActions;
