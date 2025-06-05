// UI Manager for Cosmic Explorer
class UIManager {
    constructor() {
        this.screens = {
            loading: document.getElementById('loading-screen'),
            mainMenu: document.getElementById('main-menu'),
            game: document.getElementById('game-screen'),
            settings: document.getElementById('settings-screen')
        };
        
        this.currentScreen = 'loading';
        this.eventLog = [];
        this.maxEventLogSize = 5;
    }
    
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show requested screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }
    }
    
    updateHUD(gameState) {
        if (!gameState || !gameState.player_stats) return;
        
        const stats = gameState.player_stats;
        
        // Update health
        document.getElementById('health-value').textContent = stats.health;
        const healthBar = document.querySelector('.health-fill');
        healthBar.style.width = `${(stats.health / 100) * 100}%`;
        
        // Update fuel
        document.getElementById('fuel-value').textContent = stats.fuel;
        const fuelBar = document.querySelector('.fuel-fill');
        fuelBar.style.width = `${(stats.fuel / 100) * 100}%`;
        
        // Update ship condition
        document.getElementById('ship-value').textContent = stats.ship_condition;
        const shipBar = document.querySelector('.ship-fill');
        shipBar.style.width = `${(stats.ship_condition / stats.max_ship_condition) * 100}%`;
        
        // Update resources
        document.getElementById('wealth-value').textContent = stats.wealth;
        document.getElementById('food-value').textContent = stats.food;
        
        // Update turn counter
        document.getElementById('turn-value').textContent = `${gameState.turn_count}/${gameState.max_turns}`;
        
        // Update quest indicator
        if (gameState.active_quest) {
            document.getElementById('quest-indicator').style.display = 'flex';
            document.getElementById('quest-name').textContent = gameState.active_quest.name;
            document.getElementById('quest-status').textContent = gameState.active_quest.status;
        } else {
            document.getElementById('quest-indicator').style.display = 'none';
        }
        
        // Update action buttons
        const repairBtn = document.getElementById('repair-btn');
        if (gameState.at_repair_location && stats.wealth >= 100) {
            repairBtn.disabled = false;
            repairBtn.classList.add('available');
        } else {
            repairBtn.disabled = true;
            repairBtn.classList.remove('available');
        }
        
        // Flash warnings for critical stats
        if (stats.health < 30) {
            healthBar.classList.add('critical');
        } else {
            healthBar.classList.remove('critical');
        }
        
        if (stats.fuel < 20) {
            fuelBar.classList.add('critical');
        } else {
            fuelBar.classList.remove('critical');
        }
        
        if (stats.ship_condition < 30) {
            shipBar.classList.add('critical');
        } else {
            shipBar.classList.remove('critical');
        }
    }
    
    addEventMessage(message, type = 'info') {
        const eventContent = document.getElementById('event-content');
        
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
        window.gameEngine.startNewGame();
    }
    
    loadGame() {
        // TODO: Implement save game loading
        this.showNotification('Loading saved game...', 'info');
        this.showScreen('game');
        window.gameEngine.loadGame();
    }
    
    showSettings() {
        this.showScreen('settings');
    }
    
    hideSettings() {
        this.showScreen('mainMenu');
        
        // Apply settings
        const masterVolume = document.getElementById('master-volume').value / 100;
        const sfxVolume = document.getElementById('sfx-volume').value / 100;
        const musicVolume = document.getElementById('music-volume').value / 100;
        
        if (window.audioManager) {
            window.audioManager.setMasterVolume(masterVolume);
            window.audioManager.setSFXVolume(sfxVolume);
            window.audioManager.setMusicVolume(musicVolume);
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
}

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

// Export for use in other modules
window.UIManager = UIManager;
