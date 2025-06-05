// Main Game Engine for Cosmic Explorer
class GameEngine {
    constructor() {
        this.socket = null;
        this.sessionId = 'default';
        this.gameState = null;
        this.renderer = null;
        this.particleSystem = null;
        this.audioManager = null;
        this.uiManager = null;
        this.isRunning = false;
        this.lastFrameTime = 0;
        
        // Game objects for visualization
        this.currentLocation = null;
        this.destinations = [];
    }
    
    async init() {
        try {
            console.log('GameEngine.init() starting...');
            
            // Initialize socket connection
            this.socket = io();
            this.setupSocketHandlers();
            
            // Initialize subsystems
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
            console.log('UIManager created:', this.uiManager);
            
            // Initialize audio visualizer
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
    
    setupSocketHandlers() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.socket.emit('join_session', { session_id: this.sessionId });
        });
        
        this.socket.on('game_state', (state) => {
            this.gameState = state;
            this.uiManager.updateHUD(state);
            
            // Update music based on game state
            if (this.audioManager) {
                this.audioManager.updateMusicForGameState(state);
            }
            
            // Check for game over or victory
            if (state.game_over) {
                if (state.victory) {
                    this.uiManager.showVictory('Victory! You have amassed great wealth!');
                } else {
                    this.uiManager.showGameOver('Your journey has ended.');
                }
            }
        });
        
        this.socket.on('game_event', (event) => {
            this.handleGameEvent(event);
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
    }
    
    handleGameEvent(event) {
        // Add to event log
        this.uiManager.addEventMessage(event.message, event.type);
        
        // Play appropriate sound
        switch (event.type) {
            case 'navigation':
                this.audioManager.playSound('navigate');
                this.renderer.createThrustParticles();
                break;
            case 'scan':
                this.audioManager.playSound('scan');
                this.renderer.startScanEffect();
                break;
            case 'repair':
                this.audioManager.playSound('repair');
                this.createHealingEffect();
                break;
            case 'danger':
                this.audioManager.playAlertSound();
                this.shakeScreen();
                break;
            case 'success':
                this.audioManager.playSound('success');
                this.createSuccessEffect();
                break;
            case 'explosion':
                this.audioManager.playExplosionSound();
                this.renderer.createExplosion(this.renderer.ship.x, this.renderer.ship.y);
                break;
            case 'heal':
                this.audioManager.playSound('success');
                this.createHealingEffect();
                // Add healing animation to health bar
                const healthBar = document.querySelector('.health-fill');
                if (healthBar) {
                    healthBar.parentElement.classList.add('healing-effect');
                    setTimeout(() => healthBar.parentElement.classList.remove('healing-effect'), 1000);
                }
                break;
            case 'pod_activated':
                this.audioManager.playAlertSound();
                this.createPodEjectionEffect();
                this.uiManager.showNotification('ESCAPE POD ACTIVATED!', 'warning');
                break;
            case 'purchase':
                this.audioManager.playSound('success');
                // Refresh augmentations modal if it's open
                const modal = document.getElementById('choice-modal');
                const modalTitle = document.getElementById('choice-title');
                if (modal && modal.style.display !== 'none' && modalTitle && modalTitle.textContent === 'Pod Augmentations') {
                    this.uiManager.showAugmentationsModal();
                }
                break;
        }
        
        // Show choices if available
        if (event.choices && event.choices.length > 0) {
            this.uiManager.showChoiceModal(event.message, event.choices, (choice) => {
                this.sendAction('choice', { choice });
            });
        }
    }
    
    async sendAction(action, data = {}) {
        const response = await fetch(`${GameConfig.game.apiUrl}/game/action/${this.sessionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...data })
        });
        
        const result = await response.json();
        if (!result.success) {
            this.uiManager.showNotification('Action failed', 'danger');
        }
    }
    
    async startNewGame() {
        const response = await fetch(`${GameConfig.game.apiUrl}/game/new`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: this.sessionId })
        });
        
        const result = await response.json();
        if (result.success) {
            this.gameState = result.game_state;
            this.uiManager.updateHUD(this.gameState);
            this.audioManager.playMusic();
            this.generateSpaceEnvironment();
        }
    }
    
    async loadGame() {
        // TODO: Implement save game loading
        this.startNewGame();
    }
    
    // Game actions
    navigate() {
        this.sendAction('navigate');
        
        // Animate ship movement
        const angle = Math.random() * Math.PI * 2;
        const distance = 200 + Math.random() * 300;
        const targetX = this.renderer.ship.x + Math.cos(angle) * distance;
        const targetY = this.renderer.ship.y + Math.sin(angle) * distance;
        
        // Different effects for pod mode
        if (this.gameState && this.gameState.player_stats.in_pod_mode) {
            this.audioManager.playSound('alert');
            // Slower, more erratic movement in pod
            this.animatePodMovement(targetX, targetY);
        } else {
            // Create warp effect
            this.audioManager.playWarpSound();
            this.createWarpEffect();
            // Move ship
            this.animateShipMovement(targetX, targetY);
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
    
    showAugmentations() {
        // Show pod augmentations modal
        if (this.gameState && this.gameState.at_repair_location && this.gameState.player_stats.has_flight_pod) {
            this.uiManager.showAugmentationsModal();
        } else {
            this.uiManager.showNotification('Must be at repair location with pod to view augmentations', 'info');
        }
    }
    
    sendDistressSignal() {
        this.sendAction('distress_signal');
    }
    
    scanArea() {
        this.sendAction('event');
        this.renderer.startScanEffect();
        this.audioManager.playSound('scan');
    }
    
    repair() {
        if (this.gameState && this.gameState.at_repair_location) {
            this.sendAction('repair');
        }
    }
    
    showInventory() {
        // Open ship modal directly to inventory tab
        this.uiManager.showShipModal();
        setTimeout(() => this.uiManager.showShipTab('inventory'), 100);
    }
    
    showQuests() {
        if (this.gameState && this.gameState.active_quest) {
            const quest = this.gameState.active_quest;
            this.uiManager.showChoiceModal(
                `Quest: ${quest.name}`,
                [`Status: ${quest.status}`, 'Close'],
                () => {}
            );
        } else {
            this.uiManager.showNotification('No active quests', 'info');
        }
    }
    
    showMap() {
        // TODO: Implement star map
        this.uiManager.showNotification('Star map coming soon!', 'info');
    }
    
    buyPod() {
        this.sendAction('buy_pod');
    }
    
    buyShip() {
        this.sendAction('buy_ship');
    }
    
    sendDistressSignal() {
        this.sendAction('distress_signal');
    }
    
    showPodMods() {
        if (!this.gameState || !this.gameState.player_stats.has_flight_pod) {
            this.uiManager.showNotification('You need a pod to install modifications!', 'danger');
            return;
        }
        
        if (this.gameState.player_stats.in_pod_mode) {
            this.uiManager.showNotification('Cannot modify pod while in pod mode!', 'danger');
            return;
        }
        
        // Show available augmentations
        this.uiManager.showPodModsModal(this.gameState);
    }
    
    buyAugmentation(augmentationId) {
        this.sendAction('buy_augmentation', { augmentation_id: augmentationId });
    }
    
    consumeFood(amount) {
        this.sendAction('consume_food', { amount: amount });
    }
    
    // Visual effects
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
    
    animateShipMovement(targetX, targetY) {
        const startX = this.renderer.ship.x;
        const startY = this.renderer.ship.y;
        const duration = 2000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            // Update ship position
            this.renderer.ship.x = startX + (targetX - startX) * easeProgress;
            this.renderer.ship.y = startY + (targetY - startY) * easeProgress;
            
            // Create thrust particles
            if (progress < 1 && Math.random() < 0.5) {
                this.renderer.createThrustParticles();
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    animatePodMovement(targetX, targetY) {
        const startX = this.renderer.ship.x;
        const startY = this.renderer.ship.y;
        const duration = 3000; // Slower than ship
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // More erratic movement for pod
            const wobble = Math.sin(elapsed * 0.01) * 5;
            const easeProgress = 1 - Math.pow(1 - progress, 2);
            
            // Update pod position
            this.renderer.ship.x = startX + (targetX - startX) * easeProgress + wobble;
            this.renderer.ship.y = startY + (targetY - startY) * easeProgress;
            
            // Create small thrust particles
            if (progress < 1 && Math.random() < 0.3) {
                const particle = {
                    x: this.renderer.ship.x,
                    y: this.renderer.ship.y,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 20,
                    maxLife: 20,
                    size: 1,
                    color: '255, 200, 0'
                };
                this.renderer.particles.push(particle);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    createWarpEffect() {
        const ship = this.renderer.ship;
        const emitter = this.particleSystem.createEmitter({
            x: ship.x,
            y: ship.y,
            rate: 100,
            lifetime: 1000,
            particleLife: 30,
            particleSize: 2,
            particleColor: '255, 255, 255',
            particleSpeed: 10,
            particleSpread: 0.3
        });
        
        // Update emitter position with ship
        const updateEmitter = setInterval(() => {
            emitter.x = this.renderer.ship.x;
            emitter.y = this.renderer.ship.y;
        }, 16);
        
        setTimeout(() => {
            clearInterval(updateEmitter);
            this.particleSystem.removeEmitter(emitter);
        }, 1000);
    }
    
    createHealingEffect() {
        const ship = this.renderer.ship;
        this.particleSystem.emit(ship.x, ship.y, 20, {
            ...ParticleEffects.healing,
            direction: -Math.PI / 2
        });
    }
    
    createSuccessEffect() {
        const ship = this.renderer.ship;
        this.particleSystem.emit(ship.x, ship.y, 30, ParticleEffects.sparkle);
    }
    
    shakeScreen() {
        const canvas = this.renderer.canvas;
        const originalTransform = canvas.style.transform;
        let shakeIntensity = 10;
        
        const shake = () => {
            if (shakeIntensity <= 0) {
                canvas.style.transform = originalTransform;
                return;
            }
            
            const x = (Math.random() - 0.5) * shakeIntensity;
            const y = (Math.random() - 0.5) * shakeIntensity;
            canvas.style.transform = `translate(${x}px, ${y}px)`;
            
            shakeIntensity -= 0.5;
            requestAnimationFrame(shake);
        };
        
        shake();
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
    
    createPodEjectionEffect() {
        const ship = this.renderer.ship;
        
        // Create explosion effect at ship location
        this.renderer.createExplosion(ship.x, ship.y);
        
        // Create ejection particles
        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 * i) / 50;
            const speed = 5 + Math.random() * 10;
            const particle = {
                x: ship.x,
                y: ship.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 60,
                maxLife: 60,
                size: Math.random() * 3 + 1,
                color: '255, 200, 0'
            };
            this.renderer.particles.push(particle);
        }
        
        // Screen shake effect
        this.shakeScreen();
    }
}

// Export for use in other modules
window.GameEngine = GameEngine;
