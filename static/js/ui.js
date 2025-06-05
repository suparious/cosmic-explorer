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
                podIndicator.style.display = 'inline-block';
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
}

// Export for use in other modules
window.UIManager = UIManager;
