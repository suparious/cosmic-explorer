// Main Game Engine for Cosmic Explorer
// Refactored into a more modular structure

// SocketHandler - manages WebSocket communication
class SocketHandler {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.socket = null;
        this.isConnected = false;
    }
    
    init() {
        console.log('Initializing socket connection...');
        this.socket = io();
        this.setupHandlers();
        return this.socket;
    }
    
    setupHandlers() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.isConnected = true;
            this.joinSession(this.gameEngine.sessionId);
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.isConnected = false;
        });
        
        this.socket.on('game_state', (state) => {
            this.handleGameState(state);
        });
        
        this.socket.on('game_event', (event) => {
            this.handleGameEvent(event);
        });
    }
    
    joinSession(sessionId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('join_session', { session_id: sessionId });
        }
    }
    
    handleGameState(state) {
        this.gameEngine.gameState = state;
        this.gameEngine.uiManager.updateHUD(state);
        
        // Mark that we have an active game when we receive game state
        if (state && !state.game_over) {
            this.gameEngine.uiManager.hasActiveGame = true;
            this.gameEngine.uiManager.updateContinueButtonVisibility();
        }
        
        // Dispatch custom event for other components
        document.dispatchEvent(new CustomEvent('gameStateUpdated', {
            detail: state
        }));
        
        // Update music based on game state
        if (this.gameEngine.audioManager) {
            this.gameEngine.audioManager.updateMusicForGameState(state);
        }
        
        // Check for game over or victory
        if (state.game_over) {
            if (state.victory) {
                this.gameEngine.uiManager.showVictory('Victory! You have amassed great wealth!');
            } else {
                this.gameEngine.uiManager.showGameOver('Your journey has ended.');
            }
        }
    }
    
    handleGameEvent(event) {
        // Add to event log
        this.gameEngine.uiManager.addEventMessage(event.message, event.type);
        
        // Delegate to effects manager for visual/audio effects
        this.gameEngine.effectsManager.handleEventEffects(event);
        
        // Handle combat events specially
        if (event.type === 'combat_start' || event.type === 'combat' || event.type === 'combat_end') {
            this.handleCombatEvent(event);
        }
        
        // Show choices if available (except for combat which uses its own UI)
        if (event.choices && event.choices.length > 0 && event.type !== 'combat_start' && event.type !== 'combat') {
            this.gameEngine.uiManager.showChoiceModal(event.message, event.choices, (choice) => {
                this.gameEngine.sendAction('choice', { choice });
            });
        }
    }
    
    handleCombatEvent(event) {
        const combatUI = this.gameEngine.combatUI;
        if (!combatUI) return;
        
        // Center camera on combat events
        if (this.gameEngine.renderer && this.gameEngine.renderer.ship) {
            this.gameEngine.renderer.centerCameraOn(
                this.gameEngine.renderer.ship.x, 
                this.gameEngine.renderer.ship.y
            );
        }
        
        switch (event.type) {
            case 'combat_start':
                const combatState = event.combat_state || (event.result && event.result.combat_state);
                if (combatState) {
                    combatUI.showCombat(combatState, event.choices || ['Attack', 'Flee', 'Negotiate']);
                }
                break;
                
            case 'combat':
                const ongoingCombatState = event.combat_state || (event.result && event.result.combat_state);
                if (ongoingCombatState) {
                    combatUI.updateCombatDisplay(ongoingCombatState);
                    combatUI.updateCombatActions(event.choices || ['Attack', 'Flee', 'Negotiate']);
                    
                    // Add log entries for combat messages
                    if (event.message) {
                        const messages = event.message.split('\n').filter(m => m.trim());
                        messages.forEach(msg => {
                            const type = msg.includes('damage') || msg.includes('Hit') ? 'damage' : 
                                       msg.includes('Missed') || msg.includes('evade') ? 'normal' : 'success';
                            combatUI.addLogEntry(msg, type);
                            
                            // Play weapon sound when player attacks
                            if (msg.includes('You attack') || msg.includes('You fire') || msg.includes('Your attack')) {
                                const weaponType = this.gameEngine.effectsManager.determineWeaponType(this.gameEngine.gameState);
                                this.gameEngine.audioManager.playWeaponSound(weaponType);
                            }
                            
                            // Play explosion sound when enemy is destroyed
                            if (msg.includes('destroyed') || msg.includes('explodes')) {
                                this.gameEngine.audioManager.playExplosionSound();
                            }
                        });
                    }
                }
                break;
                
            case 'combat_end':
                if (event.rewards) {
                    combatUI.showCombatRewards(event.rewards);
                } else {
                    combatUI.hideCombat();
                }
                break;
        }
    }
}

// EffectsManager - handles visual and audio effects
class EffectsManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
    }
    
    handleEventEffects(event) {
        const audioManager = this.gameEngine.audioManager;
        const renderer = this.gameEngine.renderer;
        const uiManager = this.gameEngine.uiManager;
        
        switch (event.type) {
            case 'navigation':
                audioManager.playSound('navigate');
                renderer.createThrustParticles();
                // Check if we arrived at a station and play docking sound
                if (event.arrived_at && event.arrived_at.includes('station')) {
                    setTimeout(() => audioManager.playDockingSound(), 1500);
                }
                break;
                
            case 'scan':
                audioManager.playSound('scan');
                renderer.startScanEffect();
                break;
                
            case 'repair':
                audioManager.playSound('repair');
                this.createHealingEffect();
                break;
                
            case 'danger':
                audioManager.playAlertSound();
                this.shakeScreen();
                // Center camera on ship during danger
                renderer.centerCameraOn(renderer.ship.x, renderer.ship.y);
                break;
                
            case 'success':
                audioManager.playSound('success');
                this.createSuccessEffect();
                break;
                
            case 'explosion':
                audioManager.playExplosionSound();
                renderer.createExplosion(renderer.ship.x, renderer.ship.y);
                // Center camera on explosion
                renderer.centerCameraOn(renderer.ship.x, renderer.ship.y);
                break;
                
            case 'heal':
                audioManager.playSound('success');
                this.createHealingEffect();
                this.animateHealthBar();
                break;
                
            case 'pod_activated':
                audioManager.playAlertSound();
                this.createPodEjectionEffect();
                uiManager.showNotification('ESCAPE POD ACTIVATED!', 'warning');
                // Center camera on pod ejection
                renderer.centerCameraOn(renderer.ship.x, renderer.ship.y);
                break;
                
            case 'purchase':
            audioManager.playPurchaseSound();
            this.refreshAugmentationsModal();
            break;
                    
                case 'item_received':
                    // Play item pickup sound based on value
                    if (event.item_value) {
                        audioManager.playItemPickup(event.item_value);
                    } else {
                        audioManager.playItemPickup(100); // Default for unknown value
                    }
                    break;
                    
                case 'quest_accepted':
                    audioManager.playQuestAcceptSound();
                    break;
                    
                case 'quest_completed':
                    audioManager.playQuestCompleteSound();
                    break;
                    
                case 'achievement':
                    audioManager.playAchievementSound();
                    break;
                
            case 'combat_start':
                audioManager.playAlertSound();
                // Center camera on combat
                renderer.centerCameraOn(renderer.ship.x, renderer.ship.y);
                break;
                
            case 'damage':
            case 'critical_damage':
                audioManager.playAlertSound();
                this.shakeScreen();
                // Center camera on damage event
                renderer.centerCameraOn(renderer.ship.x, renderer.ship.y);
                break;
                
            case 'item_sold':
                audioManager.playSellSound();
                break;
        }
    }
    
    // Determine weapon type from game state
    determineWeaponType(gameState) {
        if (!gameState || !gameState.player_stats) return 'laser_cannon';
        
        const shipMods = gameState.player_stats.ship_mods || {};
        const highSlotMods = shipMods.high || [];
        
        // Check for specific weapon mods in high slots
        if (highSlotMods.includes('missile_launcher')) {
            return 'missile_launcher';
        } else if (highSlotMods.includes('railgun')) {
            return 'precise_shot';
        } else if (highSlotMods.includes('autocannon')) {
            return 'barrage';
        }
        
        // Default to laser cannon
        return 'laser_cannon';
    }
    
    createWarpEffect() {
        const ship = this.gameEngine.renderer.ship;
        const particleSystem = this.gameEngine.particleSystem;
        const emitter = particleSystem.createEmitter({
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
            emitter.x = this.gameEngine.renderer.ship.x;
            emitter.y = this.gameEngine.renderer.ship.y;
        }, 16);
        
        setTimeout(() => {
            clearInterval(updateEmitter);
            particleSystem.removeEmitter(emitter);
        }, 1000);
    }
    
    createHealingEffect() {
        const ship = this.gameEngine.renderer.ship;
        this.gameEngine.particleSystem.emit(ship.x, ship.y, 20, {
            ...ParticleEffects.healing,
            direction: -Math.PI / 2
        });
    }
    
    createSuccessEffect() {
        const ship = this.gameEngine.renderer.ship;
        this.gameEngine.particleSystem.emit(ship.x, ship.y, 30, ParticleEffects.sparkle);
    }
    
    createPodEjectionEffect() {
        const ship = this.gameEngine.renderer.ship;
        
        // Create explosion effect at ship location
        this.gameEngine.renderer.createExplosion(ship.x, ship.y);
        
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
            this.gameEngine.renderer.particles.push(particle);
        }
        
        // Screen shake effect
        this.shakeScreen();
    }
    
    animateShipMovement(targetX, targetY) {
        const renderer = this.gameEngine.renderer;
        const startX = renderer.ship.x;
        const startY = renderer.ship.y;
        const duration = 2000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            // Update ship position
            renderer.ship.x = startX + (targetX - startX) * easeProgress;
            renderer.ship.y = startY + (targetY - startY) * easeProgress;
            
            // Update camera to follow ship
            renderer.centerCameraOn(renderer.ship.x, renderer.ship.y);
            
            // Create thrust particles
            if (progress < 1 && Math.random() < 0.5) {
                renderer.createThrustParticles();
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    animatePodMovement(targetX, targetY) {
        const renderer = this.gameEngine.renderer;
        const startX = renderer.ship.x;
        const startY = renderer.ship.y;
        const duration = 3000; // Slower than ship
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // More erratic movement for pod
            const wobble = Math.sin(elapsed * 0.01) * 5;
            const easeProgress = 1 - Math.pow(1 - progress, 2);
            
            // Update pod position
            renderer.ship.x = startX + (targetX - startX) * easeProgress + wobble;
            renderer.ship.y = startY + (targetY - startY) * easeProgress;
            
            // Update camera to follow pod
            renderer.centerCameraOn(renderer.ship.x, renderer.ship.y);
            
            // Create small thrust particles
            if (progress < 1 && Math.random() < 0.3) {
                const particle = {
                    x: renderer.ship.x,
                    y: renderer.ship.y,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 20,
                    maxLife: 20,
                    size: 1,
                    color: '255, 200, 0'
                };
                renderer.particles.push(particle);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    shakeScreen() {
        const canvas = this.gameEngine.renderer.canvas;
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
    
    animateHealthBar() {
        const healthBar = document.querySelector('.health-fill');
        if (healthBar) {
            healthBar.parentElement.classList.add('healing-effect');
            setTimeout(() => healthBar.parentElement.classList.remove('healing-effect'), 1000);
        }
    }
    
    refreshAugmentationsModal() {
        const modal = document.getElementById('choice-modal');
        const modalTitle = document.getElementById('choice-title');
        if (modal && modal.style.display !== 'none' && modalTitle && modalTitle.textContent === 'Pod Augmentations') {
            this.gameEngine.uiManager.showAugmentationsModal();
        }
    }
}

// Main Game Engine
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
        
        // Game objects for visualization
        this.currentLocation = null;
        this.destinations = [];
    }
    
    async init() {
        try {
            console.log('GameEngine.init() starting...');
            
            // Initialize socket handler
            this.socketHandler = new SocketHandler(this);
            this.socketHandler.init();
            
            // Initialize effects manager
            this.effectsManager = new EffectsManager(this);
            
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
    
    async sendAction(action, data = {}) {
        const response = await fetch(`${GameConfig.game.apiUrl}/game/action/${this.sessionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...data })
        });
        
        const result = await response.json();
        if (result.success) {
            // Update game state
            if (result.game_state) {
                this.gameState = result.game_state;
                
                // Dispatch custom event for state changes
                document.dispatchEvent(new CustomEvent('gameStateUpdated', {
                    detail: this.gameState
                }));
            }
        } else {
            this.uiManager.showNotification('Action failed', 'danger');
        }
        
        return result;
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
            
            // Update region theme immediately
            if (this.gameState.current_location && this.gameState.current_location.region) {
                this.renderer.updateRegionTheme(this.gameState.current_location.region);
            }
        }
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
            this.effectsManager.animatePodMovement(targetX, targetY);
        } else {
            // Create warp effect
            this.audioManager.playWarpSound();
            this.effectsManager.createWarpEffect();
            // Move ship
            this.effectsManager.animateShipMovement(targetX, targetY);
        }
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
        this.audioManager.playMiningSound();
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
    
    consumeFood(amount) {
        this.sendAction('consume_food', { amount: amount });
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
    
    showAugmentations() {
        // Show pod augmentations modal
        if (this.gameState && this.gameState.at_repair_location && this.gameState.player_stats.has_flight_pod) {
            this.uiManager.showAugmentationsModal();
        } else {
            this.uiManager.showNotification('Must be at repair location with pod to view augmentations', 'info');
        }
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
    
    // Save/Load compatibility methods
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
window.GameEngine = GameEngine;
