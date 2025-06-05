// UI Manager for Cosmic Explorer
class UIManager {
    constructor() {
        console.log('UIManager constructor called');
        
        try {
            this.screens = {
                loading: document.getElementById('loading-screen'),
                mainMenu: document.getElementById('main-menu'),
                game: document.getElementById('game-screen'),
                settings: document.getElementById('settings-screen')
            };
            
            console.log('Screens loaded:', this.screens);
            
            // Check if all screens were found
            for (const [name, element] of Object.entries(this.screens)) {
                if (!element) {
                    console.error(`Screen element '${name}' not found`);
                }
            }
            
            this.currentScreen = 'loading';
            this.eventLog = [];
            this.maxEventLogSize = 5;
            
            // Initialize styles after DOM is ready
            this.initStyles();
            
            console.log('UIManager initialized successfully');
        } catch (error) {
            console.error('Error in UIManager constructor:', error);
            throw error;
        }
    }
    
    initStyles() {
        // Add CSS for notifications and critical states
        const style = document.createElement('style');
        style.textContent = `
.notification {
    padding: 1rem 2rem;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    backdrop-filter: blur(10px);
    font-family: 'Space Mono', monospace;
    color: var(--text-primary);
}

.notification-info {
    border-color: var(--primary-color);
}

.notification-success {
    border-color: var(--success-color);
    color: var(--success-color);
}

.notification-danger {
    border-color: var(--danger-color);
    color: var(--danger-color);
}

.event-message {
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.03);
}

.event-timestamp {
    color: var(--text-secondary);
    font-size: 0.8rem;
}

.event-info {
    border-left: 3px solid var(--primary-color);
}

.event-success {
    border-left: 3px solid var(--success-color);
}

.event-danger {
    border-left: 3px solid var(--danger-color);
}

.event-quest {
    border-left: 3px solid var(--accent-color);
}

.critical {
    animation: critical-flash 1s ease-in-out infinite;
}

@keyframes critical-flash {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

@keyframes slide-down {
    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
}

@keyframes fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
}

.action-btn.available {
    border-color: var(--success-color);
    animation: pulse 2s ease-in-out infinite;
}
`;
        document.head.appendChild(style);
    }
    
    showScreen(screenName) {
        // Check if screens are loaded
        if (!this.screens[screenName]) {
            console.error(`Screen ${screenName} not found`);
            return;
        }
        
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
            }
        });
        
        // Show requested screen
        this.screens[screenName].classList.add('active');
        this.currentScreen = screenName;
    }
    
    updateHUD(gameState) {
        if (!gameState || !gameState.player_stats) return;
        
        const stats = gameState.player_stats;
        
        // Update health
        const healthValue = document.getElementById('health-value');
        if (healthValue) healthValue.textContent = stats.health;
        
        const healthBar = document.querySelector('.health-fill');
        if (healthBar) healthBar.style.width = `${(stats.health / 100) * 100}%`;
        
        // Update fuel
        const fuelValue = document.getElementById('fuel-value');
        if (fuelValue) fuelValue.textContent = stats.fuel;
        
        const fuelBar = document.querySelector('.fuel-fill');
        if (fuelBar) fuelBar.style.width = `${(stats.fuel / 100) * 100}%`;
        
        // Update ship condition or pod HP
        const shipValue = document.getElementById('ship-value');
        const shipBar = document.querySelector('.ship-fill');
        const shipIcon = document.querySelector('.ship-icon');
        
        if (stats.in_pod_mode) {
            // Show pod HP instead of ship condition
            if (shipValue) shipValue.textContent = `POD: ${stats.pod_hp}`;
            if (shipBar) {
                shipBar.style.width = `${(stats.pod_hp / stats.pod_max_hp) * 100}%`;
                shipBar.style.backgroundColor = '#FFA500';
            }
            if (shipIcon) {
                shipIcon.innerHTML = '🛸'; // Pod icon
            }
        } else {
            // Normal ship condition display
            if (shipValue) shipValue.textContent = stats.ship_condition;
            if (shipBar) {
                shipBar.style.width = `${(stats.ship_condition / stats.max_ship_condition) * 100}%`;
                shipBar.style.backgroundColor = ''; // Reset to default
            }
            if (shipIcon) {
                shipIcon.innerHTML = '🚀'; // Ship icon
            }
        }
        
        // Pod indicator when owned but not in use
        if (stats.has_flight_pod && !stats.in_pod_mode) {
            const podIndicator = document.getElementById('pod-owned-indicator');
            if (podIndicator) {
                podIndicator.style.display = 'flex';
                // Update pod HP display with real values
                const podHpSpan = podIndicator.querySelector('.pod-hp');
                if (podHpSpan) {
                    podHpSpan.textContent = `(${stats.pod_hp || 30}/${stats.pod_max_hp || 30} HP)`;
                }
                
                // Show augmentations count if any
                const augCount = stats.pod_augmentations ? stats.pod_augmentations.length : 0;
                if (augCount > 0) {
                    const augSpan = podIndicator.querySelector('.aug-count');
                    if (!augSpan) {
                        const newAugSpan = document.createElement('span');
                        newAugSpan.className = 'aug-count';
                        newAugSpan.style.cssText = 'font-size: 0.7rem; color: #FFD700; margin-left: 0.5rem;';
                        podIndicator.appendChild(newAugSpan);
                    }
                    const augSpan2 = podIndicator.querySelector('.aug-count');
                    if (augSpan2) augSpan2.textContent = `[${augCount} mods]`;
                }
            }
        } else {
            const podIndicator = document.getElementById('pod-owned-indicator');
            if (podIndicator) {
                podIndicator.style.display = 'none';
            }
        }
        
        // Update resources
        const wealthValue = document.getElementById('wealth-value');
        if (wealthValue) wealthValue.textContent = stats.wealth;
        
        const foodValue = document.getElementById('food-value');
        if (foodValue) foodValue.textContent = stats.food;
        
        // Update turn counter
        const turnValue = document.getElementById('turn-value');
        if (turnValue) turnValue.textContent = `${gameState.turn_count}/${gameState.max_turns}`;
        
        // Update quest indicator
        const questIndicator = document.getElementById('quest-indicator');
        if (questIndicator) {
            if (gameState.active_quest) {
                questIndicator.style.display = 'flex';
                const questName = document.getElementById('quest-name');
                const questStatus = document.getElementById('quest-status');
                if (questName) questName.textContent = gameState.active_quest.name;
                if (questStatus) questStatus.textContent = gameState.active_quest.status;
            } else {
                questIndicator.style.display = 'none';
            }
        }
        
        // Update action buttons
        const repairBtn = document.getElementById('repair-btn');
        const actionPanel = document.getElementById('action-panel');
        
        if (stats.in_pod_mode) {
            // Pod mode actions
            this.updatePodModeActions(gameState, stats);
        } else {
            // Normal mode actions
            if (repairBtn) {
                if (gameState.at_repair_location && stats.wealth >= 100 && !stats.in_pod_mode) {
                    repairBtn.disabled = false;
                    repairBtn.classList.add('available');
                } else {
                    repairBtn.disabled = true;
                    repairBtn.classList.remove('available');
                }
            }
            
            // Show buy pod button if at repair location
            if (gameState.at_repair_location && !stats.has_flight_pod && stats.wealth >= 500) {
                this.showBuyPodButton();
            } else {
                this.hideBuyPodButton();
            }
            
            // Show pod mods button if has pod and at repair location
            if (gameState.at_repair_location && stats.has_flight_pod && !stats.in_pod_mode) {
                this.showPodModsButton();
            } else {
                this.hidePodModsButton();
            }
        }
        
        // Flash warnings for critical stats
        if (healthBar) {
            if (stats.health < 30) {
                healthBar.classList.add('critical');
            } else {
                healthBar.classList.remove('critical');
            }
        }
        
        if (fuelBar) {
            if (stats.fuel < 20) {
                fuelBar.classList.add('critical');
            } else {
                fuelBar.classList.remove('critical');
            }
        }
        
        if (shipBar) {
            if (stats.in_pod_mode && stats.pod_hp < 10) {
                shipBar.classList.add('critical');
            } else if (!stats.in_pod_mode && stats.ship_condition < 30) {
                shipBar.classList.add('critical');
            } else {
                shipBar.classList.remove('critical');
            }
        }
    }
    
    addEventMessage(message, type = 'info') {
        const eventContent = document.getElementById('event-content');
        if (!eventContent) return;
        
        // Create new message element
        const messageEl = document.createElement('p');
        messageEl.className = `event-message event-${type}`;
        messageEl.textContent = message;
        
        // Add timestamp
        const timestamp = new Date().toLocaleTimeString();
        const timestampEl = document.createElement('span');
        timestampEl.className = 'event-timestamp';
        timestampEl.textContent = `[${timestamp}] `;
        messageEl.insertBefore(timestampEl, messageEl.firstChild);
        
        // Add to log
        eventContent.appendChild(messageEl);
        this.eventLog.push({ message, type, timestamp });
        
        // Limit log size
        while (eventContent.children.length > this.maxEventLogSize) {
            eventContent.removeChild(eventContent.firstChild);
        }
        
        // Scroll to bottom
        eventContent.scrollTop = eventContent.scrollHeight;
        
        // Add animation
        messageEl.style.animation = 'slide-up 0.3s ease-out';
    }
    
    showChoiceModal(title, choices, callback) {
        const modal = document.getElementById('choice-modal');
        const titleEl = document.getElementById('choice-title');
        const choiceList = document.getElementById('choice-list');
        
        if (!modal || !titleEl || !choiceList) return;
        
        // Set title
        titleEl.textContent = title;
        
        // Clear previous choices
        choiceList.innerHTML = '';
        
        // Add choices
        choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = `${index + 1}. ${choice}`;
            btn.onclick = () => {
                this.hideChoiceModal();
                callback(index + 1);
            };
            choiceList.appendChild(btn);
        });
        
        // Show modal
        modal.style.display = 'flex';
        modal.style.animation = 'fade-in 0.3s ease-out';
    }
    
    hideChoiceModal() {
        const modal = document.getElementById('choice-modal');
        if (!modal) return;
        
        modal.style.animation = 'fade-out 0.3s ease-out';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Position at top center
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.zIndex = '9999';
        
        document.body.appendChild(notification);
        
        // Animate in
        notification.style.animation = 'slide-down 0.3s ease-out';
        
        // Remove after duration
        setTimeout(() => {
            notification.style.animation = 'slide-up 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    startNewGame() {
        this.showScreen('game');
        if (window.gameEngine) {
            window.gameEngine.startNewGame();
        }
    }
    
    loadGame() {
        // TODO: Implement save game loading
        this.showNotification('Loading saved game...', 'info');
        this.showScreen('game');
        if (window.gameEngine) {
            window.gameEngine.loadGame();
        }
    }
    
    showSettings() {
        this.showScreen('settings');
    }
    
    hideSettings() {
        this.showScreen('mainMenu');
        
        // Apply settings
        const masterVolume = document.getElementById('master-volume');
        const sfxVolume = document.getElementById('sfx-volume');
        const musicVolume = document.getElementById('music-volume');
        
        if (masterVolume && sfxVolume && musicVolume && window.audioManager) {
            window.audioManager.setMasterVolume(masterVolume.value / 100);
            window.audioManager.setSFXVolume(sfxVolume.value / 100);
            window.audioManager.setMusicVolume(musicVolume.value / 100);
        }
    }
    
    showCredits() {
        this.showNotification('Created with x.ai Grok-3 and Claude Opus 4', 'info', 5000);
    }
    
    showGameOver(message) {
        this.addEventMessage(message, 'danger');
        this.showChoiceModal('Game Over', ['Start New Game', 'Return to Main Menu'], (choice) => {
            if (choice === 1) {
                this.startNewGame();
            } else {
                this.showScreen('mainMenu');
            }
        });
    }
    
    showVictory(message) {
        this.addEventMessage(message, 'success');
        this.showChoiceModal('Victory!', ['Start New Game', 'Return to Main Menu'], (choice) => {
            if (choice === 1) {
                this.startNewGame();
            } else {
                this.showScreen('mainMenu');
            }
        });
    }
    
    updatePodModeActions(gameState, stats) {
        // Disable most buttons in pod mode
        const buttons = ['repair-btn', 'scan-btn', 'inventory-btn', 'quests-btn'];
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) btn.disabled = true;
        });
        
        // Show buy ship button if at location
        if (gameState.at_repair_location && stats.wealth >= 400) {
            this.showBuyShipButton();
        } else {
            this.hideBuyShipButton();
        }
    }
    
    showBuyPodButton() {
        let buyPodBtn = document.getElementById('buy-pod-btn');
        if (!buyPodBtn) {
            // Create button if it doesn't exist
            buyPodBtn = document.createElement('button');
            buyPodBtn.id = 'buy-pod-btn';
            buyPodBtn.className = 'action-btn available';
            buyPodBtn.innerHTML = '<span class="btn-icon">🛸</span><span>Buy Pod</span>';
            buyPodBtn.onclick = () => {
                if (window.gameEngine) window.gameEngine.buyPod();
            };
            
            const actionPanel = document.getElementById('action-panel');
            if (actionPanel) {
                actionPanel.appendChild(buyPodBtn);
            }
        }
        buyPodBtn.style.display = 'flex';
    }
    
    hideBuyPodButton() {
        const buyPodBtn = document.getElementById('buy-pod-btn');
        if (buyPodBtn) {
            buyPodBtn.style.display = 'none';
        }
    }
    
    showBuyShipButton() {
        let buyShipBtn = document.getElementById('buy-ship-btn');
        if (!buyShipBtn) {
            // Create button if it doesn't exist
            buyShipBtn = document.createElement('button');
            buyShipBtn.id = 'buy-ship-btn';
            buyShipBtn.className = 'action-btn available';
            buyShipBtn.innerHTML = '<span class="btn-icon">🚀</span><span>Buy Ship</span>';
            buyShipBtn.onclick = () => {
                if (window.gameEngine) window.gameEngine.buyShip();
            };
            
            const actionPanel = document.getElementById('action-panel');
            if (actionPanel) {
                actionPanel.appendChild(buyShipBtn);
            }
        }
        buyShipBtn.style.display = 'flex';
    }
    
    hideBuyShipButton() {
        const buyShipBtn = document.getElementById('buy-ship-btn');
        if (buyShipBtn) {
            buyShipBtn.style.display = 'none';
        }
    }
    
    showPodModsButton() {
        let podModsBtn = document.getElementById('pod-mods-btn');
        if (!podModsBtn) {
            // Create button if it doesn't exist
            podModsBtn = document.createElement('button');
            podModsBtn.id = 'pod-mods-btn';
            podModsBtn.className = 'action-btn available';
            podModsBtn.innerHTML = '<span class="btn-icon">🔧</span><span>Pod Mods</span>';
            podModsBtn.onclick = () => {
                this.showPodModsModal();
            };
            
            const actionPanel = document.getElementById('action-panel');
            if (actionPanel) {
                actionPanel.appendChild(podModsBtn);
            }
        }
        podModsBtn.style.display = 'flex';
    }
    
    hidePodModsButton() {
        const podModsBtn = document.getElementById('pod-mods-btn');
        if (podModsBtn) {
            podModsBtn.style.display = 'none';
        }
    }
    
    showPodModsModal() {
        // Create modal if it doesn't exist
        let modal = document.getElementById('pod-mods-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'pod-mods-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content pod-mods-content">
                    <h3>🔧 Pod Augmentations</h3>
                    <p class="modal-subtitle">Enhance your pod with powerful upgrades. Warning: All augmentations are lost if pod is used!</p>
                    <div id="augmentations-list" class="augmentations-list"></div>
                    <button class="modal-close-btn" onclick="window.uiManager.hidePodModsModal()">Close</button>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Populate augmentations
        this.updateAugmentationsList();
        
        // Show modal
        modal.style.display = 'flex';
        modal.style.animation = 'fade-in 0.3s ease-out';
    }
    
    hidePodModsModal() {
        const modal = document.getElementById('pod-mods-modal');
        if (modal) {
            modal.style.animation = 'fade-out 0.3s ease-out';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    updateAugmentationsList() {
        const listEl = document.getElementById('augmentations-list');
        if (!listEl || !window.gameEngine || !window.gameEngine.gameState) return;
        
        const gameState = window.gameEngine.gameState;
        const stats = gameState.player_stats;
        const augmentations = [
            {
                id: 'shield_boost',
                icon: '🛡️',
                name: 'Shield Boost Matrix',
                description: 'Increases maximum ship HP by 20',
                cost: 300
            },
            {
                id: 'scanner_array',
                icon: '📡',
                name: 'Advanced Scanner Array',
                description: 'Doubles rewards from positive scan events',
                cost: 400
            },
            {
                id: 'cargo_module',
                icon: '📦',
                name: 'Emergency Cargo Module',
                description: 'Preserves 50% of wealth when pod is used',
                cost: 500
            },
            {
                id: 'emergency_thrusters',
                icon: '🚀',
                name: 'Emergency Thrusters',
                description: 'Reduces fuel consumption by 20%',
                cost: 250
            }
        ];
        
        listEl.innerHTML = '';
        
        augmentations.forEach(aug => {
            const augEl = document.createElement('div');
            augEl.className = 'augmentation-item';
            
            const isOwned = stats.pod_augmentations && stats.pod_augmentations.includes(aug.id);
            const canAfford = stats.wealth >= aug.cost;
            
            augEl.innerHTML = `
                <div class="aug-icon">${aug.icon}</div>
                <div class="aug-info">
                    <div class="aug-name">${aug.name}</div>
                    <div class="aug-description">${aug.description}</div>
                </div>
                <div class="aug-action">
                    ${isOwned ? 
                        '<span class="aug-owned">Installed</span>' : 
                        `<button class="aug-buy-btn ${canAfford ? '' : 'disabled'}" 
                            ${canAfford ? `onclick="window.gameEngine.buyAugmentation('${aug.id}')"` : 'disabled'}>
                            ${aug.cost} 💰
                        </button>`
                    }
                </div>
            `;
            
            listEl.appendChild(augEl);
        });
    }
    
    showPodModsButton() {
        let podModsBtn = document.getElementById('pod-mods-btn');
        if (!podModsBtn) {
            // Create button if it doesn't exist
            podModsBtn = document.createElement('button');
            podModsBtn.id = 'pod-mods-btn';
            podModsBtn.className = 'action-btn available';
            podModsBtn.innerHTML = '<span class="btn-icon">✨</span><span>Pod Mods</span>';
            podModsBtn.onclick = () => {
                this.showPodModsModal();
            };
            
            const actionPanel = document.getElementById('action-panel');
            if (actionPanel) {
                actionPanel.appendChild(podModsBtn);
            }
        }
        podModsBtn.style.display = 'flex';
    }
    
    hidePodModsButton() {
        const podModsBtn = document.getElementById('pod-mods-btn');
        if (podModsBtn) {
            podModsBtn.style.display = 'none';
        }
    }
    
    showPodModsModal() {
        if (!window.gameEngine || !window.gameEngine.gameState) return;
        
        const gameState = window.gameEngine.gameState;
        const playerStats = gameState.player_stats;
        
        // Create modal if it doesn't exist
        let modal = document.getElementById('pod-mods-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'pod-mods-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content pod-mods-content">
                    <h3>🛸 Pod Augmentations</h3>
                    <p class="modal-subtitle">Enhance your ship with pod-based technology. All augmentations are lost if pod is used!</p>
                    <div id="augmentations-list" class="augmentations-grid"></div>
                    <button class="menu-btn" onclick="window.uiManager.hidePodModsModal()">Close</button>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Populate augmentations
        const augList = document.getElementById('augmentations-list');
        augList.innerHTML = '';
        
        const augmentations = [
            { id: 'shield_boost', name: 'Shield Boost Matrix', icon: '🛡️', cost: 300, description: 'Increases maximum ship HP by 20' },
            { id: 'scanner_array', name: 'Advanced Scanner Array', icon: '📡', cost: 400, description: 'Doubles rewards from positive scan events' },
            { id: 'cargo_module', name: 'Emergency Cargo Module', icon: '📦', cost: 500, description: 'Preserves 50% of wealth when pod is used' },
            { id: 'emergency_thrusters', name: 'Emergency Thrusters', icon: '🚀', cost: 250, description: 'Reduces fuel consumption by 20%' }
        ];
        
        augmentations.forEach(aug => {
            const isOwned = playerStats.pod_augmentations && playerStats.pod_augmentations.includes(aug.id);
            const canAfford = playerStats.wealth >= aug.cost;
            
            const augCard = document.createElement('div');
            augCard.className = 'augmentation-card';
            if (isOwned) augCard.classList.add('owned');
            if (!canAfford && !isOwned) augCard.classList.add('disabled');
            
            augCard.innerHTML = `
                <div class="aug-icon">${aug.icon}</div>
                <div class="aug-name">${aug.name}</div>
                <div class="aug-description">${aug.description}</div>
                <div class="aug-cost">${isOwned ? 'Installed' : `${aug.cost} credits`}</div>
                ${!isOwned ? `<button class="aug-buy-btn" ${!canAfford ? 'disabled' : ''} onclick="window.uiManager.buyAugmentation('${aug.id}')">Purchase</button>` : ''}
            `;
            
            augList.appendChild(augCard);
        });
        
        modal.style.display = 'flex';
    }
    
    hidePodModsModal() {
        const modal = document.getElementById('pod-mods-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    buyAugmentation(augId) {
        if (window.gameEngine) {
            window.gameEngine.sendAction('buy_augmentation', { augmentation_id: augId });
            // Modal will refresh when game state updates
            setTimeout(() => this.showPodModsModal(), 500);
        }
    }
    
    showAugmentationsButton() {
        let augBtn = document.getElementById('augmentations-btn');
        if (!augBtn) {
            // Create button if it doesn't exist
            augBtn = document.createElement('button');
            augBtn.id = 'augmentations-btn';
            augBtn.className = 'action-btn available';
            augBtn.innerHTML = '<span class="btn-icon">⚙️</span><span>Pod Mods</span>';
            augBtn.onclick = () => {
                if (window.gameEngine) window.gameEngine.showAugmentations();
            };
            
            const actionPanel = document.getElementById('action-panel');
            if (actionPanel) {
                actionPanel.appendChild(augBtn);
            }
        }
        augBtn.style.display = 'flex';
    }
    
    hideAugmentationsButton() {
        const augBtn = document.getElementById('augmentations-btn');
        if (augBtn) {
            augBtn.style.display = 'none';
        }
    }
    
    showAugmentationsModal() {
        if (!window.gameEngine || !window.gameEngine.gameState) return;
        
        const gameState = window.gameEngine.gameState;
        const installedAugs = gameState.player_stats.pod_augmentations || [];
        const wealth = gameState.player_stats.wealth;
        
        // Define available augmentations
        const augmentations = [
            { id: 'shield_boost', name: 'Shield Boost Matrix', desc: 'Increases max ship HP by 20', cost: 300, icon: '🛡️' },
            { id: 'scanner_array', name: 'Advanced Scanner Array', desc: 'Doubles scan event rewards', cost: 400, icon: '📡' },
            { id: 'cargo_module', name: 'Emergency Cargo Module', desc: 'Preserves 50% wealth when pod used', cost: 500, icon: '📦' },
            { id: 'emergency_thrusters', name: 'Emergency Thrusters', desc: 'Reduces fuel consumption by 20%', cost: 250, icon: '🚀' }
        ];
        
        let content = '<div class="augmentations-list">';
        
        augmentations.forEach(aug => {
            const isInstalled = installedAugs.includes(aug.id);
            const canAfford = wealth >= aug.cost;
            
            content += `
                <div class="augmentation-item ${isInstalled ? 'installed' : ''} ${!canAfford && !isInstalled ? 'disabled' : ''}">
                    <div class="aug-icon">${aug.icon}</div>
                    <div class="aug-info">
                        <div class="aug-name">${aug.name}</div>
                        <div class="aug-desc">${aug.desc}</div>
                    </div>
                    <div class="aug-action">
                        ${isInstalled ? 
                            '<span class="aug-status">Installed</span>' : 
                            `<button class="aug-buy-btn" ${canAfford ? `onclick="window.gameEngine.buyAugmentation('${aug.id}')"` : 'disabled'}>
                                ${aug.cost} 💰
                            </button>`
                        }
                    </div>
                </div>
            `;
        });
        
        content += '</div>';
        
        // Add some info about augmentations
        content += '<div class="aug-info-text">Pod augmentations enhance your ship while the pod is attached. All augmentations are lost when the pod is used!</div>';
        
        // Add close button
        content += '<button class="close-aug-modal-btn" onclick="document.getElementById(\'choice-modal\').style.display = \'none\'">Close</button>';
        
        this.showChoiceModal('Pod Augmentations', [], () => {});
        
        // Replace the choice content with augmentations content
        const choiceList = document.getElementById('choice-list');
        if (choiceList) {
            choiceList.innerHTML = content;
        }
    }
}

// Export for use in other modules
window.UIManager = UIManager;
