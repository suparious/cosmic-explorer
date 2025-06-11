// Combat UI module for Cosmic Explorer
class CombatUI {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.combatModal = null;
        this.combatState = null;
        this.isAnimating = false;
    }
    
    showCombat(combatState, choices) {
        this.combatState = combatState;
        
        // Create modal if it doesn't exist
        if (!this.combatModal) {
            this.createCombatModal();
        }
        
        // Update combat display
        this.updateCombatDisplay();
        this.updateCombatActions(choices);
        
        // Show modal
        this.combatModal.style.display = 'flex';
        this.combatModal.classList.add('combat-active');
        
        // Start combat animations
        this.startCombatAnimations();
    }
    
    createCombatModal() {
        this.combatModal = document.createElement('div');
        this.combatModal.id = 'combat-modal';
        this.combatModal.className = 'modal combat-modal';
        this.combatModal.innerHTML = `
            <div class="combat-container">
                <div class="combat-header">
                    <h2>⚔️ COMBAT ENCOUNTER ⚔️</h2>
                </div>
                
                <div class="combat-arena">
                    <div class="combatant player-side">
                        <div class="combatant-icon" id="player-ship-icon">🚀</div>
                        <div class="combatant-name">Your Ship</div>
                        <div class="health-bar">
                            <div class="health-fill player-health" id="player-combat-health"></div>
                            <span class="health-text" id="player-health-text">100/100</span>
                        </div>
                        <div class="combat-effects" id="player-effects"></div>
                    </div>
                    
                    <div class="combat-center">
                        <div class="combat-effects-area" id="combat-effects"></div>
                        <div class="turn-indicator" id="turn-indicator">Turn 1</div>
                    </div>
                    
                    <div class="combatant enemy-side">
                        <div class="combatant-icon" id="enemy-icon">👾</div>
                        <div class="combatant-name" id="enemy-name">Enemy</div>
                        <div class="health-bar">
                            <div class="health-fill enemy-health" id="enemy-combat-health"></div>
                            <span class="health-text" id="enemy-health-text">100/100</span>
                        </div>
                        <div class="combat-effects" id="enemy-effects"></div>
                    </div>
                </div>
                
                <div class="combat-log" id="combat-log">
                    <div class="log-entry">Combat started!</div>
                </div>
                
                <div class="combat-actions" id="combat-actions">
                    <!-- Actions will be populated dynamically -->
                </div>
            </div>
        `;
        
        document.body.appendChild(this.combatModal);
        
        // Add combat-specific styles
        this.addCombatStyles();
    }
    
    addCombatStyles() {
        if (document.getElementById('combat-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'combat-styles';
        style.textContent = `
            .combat-modal {
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(10px);
            }
            
            .combat-container {
                background: linear-gradient(135deg, rgba(20, 0, 40, 0.9), rgba(40, 0, 20, 0.9));
                border: 3px solid var(--danger-color);
                border-radius: 20px;
                padding: 2rem;
                max-width: 900px;
                width: 95%;
                box-shadow: 0 0 50px rgba(255, 0, 0, 0.5);
                animation: combat-pulse 2s ease-in-out infinite;
            }
            
            @keyframes combat-pulse {
                0%, 100% { box-shadow: 0 0 30px rgba(255, 0, 0, 0.3); }
                50% { box-shadow: 0 0 60px rgba(255, 0, 0, 0.6); }
            }
            
            .combat-header {
                text-align: center;
                margin-bottom: 2rem;
                color: var(--danger-color);
                text-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
            }
            
            .combat-arena {
                display: grid;
                grid-template-columns: 1fr auto 1fr;
                gap: 2rem;
                margin-bottom: 2rem;
                min-height: 300px;
            }
            
            .combatant {
                text-align: center;
                padding: 1rem;
                background: var(--glass-bg);
                border: 2px solid var(--glass-border);
                border-radius: 15px;
                position: relative;
            }
            
            .combatant-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
                filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
                animation: combat-idle 2s ease-in-out infinite;
            }
            
            @keyframes combat-idle {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            .combatant-icon.attacking {
                animation: attack-animation 0.5s ease-out;
            }
            
            @keyframes attack-animation {
                0% { transform: scale(1) translateX(0); }
                50% { transform: scale(1.3) translateX(20px); }
                100% { transform: scale(1) translateX(0); }
            }
            
            .combatant-icon.damaged {
                animation: damage-animation 0.5s ease-out;
            }
            
            @keyframes damage-animation {
                0%, 100% { transform: translateX(0); filter: brightness(1); }
                25% { transform: translateX(-10px); filter: brightness(2) hue-rotate(180deg); }
                75% { transform: translateX(10px); filter: brightness(2) hue-rotate(180deg); }
            }
            
            .combatant-name {
                font-family: 'Orbitron', sans-serif;
                font-weight: 700;
                font-size: 1.2rem;
                margin-bottom: 1rem;
                color: var(--primary-color);
            }
            
            .health-bar {
                width: 100%;
                height: 30px;
                background: rgba(0, 0, 0, 0.5);
                border: 2px solid var(--glass-border);
                border-radius: 15px;
                position: relative;
                overflow: hidden;
            }
            
            .health-fill {
                height: 100%;
                transition: width 0.5s ease-out;
            }
            
            .player-health {
                background: linear-gradient(90deg, #00ff00, #00cc00);
            }
            
            .enemy-health {
                background: linear-gradient(90deg, #ff0000, #cc0000);
            }
            
            .health-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-weight: 700;
                color: white;
                text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
            }
            
            .combat-effects {
                margin-top: 1rem;
                min-height: 30px;
            }
            
            .combat-center {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            
            .combat-effects-area {
                width: 150px;
                height: 150px;
                position: relative;
            }
            
            .combat-effect {
                position: absolute;
                font-size: 3rem;
                animation: effect-burst 1s ease-out forwards;
            }
            
            @keyframes effect-burst {
                0% { 
                    transform: translate(-50%, -50%) scale(0) rotate(0deg);
                    opacity: 0;
                }
                50% { 
                    transform: translate(-50%, -50%) scale(1.5) rotate(180deg);
                    opacity: 1;
                }
                100% { 
                    transform: translate(-50%, -50%) scale(0) rotate(360deg);
                    opacity: 0;
                }
            }
            
            .turn-indicator {
                margin-top: 1rem;
                padding: 0.5rem 1rem;
                background: var(--glass-bg);
                border: 1px solid var(--primary-color);
                border-radius: 20px;
                font-weight: 700;
                color: var(--primary-color);
            }
            
            .combat-log {
                height: 100px;
                overflow-y: auto;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid var(--glass-border);
                border-radius: 10px;
                padding: 1rem;
                margin-bottom: 1.5rem;
                font-family: 'Space Mono', monospace;
                font-size: 0.9rem;
            }
            
            .log-entry {
                margin-bottom: 0.5rem;
                padding: 0.25rem;
                border-left: 3px solid var(--primary-color);
                padding-left: 0.5rem;
            }
            
            .log-entry.damage {
                border-left-color: var(--danger-color);
                color: var(--danger-color);
            }
            
            .log-entry.success {
                border-left-color: var(--success-color);
                color: var(--success-color);
            }
            
            .combat-actions {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }
            
            .combat-action-btn {
                background: var(--glass-bg);
                border: 2px solid var(--primary-color);
                color: var(--text-primary);
                padding: 1rem 1.5rem;
                border-radius: 10px;
                font-family: 'Orbitron', sans-serif;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .combat-action-btn:hover {
                background: rgba(0, 255, 255, 0.2);
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(0, 255, 255, 0.5);
            }
            
            .combat-action-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .combat-action-btn::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: width 0.3s, height 0.3s;
            }
            
            .combat-action-btn:active::before {
                width: 300px;
                height: 300px;
            }
            
            .damage-number {
                position: absolute;
                font-size: 2rem;
                font-weight: 700;
                color: #ff0000;
                text-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
                animation: damage-float 1s ease-out forwards;
                pointer-events: none;
            }
            
            @keyframes damage-float {
                0% { 
                    transform: translateY(0);
                    opacity: 1;
                }
                100% { 
                    transform: translateY(-50px);
                    opacity: 0;
                }
            }
            
            .combat-reward {
                text-align: center;
                padding: 2rem;
                background: linear-gradient(135deg, rgba(0, 255, 0, 0.1), rgba(255, 255, 0, 0.1));
                border: 2px solid var(--success-color);
                border-radius: 15px;
                margin-top: 1rem;
            }
            
            .reward-title {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--success-color);
                margin-bottom: 1rem;
            }
            
            .reward-items {
                display: flex;
                justify-content: center;
                gap: 2rem;
                flex-wrap: wrap;
            }
            
            .reward-item {
                text-align: center;
            }
            
            .reward-icon {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }
            
            .reward-text {
                font-weight: 600;
                color: var(--accent-color);
            }
        `;
        
        document.head.appendChild(style);
    }
    
    updateCombatDisplay() {
        if (!this.combatState) return;
        
        // Update player health
        const playerHealthBar = document.getElementById('player-combat-health');
        const playerHealthText = document.getElementById('player-health-text');
        const playerHealthPercent = (this.combatState.player_hp / this.combatState.player_max_hp) * 100;
        
        if (playerHealthBar) playerHealthBar.style.width = `${playerHealthPercent}%`;
        if (playerHealthText) playerHealthText.textContent = `${this.combatState.player_hp}/${this.combatState.player_max_hp}`;
        
        // Update enemy info
        const enemyIcon = document.getElementById('enemy-icon');
        const enemyName = document.getElementById('enemy-name');
        const enemyHealthBar = document.getElementById('enemy-combat-health');
        const enemyHealthText = document.getElementById('enemy-health-text');
        const enemyHealthPercent = (this.combatState.enemy_hp / this.combatState.enemy_max_hp) * 100;
        
        if (enemyIcon) enemyIcon.textContent = this.combatState.enemy_data.icon;
        if (enemyName) enemyName.textContent = this.combatState.enemy_data.name;
        if (enemyHealthBar) enemyHealthBar.style.width = `${enemyHealthPercent}%`;
        if (enemyHealthText) enemyHealthText.textContent = `${this.combatState.enemy_hp}/${this.combatState.enemy_max_hp}`;
        
        // Update turn indicator
        const turnIndicator = document.getElementById('turn-indicator');
        if (turnIndicator) turnIndicator.textContent = `Turn ${this.combatState.turn}`;
        
        // Update ship icon based on type
        const playerIcon = document.getElementById('player-ship-icon');
        if (playerIcon && window.gameEngine && window.gameEngine.gameState) {
            const shipType = window.gameEngine.gameState.player_stats.ship_type;
            const shipTypes = window.gameEngine.gameState.ship_types || {};
            if (shipTypes[shipType]) {
                playerIcon.textContent = shipTypes[shipType].icon;
            }
        }
    }
    
    updateCombatActions(choices) {
        const actionsDiv = document.getElementById('combat-actions');
        if (!actionsDiv) return;
        
        actionsDiv.innerHTML = '';
        
        // Map choices to action handlers
        const actionMap = {
            'Attack': () => this.performCombatAction('attack'),
            'Precise Shot': () => this.performCombatAction('precise_shot'),
            'Barrage': () => this.performCombatAction('barrage'),
            'Evasive Maneuvers': () => this.performCombatAction('evasive'),
            'Flee': () => this.performFlee(),
            'Negotiate': () => this.performNegotiate()
        };
        
        // Add available combat actions if in combat
        if (this.combatState && this.combatState.available_actions && choices[0] === 'Attack') {
            // Replace basic attack with available actions
            this.combatState.available_actions.forEach(actionId => {
                const actionInfo = window.COMBAT_ACTIONS ? window.COMBAT_ACTIONS[actionId] : null;
                if (actionInfo) {
                    const btn = document.createElement('button');
                    btn.className = 'combat-action-btn';
                    btn.innerHTML = `
                        <div>${actionInfo.name}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${actionInfo.description}</div>
                    `;
                    btn.onclick = () => this.performCombatAction(actionId);
                    actionsDiv.appendChild(btn);
                }
            });
            
            // Add flee and negotiate
            ['Flee', 'Negotiate'].forEach(action => {
                const btn = document.createElement('button');
                btn.className = 'combat-action-btn';
                btn.textContent = action;
                btn.onclick = actionMap[action];
                actionsDiv.appendChild(btn);
            });
        } else {
            // Standard choices
            choices.forEach(choice => {
                const btn = document.createElement('button');
                btn.className = 'combat-action-btn';
                btn.textContent = choice;
                btn.onclick = actionMap[choice] || (() => console.log('Unknown action:', choice));
                actionsDiv.appendChild(btn);
            });
        }
    }
    
    performCombatAction(actionId) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.disableActions();
        
        // Show attack animation
        this.playAttackAnimation('player');
        
        // Trigger visual attack effect on renderer
        if (window.gameEngine && window.gameEngine.renderer) {
            const renderer = window.gameEngine.renderer;
            // Find the first enemy
            const enemy = renderer.enemies[0];
            if (enemy) {
                renderer.firePlayerProjectile(enemy.x, enemy.y);
                // Play appropriate weapon sound based on action
                if (window.gameEngine.audioManager) {
                    window.gameEngine.audioManager.playWeaponSound(actionId);
                }
            }
        }
        
        // Send action to server
        if (window.gameEngine) {
            window.gameEngine.sendAction('combat_action', { combat_action: actionId });
        }
        
        setTimeout(() => {
            this.isAnimating = false;
            this.enableActions();
        }, 1000);
    }
    
    performFlee() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.disableActions();
        
        if (window.gameEngine) {
            window.gameEngine.sendAction('flee');
        }
        
        setTimeout(() => {
            this.isAnimating = false;
            this.enableActions();
        }, 1000);
    }
    
    performNegotiate() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.disableActions();
        
        if (window.gameEngine) {
            window.gameEngine.sendAction('negotiate');
        }
        
        setTimeout(() => {
            this.isAnimating = false;
            this.enableActions();
        }, 1000);
    }
    
    playAttackAnimation(attacker) {
        const attackerIcon = attacker === 'player' ? 
            document.getElementById('player-ship-icon') : 
            document.getElementById('enemy-icon');
            
        if (attackerIcon) {
            attackerIcon.classList.add('attacking');
            setTimeout(() => attackerIcon.classList.remove('attacking'), 500);
        }
        
        // Show combat effect
        const effectsArea = document.getElementById('combat-effects');
        if (effectsArea) {
            const effect = document.createElement('div');
            effect.className = 'combat-effect';
            effect.textContent = '💥';
            effect.style.left = '50%';
            effect.style.top = '50%';
            effectsArea.appendChild(effect);
            
            setTimeout(() => effect.remove(), 1000);
        }
    }
    
    playDamageAnimation(target, damage) {
        const targetIcon = target === 'player' ? 
            document.getElementById('player-ship-icon') : 
            document.getElementById('enemy-icon');
            
        if (targetIcon) {
            targetIcon.classList.add('damaged');
            setTimeout(() => targetIcon.classList.remove('damaged'), 500);
            
            // Show damage number
            const damageNum = document.createElement('div');
            damageNum.className = 'damage-number';
            damageNum.textContent = `-${damage}`;
            damageNum.style.left = '50%';
            damageNum.style.top = '50%';
            targetIcon.parentElement.appendChild(damageNum);
            
            setTimeout(() => damageNum.remove(), 1000);
        }
    }
    
    addLogEntry(message, type = 'normal') {
        const combatLog = document.getElementById('combat-log');
        if (!combatLog) return;
        
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;
        combatLog.appendChild(entry);
        
        // Auto-scroll to bottom
        combatLog.scrollTop = combatLog.scrollHeight;
        
        // Limit log entries
        while (combatLog.children.length > 10) {
            combatLog.removeChild(combatLog.firstChild);
        }
    }
    
    showCombatRewards(rewards) {
        const container = document.querySelector('.combat-container');
        if (!container) return;
        
        const rewardDiv = document.createElement('div');
        rewardDiv.className = 'combat-reward';
        rewardDiv.innerHTML = `
            <div class="reward-title">Victory!</div>
            <div class="reward-items">
                ${rewards.wealth > 0 ? `
                    <div class="reward-item">
                        <div class="reward-icon">💰</div>
                        <div class="reward-text">${rewards.wealth} Credits</div>
                    </div>
                ` : ''}
                ${rewards.items && rewards.items.length > 0 ? rewards.items.map(item => `
                    <div class="reward-item">
                        <div class="reward-icon">${window.gameEngine.gameState.item_types[item.item_id]?.icon || '📦'}</div>
                        <div class="reward-text">${item.quantity}x ${window.gameEngine.gameState.item_types[item.item_id]?.name || item.item_id}</div>
                    </div>
                `).join('') : ''}
            </div>
            <button class="combat-action-btn" style="margin-top: 1rem;" onclick="window.combatUI.hideCombat()">Continue</button>
        `;
        
        container.appendChild(rewardDiv);
    }
    
    hideCombat() {
        if (this.combatModal) {
            this.combatModal.classList.remove('combat-active');
            setTimeout(() => {
                this.combatModal.style.display = 'none';
            }, 300);
        }
    }
    
    disableActions() {
        document.querySelectorAll('.combat-action-btn').forEach(btn => {
            btn.disabled = true;
        });
    }
    
    enableActions() {
        document.querySelectorAll('.combat-action-btn').forEach(btn => {
            btn.disabled = false;
        });
    }
    
    startCombatAnimations() {
        // Add ambient combat effects periodically
        if (this.animationInterval) clearInterval(this.animationInterval);
        
        this.animationInterval = setInterval(() => {
            if (!this.combatModal || this.combatModal.style.display === 'none') {
                clearInterval(this.animationInterval);
                return;
            }
            
            // Random sparkles or energy effects
            if (Math.random() < 0.3) {
                const effectsArea = document.getElementById('combat-effects');
                if (effectsArea) {
                    const effect = document.createElement('div');
                    effect.className = 'combat-effect';
                    effect.textContent = ['✨', '⚡', '🌟'][Math.floor(Math.random() * 3)];
                    effect.style.left = `${Math.random() * 100}%`;
                    effect.style.top = `${Math.random() * 100}%`;
                    effect.style.fontSize = '1.5rem';
                    effectsArea.appendChild(effect);
                    
                    setTimeout(() => effect.remove(), 1000);
                }
            }
        }, 2000);
    }
}

// Export for use
window.CombatUI = CombatUI;

// Also make COMBAT_ACTIONS available globally for the UI
window.COMBAT_ACTIONS = {
    "attack": {
        "name": "Attack",
        "description": "Fire all weapons at the enemy"
    },
    "precise_shot": {
        "name": "Precise Shot",
        "description": "Careful aim for +50% accuracy"
    },
    "barrage": {
        "name": "Barrage",
        "description": "Maximum firepower, -30% accuracy"
    },
    "evasive": {
        "name": "Evasive Maneuvers",
        "description": "Focus on dodging enemy fire"
    }
};
