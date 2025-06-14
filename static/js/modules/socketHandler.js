// Socket Handler Module for Cosmic Explorer
// Manages all WebSocket communication with the server

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
        
        this.socket.on('joined_session', (data) => {
            console.log('Joined session:', data.session_id);
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
        
        // Pass combat state if available
        if (event.combat_state) {
            event.combat_state = event.combat_state;
        } else if (event.result && event.result.combat_state) {
            event.combat_state = event.result.combat_state;
        }
        
        // Delegate to effects manager for visual/audio effects
        this.gameEngine.effectsManager.handleEventEffects(event);
        
        // Handle combat events specially
        if (event.type === 'combat_start' || event.type === 'combat' || event.type === 'combat_end') {
            this.handleCombatEvent(event);
        }
        
        // Show choices if available (except for combat which uses its own UI)
        // Ensure choices exist, are an array, and have at least one element
        if (event.choices && Array.isArray(event.choices) && event.choices.length > 0 && 
            event.type !== 'combat_start' && event.type !== 'combat') {
            // Validate that choices are strings and not empty
            const validChoices = event.choices.filter(choice => 
                typeof choice === 'string' && choice.trim().length > 0
            );
            
            if (validChoices.length > 0) {
                // Only show modal if we have a valid message/title
                const modalTitle = event.message || event.title || 'Make a Choice';
                if (modalTitle && modalTitle.trim().length > 0) {
                    this.gameEngine.uiManager.showChoiceModal(
                        modalTitle, 
                        validChoices, 
                        (choice) => {
                            this.gameEngine.sendAction('choice', { choice });
                        }
                    );
                } else {
                    console.warn('Event had no valid title/message for choices:', event);
                }
            } else {
                console.warn('Event had invalid choices:', event.choices);
            }
        }
    }
    
    handleCombatEvent(event) {
        const combatUI = this.gameEngine.combatUI;
        if (!combatUI) return;
        
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
                    
                    // Update enemy health on renderer
                    if (this.gameEngine.renderer) {
                        this.gameEngine.renderer.updateEnemyHealth(
                            ongoingCombatState.enemy_hp,
                            ongoingCombatState.enemy_max_hp
                        );
                    }
                    
                    // Add log entries for combat messages
                    if (event.message) {
                        const messages = event.message.split('\n').filter(m => m.trim());
                        messages.forEach(msg => {
                            const type = msg.includes('damage') || msg.includes('Hit') ? 'damage' : 
                                       msg.includes('Missed') || msg.includes('evade') ? 'normal' : 'success';
                            combatUI.addLogEntry(msg, type);
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
    
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }
}

// Export for use in other modules
export default SocketHandler;
