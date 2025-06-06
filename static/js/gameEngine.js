// Modular Game Engine for Cosmic Explorer
// Main coordinator that ties all modules together

import SocketHandler from './modules/socketHandler.js';
import EffectsManager from './modules/effectsManager.js';
import GameActions from './modules/gameActions.js';

class GameEngine {
    constructor() {
        this.sessionId = 'default';
        this.gameState = null;
        this.isRunning = false;
        this.lastFrameTime = 0;
        
        // Core systems
        this.renderer = null;
        this.particleSystem = null;
        this.audioManager = null;
        this.uiManager = null;
        this.combatUI = null;
        
        // Module handlers
        this.socketHandler = null;
        this.effectsManager = null;
        this.gameActions = null;
        
        // Game objects for visualization
        this.currentLocation = null;
        this.destinations = [];
    }
    
    async init() {
        try {
            console.log('GameEngine.init() starting...');
            
            // Initialize core systems
            const canvas = document.getElementById('game-canvas');
            if (!canvas) {
                throw new Error('Canvas element not found');
            }
            
            console.log('Creating Renderer...');
            this.renderer = new Renderer(canvas);
            
            console.log('Creating ParticleSystem...');
            this.particleSystem = new ParticleSystem();
            
            console.log('Creating AudioManager...');
            this.audioManager = new AudioManager();
            
            console.log('Creating UIManager...');
            this.uiManager = new UIManager();
            window.uiManager = this.uiManager; // Set global instance for onclick handlers
            
            console.log('Creating CombatUI...');
            this.combatUI = new CombatUI(this.uiManager);
            window.combatUI = this.combatUI;
            
            // Initialize modules
            console.log('Initializing modules...');
            this.socketHandler = new SocketHandler(this);
            this.effectsManager = new EffectsManager(this);
            this.gameActions = new GameActions(this);
            
            // Connect modules
            this.socketHandler.init();
            this.effectsManager.init(this.renderer, this.audioManager, this.particleSystem);
            
            // Initialize UI components
            this.uiManager.initAudioVisualizer();
            
            // Generate initial space environment
            this.generateSpaceEnvironment();
            
            // Start render loop
            this.startRenderLoop();
            
            console.log('GameEngine.init() completed successfully');
        } catch (error) {
            console.error('Error in GameEngine.init():', error);
            throw error;
        }
    }
    
    // Delegate actions to gameActions module
    sendAction(action, data = {}) {
        return this.gameActions.sendAction(action, data);
    }
    
    startNewGame() {
        return this.gameActions.startNewGame();
    }
    
    navigate() {
        return this.gameActions.navigate();
    }
    
    scanArea() {
        return this.gameActions.scanArea();
    }
    
    repair() {
        return this.gameActions.repair();
    }
    
    buyPod() {
        return this.gameActions.buyPod();
    }
    
    buyShip() {
        return this.gameActions.buyShip();
    }
    
    buyAugmentation(augId) {
        return this.gameActions.buyAugmentation(augId);
    }
    
    sendDistressSignal() {
        return this.gameActions.sendDistressSignal();
    }
    
    mine() {
        return this.gameActions.mine();
    }
    
    consumeFood(amount) {
        return this.gameActions.consumeFood(amount);
    }
    
    showInventory() {
        return this.gameActions.showInventory();
    }
    
    showQuests() {
        return this.gameActions.showQuests();
    }
    
    showMap() {
        return this.gameActions.showMap();
    }
    
    showAugmentations() {
        return this.gameActions.showAugmentations();
    }
    
    showPodMods() {
        return this.gameActions.showPodMods();
    }
    
    navigateToNode(nodeId) {
        return this.gameActions.navigateToNode(nodeId);
    }
    
    navigateToRegion(regionId) {
        return this.gameActions.navigateToRegion(regionId);
    }
    
    // Visual environment generation
    generateSpaceEnvironment() {
        // Clear existing objects
        this.renderer.planets = [];
        this.renderer.stations = [];
        this.renderer.asteroids = [];
        
        // Generate planets
        for (let i = 0; i < 3; i++) {
            const x = Math.random() * 2000 - 1000;
            const y = Math.random() * 2000 - 1000;
            const radius = 50 + Math.random() * 100;
            const colors = ['#4169E1', '#FF6347', '#32CD32', '#FFD700'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.renderer.addPlanet(x, y, radius, color);
        }
        
        // Generate stations
        for (let i = 0; i < 2; i++) {
            const x = Math.random() * 2000 - 1000;
            const y = Math.random() * 2000 - 1000;
            this.renderer.addStation(x, y);
        }
        
        // Generate asteroid field
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * 2000 - 1000;
            const y = Math.random() * 2000 - 1000;
            const radius = 10 + Math.random() * 30;
            this.renderer.addAsteroid(x, y, radius);
        }
    }
    
    // Render loop
    startRenderLoop() {
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.renderLoop();
    }
    
    renderLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Update subsystems
        this.particleSystem.update(deltaTime);
        
        // Update ship based on game state
        if (this.gameState && this.renderer.ship) {
            this.renderer.ship.health = this.gameState.player_stats.health;
            this.renderer.ship.condition = this.gameState.player_stats.ship_condition;
            this.renderer.ship.hasPod = this.gameState.player_stats.has_flight_pod;
            this.renderer.ship.inPodMode = this.gameState.player_stats.in_pod_mode;
            this.renderer.ship.podHp = this.gameState.player_stats.pod_hp;
            this.renderer.ship.podMaxHp = this.gameState.player_stats.pod_max_hp;
            this.renderer.ship.podAnimationState = this.gameState.player_stats.pod_animation_state;
            this.renderer.ship.podAugmentations = this.gameState.player_stats.pod_augmentations || [];
            
            // Update ship type and mods
            this.renderer.ship.shipType = this.gameState.player_stats.ship_type || 'scout';
            this.renderer.ship.shipMods = this.gameState.player_stats.ship_mods || {};
            
            // Update augmentation info for display
            if (this.gameState.pod_augmentations_info) {
                this.renderer.ship.podAugmentationsInfo = this.gameState.pod_augmentations_info;
            }
        }
        
        // Render
        this.renderer.render(this.gameState);
        this.particleSystem.render(this.renderer.ctx);
        
        requestAnimationFrame(() => this.renderLoop());
    }
    
    // Save/Load compatibility methods (for backward compatibility)
    loadGame() {
        // Show the save/load modal in load mode
        this.uiManager.showSaveLoadModal('load');
    }
    
    saveGameState() {
        // Auto-save is now handled by the backend
        // This function is kept for compatibility but does nothing
    }
}

// Export for use in other modules
export default GameEngine;
