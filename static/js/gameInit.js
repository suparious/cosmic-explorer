// Initialization Fix for Cosmic Explorer
// This file improves error handling during game initialization

// Override the window.onload to add better error handling
window.addEventListener('DOMContentLoaded', () => {
    console.log('Initialization Fix loaded');
    
    // Add better error handling for game initialization
    const originalInit = window.GameEngine.prototype.init;
    
    window.GameEngine.prototype.init = async function() {
        try {
            console.log('GameEngine.init() starting with enhanced error handling...');
            
            // Initialize socket connection
            this.socket = io();
            this.setupSocketHandlers();
            console.log('✓ Socket handlers setup complete');
            
            // Initialize subsystems with individual error handling
            const canvas = document.getElementById('game-canvas');
            if (!canvas) {
                throw new Error('Canvas element not found');
            }
            console.log('✓ Canvas element found');
            
            // Initialize Renderer
            try {
                console.log('Creating Renderer...');
                this.renderer = new Renderer(canvas);
                console.log('✓ Renderer created successfully');
            } catch (error) {
                console.error('✗ Failed to create Renderer:', error);
                throw error;
            }
            
            // Initialize ParticleSystem
            try {
                console.log('Creating ParticleSystem...');
                this.particleSystem = new ParticleSystem();
                console.log('✓ ParticleSystem created successfully');
            } catch (error) {
                console.error('✗ Failed to create ParticleSystem:', error);
                throw error;
            }
            
            // Initialize AudioManager
            try {
                console.log('Creating AudioManager...');
                this.audioManager = new AudioManager();
                console.log('✓ AudioManager created successfully');
            } catch (error) {
                console.error('✗ Failed to create AudioManager:', error);
                throw error;
            }
            
            // Initialize UIManager
            try {
                console.log('Creating UIManager...');
                this.uiManager = new UIManager();
                window.uiManager = this.uiManager; // Set global instance for onclick handlers
                console.log('✓ UIManager created successfully');
                console.log('UIManager instance:', this.uiManager);
            } catch (error) {
                console.error('✗ Failed to create UIManager:', error);
                throw error;
            }
            
            // Initialize CombatUI only if UIManager is ready
            try {
                console.log('Creating CombatUI...');
                if (!this.uiManager) {
                    throw new Error('UIManager not available for CombatUI');
                }
                this.combatUI = new CombatUI(this.uiManager);
                window.combatUI = this.combatUI;
                console.log('✓ CombatUI created successfully');
            } catch (error) {
                console.error('✗ Failed to create CombatUI:', error);
                throw error;
            }
            
            // Initialize audio visualizer
            try {
                if (this.uiManager && this.uiManager.initAudioVisualizer) {
                    this.uiManager.initAudioVisualizer();
                    console.log('✓ Audio visualizer initialized');
                }
            } catch (error) {
                console.error('✗ Failed to initialize audio visualizer:', error);
                // Non-critical error, continue
            }
            
            // Generate initial space environment
            try {
                this.generateSpaceEnvironment();
                console.log('✓ Space environment generated');
            } catch (error) {
                console.error('✗ Failed to generate space environment:', error);
                // Non-critical error, continue
            }
            
            // Start render loop
            try {
                this.startRenderLoop();
                console.log('✓ Render loop started');
            } catch (error) {
                console.error('✗ Failed to start render loop:', error);
                throw error;
            }
            
            console.log('✓ GameEngine.init() completed successfully');
        } catch (error) {
            console.error('✗ Critical error in GameEngine.init():', error);
            
            // Show error to user
            const loadingText = document.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = 'Error initializing game. Please refresh the page.';
                loadingText.style.color = 'var(--danger-color)';
            }
            
            throw error;
        }
    };
    
    // Also add timeout handling for initialization
    const initTimeout = setTimeout(() => {
        const loadingText = document.querySelector('.loading-text');
        if (loadingText && loadingText.textContent === 'Initializing ship systems...') {
            loadingText.textContent = 'Initialization taking longer than expected...';
            console.warn('Game initialization timeout - checking for issues');
            
            // Check if critical components exist
            if (!window.gameEngine) {
                console.error('GameEngine not created');
            } else {
                console.log('GameEngine exists:', window.gameEngine);
                if (!window.gameEngine.renderer) console.error('Renderer not created');
                if (!window.gameEngine.particleSystem) console.error('ParticleSystem not created');
                if (!window.gameEngine.audioManager) console.error('AudioManager not created');
                if (!window.gameEngine.uiManager) console.error('UIManager not created');
                if (!window.gameEngine.combatUI) console.error('CombatUI not created');
            }
        }
    }, 10000); // 10 second timeout
    
    // Clear timeout when initialization completes
    const originalShowScreen = UIManager.prototype.showScreen;
    UIManager.prototype.showScreen = function(screenName) {
        if (screenName === 'mainMenu') {
            clearTimeout(initTimeout);
        }
        return originalShowScreen.call(this, screenName);
    };
});

console.log('Initialization fix loaded and ready');
