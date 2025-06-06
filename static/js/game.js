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
            
            console.log('Creating CombatUI...');
            this.combatUI = new CombatUI(this.uiManager);
            window.combatUI = this.combatUI;
            
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
            
            // Dispatch custom event for other components
            document.dispatchEvent(new CustomEvent('gameStateUpdated', {
                detail: state
            }));
            
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
            case 'combat_start':
                this.audioManager.playAlertSound();
                // Store combat state in the event or get from result
                const combatState = event.combat_state || (event.result && event.result.combat_state);
                if (combatState && this.combatUI) {
                    this.combatUI.showCombat(combatState, event.choices || ['Attack', 'Flee', 'Negotiate']);
                }
                break;
            case 'combat':
                const ongoingCombatState = event.combat_state || (event.result && event.result.combat_state);
                if (ongoingCombatState && this.combatUI) {
                    this.combatUI.updateCombatDisplay(ongoingCombatState);
                    this.combatUI.updateCombatActions(event.choices || ['Attack', 'Flee', 'Negotiate']);
                    // Add log entries for combat messages
                    if (event.message) {
                        const messages = event.message.split('\n').filter(m => m.trim());
                        messages.forEach(msg => {
                            const type = msg.includes('damage') || msg.includes('Hit') ? 'damage' : 
                                       msg.includes('Missed') || msg.includes('evade') ? 'normal' : 'success';
                            this.combatUI.addLogEntry(msg, type);
                        });
                    }
                }
                break;
            case 'combat_end':
                if (event.rewards && this.combatUI) {
                    this.combatUI.showCombatRewards(event.rewards);
                } else if (this.combatUI) {
                    this.combatUI.hideCombat();
                }
                break;
        }
        
        // Show choices if available (except for combat which uses its own UI)
        if (event.choices && event.choices.length > 0 && event.type !== 'combat_start' && event.type !== 'combat') {
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
        if (result.success) {
            // Update game state and save after successful action
            if (result.game_state) {
                this.gameState = result.game_state;
                this.saveGameState();
                
                // Dispatch custom event for state changes
                document.dispatchEvent(new CustomEvent('gameStateUpdated', {
                    detail: this.gameState
                }));
            }
        } else {
            this.uiManager.showNotification('Action failed', 'danger');
        }
    }
    
    async startNewGame() {
        // Clear any existing save data to force new star map generation
        localStorage.removeItem('cosmic_explorer_save');
        
        const response = await fetch(`${GameConfig.game.apiUrl}/game/new`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: this.sessionId, force_new: true })
        });
        
        const result = await response.json();
        if (result.success) {
            this.gameState = result.game_state;
            this.uiManager.updateHUD(this.gameState);
            this.audioManager.playMusic();
            this.generateSpaceEnvironment();
            
            // Save the new game state
            this.saveGameState();
            
            // Update region theme immediately
            if (this.gameState.current_location && this.gameState.current_location.region) {
                this.renderer.updateRegionTheme(this.gameState.current_location.region);
            }
        }
    }
    
    async loadGame() {
        // Show the save/load modal in load mode instead of using localStorage
        this.uiManager.showSaveLoadModal('load');
    }
    
    saveGameState() {
        // Auto-save is now handled by the backend after turn-consuming actions
        // This function is kept for compatibility but does nothing
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
        // Show star map with navigation options
        if (this.gameState && this.gameState.star_map) {
            this.fetchNavigationOptions().then(options => {
                this.uiManager.showStarMap(this.gameState.star_map, options);
            });
        } else {
            this.uiManager.showNotification('Star map unavailable!', 'error');
        }
    }
    
    mine() {
        this.sendAction('mine');
        // Play mining sound effect
        this.audioManager.playSound('scan'); // Using scan sound for now
        // Add visual effect
        const ship = this.renderer.ship;
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
                this.renderer.particles.push(particle);
            }
        }
    }
    
    async fetchNavigationOptions() {
        try {
            const response = await fetch(`${GameConfig.game.apiUrl}/game/navigation_options/${this.sessionId}`);
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
