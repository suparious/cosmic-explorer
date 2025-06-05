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
        // Initialize socket connection
        this.socket = io();
        this.setupSocketHandlers();
        
        // Initialize subsystems
        const canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(canvas);
        this.particleSystem = new ParticleSystem();
        this.audioManager = new AudioManager();
        this.uiManager = new UIManager();
        
        // Generate initial space environment
        this.generateSpaceEnvironment();
        
        // Start render loop
        this.startRenderLoop();
    }
    
    setupSocketHandlers() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.socket.emit('join_session', { session_id: this.sessionId });
        });
        
        this.socket.on('game_state', (state) => {
            this.gameState = state;
            this.uiManager.updateHUD(state);
            
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
        
        // Create warp effect
        this.audioManager.playWarpSound();
        this.createWarpEffect();
        
        // Move ship
        this.animateShipMovement(targetX, targetY);
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
        // TODO: Implement inventory modal
        this.uiManager.showNotification('Inventory coming soon!', 'info');
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
        }
        
        // Render
        this.renderer.render(this.gameState);
        this.particleSystem.render(this.renderer.ctx);
        
        requestAnimationFrame(() => this.renderLoop());
    }
}

// Export for use in other modules
window.GameEngine = GameEngine;
