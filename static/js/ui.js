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

.action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    border-color: var(--text-secondary);
}

.action-btn:disabled:hover {
    transform: none;
    box-shadow: none;
}

/* Pod Augmentation Modal Styles */
.pod-mods-content {
    max-width: 600px;
    width: 90%;
}

.modal-subtitle {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
}

.augmentations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.augmentation-card {
    background: var(--glass-bg);
    border: 2px solid var(--glass-border);
    border-radius: 10px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;
}

.augmentation-card.owned {
    border-color: var(--success-color);
    background: rgba(51, 255, 51, 0.1);
}

.augmentation-card.disabled {
    opacity: 0.6;
}

.augmentation-card:hover:not(.disabled) {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3);
}

.aug-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
}

.aug-name {
    font-family: 'Orbitron', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

.aug-description {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
}

.aug-cost {
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--accent-color);
}

.aug-buy-btn {
    background: var(--glass-bg);
    border: 2px solid var(--primary-color);
    color: var(--text-primary);
    padding: 0.5rem 1.5rem;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Space Mono', monospace;
}

.aug-buy-btn:hover:not(:disabled) {
    background: var(--primary-color);
    color: var(--bg-dark);
    transform: scale(1.05);
}

.aug-buy-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
        
        // Update mine button visibility
        this.updateMineButton(gameState);
        
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
        
        // Make ship icon clickable for ship customization
        if (shipIcon) {
            const shipInfo = gameState.ship_types ? gameState.ship_types[stats.ship_type || 'scout'] : null;
            
            if (!stats.in_pod_mode) {
                shipIcon.style.cursor = 'pointer';
                shipIcon.onclick = () => this.showShipModal();
                shipIcon.title = 'Click to view ship details and modifications';
                
                // Update ship icon based on ship type
                if (shipInfo) {
                    shipIcon.innerHTML = shipInfo.icon || '🚀';
                }
            } else {
                shipIcon.style.cursor = 'default';
                shipIcon.onclick = null;
                shipIcon.title = '';
            }
        }
        
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
                podIndicator.style.cursor = 'pointer';
                
                // Update pod HP display with real values
                const podHpSpan = podIndicator.querySelector('.pod-hp');
                if (podHpSpan) {
                    podHpSpan.textContent = `(${stats.pod_hp}/${stats.pod_max_hp} HP)`;
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
                
                // Add click handler for pod info
                podIndicator.onclick = () => {
                    const augNames = stats.pod_augmentations ? stats.pod_augmentations.map(id => {
                        const augInfo = gameState.pod_augmentations_info || {};
                        return augInfo[id] ? augInfo[id].icon + ' ' + augInfo[id].name : id;
                    }).join(', ') : 'None';
                    
                    const message = augCount > 0 ? 
                        `Pod Status: ${stats.pod_hp}/${stats.pod_max_hp} HP\nAugmentations: ${augNames}` : 
                        `Pod Status: ${stats.pod_hp}/${stats.pod_max_hp} HP\nNo augmentations installed`;
                    
                    this.showNotification(message, 'info', 5000);
                };
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
            // Normal mode actions - ALWAYS hide buy ship button when not in pod mode
            this.hideBuyShipButton();
            
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
            
            // Show pod mods button if has pod and at location
            if (stats.has_flight_pod && gameState.at_repair_location && !stats.in_pod_mode) {
                this.showPodModsButton(stats.just_bought_pod);
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
        
        // Show modal with proper display
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
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
    
    // Save/Load System
    showSaveLoadModal(mode = 'save') {
        // Create modal if it doesn't exist
        let modal = document.getElementById('save-load-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'save-load-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content save-load-content">
                    <div class="modal-header">
                        <h3 id="save-load-title">💾 Save Game</h3>
                        <button class="modal-close" onclick="window.uiManager.hideSaveLoadModal()">×</button>
                    </div>
                    <div class="save-load-tabs">
                        <button class="tab-button active" onclick="window.uiManager.switchSaveLoadMode('save')">Save Game</button>
                        <button class="tab-button" onclick="window.uiManager.switchSaveLoadMode('load')">Load Game</button>
                    </div>
                    <div id="save-slots-container">
                        <!-- Slots will be populated here -->
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add styles
            if (!document.getElementById('save-load-styles')) {
                const style = document.createElement('style');
                style.id = 'save-load-styles';
                style.textContent = `
                    .save-load-content {
                        max-width: 700px;
                        width: 90%;
                        max-height: 85vh;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                    }
                    .save-load-tabs {
                        display: flex;
                        margin-bottom: 1.5rem;
                        border-bottom: 2px solid var(--glass-border);
                        flex-shrink: 0;
                    }
                    #save-slots-container {
                        overflow-y: auto;
                        overflow-x: hidden;
                        flex: 1;
                        min-height: 0;
                        padding-right: 10px;
                        /* Custom scrollbar */
                        scrollbar-width: thin;
                        scrollbar-color: var(--primary-color) var(--glass-bg);
                    }
                    #save-slots-container::-webkit-scrollbar {
                        width: 8px;
                    }
                    #save-slots-container::-webkit-scrollbar-track {
                        background: var(--glass-bg);
                        border-radius: 4px;
                    }
                    #save-slots-container::-webkit-scrollbar-thumb {
                        background: var(--primary-color);
                        border-radius: 4px;
                    }
                    #save-slots-container::-webkit-scrollbar-thumb:hover {
                        background: var(--accent-color);
                    }
                    .save-slots-grid {
                        display: grid;
                        gap: 1rem;
                        padding-bottom: 1rem;
                    }
                    .save-slot {
                        background: var(--glass-bg);
                        border: 2px solid var(--glass-border);
                        border-radius: 10px;
                        padding: 1.2rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        position: relative;
                        min-height: 120px;
                    }
                    .save-slot:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 5px 20px rgba(0, 255, 255, 0.3);
                        border-color: var(--primary-color);
                    }
                    .save-slot.empty {
                        opacity: 0.6;
                        border-style: dashed;
                    }
                    .save-slot.autosave {
                        border-color: var(--accent-color);
                    }
                    .save-slot-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 0.5rem;
                    }
                    .save-slot-number {
                        font-family: 'Orbitron', sans-serif;
                        font-weight: 700;
                        font-size: 1.2rem;
                        color: var(--primary-color);
                    }
                    .save-slot-badge {
                        background: var(--accent-color);
                        color: var(--bg-dark);
                        padding: 0.25rem 0.5rem;
                        border-radius: 4px;
                        font-size: 0.75rem;
                        font-weight: 700;
                    }
                    .save-slot-details {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 0.4rem;
                        margin-bottom: 0.4rem;
                        font-size: 0.85rem;
                    }
                    .save-detail {
                        font-size: 0.9rem;
                    }
                    .save-detail-label {
                        color: var(--text-secondary);
                    }
                    .save-slot-location {
                        color: var(--text-secondary);
                        font-size: 0.9rem;
                        margin-bottom: 0.5rem;
                    }
                    .save-slot-timestamp {
                        color: var(--text-secondary);
                        font-size: 0.8rem;
                        font-style: italic;
                    }
                    .save-slot-actions {
                        position: absolute;
                        top: 1rem;
                        right: 1rem;
                        display: flex;
                        gap: 0.5rem;
                    }
                    .save-action-btn {
                        background: var(--glass-bg);
                        border: 1px solid var(--glass-border);
                        color: var(--text-primary);
                        padding: 0.25rem 0.5rem;
                        border-radius: 4px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-size: 0.8rem;
                    }
                    .save-action-btn:hover {
                        background: var(--primary-color);
                        color: var(--bg-dark);
                    }
                    .save-action-btn.delete:hover {
                        background: var(--danger-color);
                    }
                    
                    /* Fix modal display */
                    .modal {
                        display: flex !important;
                        justify-content: center;
                        align-items: center;
                    }
                    
                    /* Responsive design for smaller screens */
                    @media (max-height: 600px) {
                        .save-load-content {
                            max-height: 90vh;
                        }
                        .save-slot {
                            padding: 0.8rem;
                            min-height: 100px;
                        }
                        .save-slot-details {
                            font-size: 0.8rem;
                        }
                        .save-load-tabs {
                            margin-bottom: 1rem;
                        }
                    }
                    
                    @media (max-width: 600px) {
                        .save-load-content {
                            width: 95%;
                            max-width: none;
                        }
                        .save-slot-details {
                            grid-template-columns: 1fr;
                        }
                        .save-slot-actions {
                            position: static;
                            margin-top: 0.5rem;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        // Update modal based on mode
        this.currentSaveLoadMode = mode;
        this.switchSaveLoadMode(mode);
        
        // Load save slots
        this.refreshSaveSlots();
        
        // Show modal
        modal.style.display = 'flex';
    }
    
    hideSaveLoadModal() {
        const modal = document.getElementById('save-load-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    switchSaveLoadMode(mode) {
        this.currentSaveLoadMode = mode;
        
        // Update title
        const title = document.getElementById('save-load-title');
        if (title) {
            title.textContent = mode === 'save' ? '💾 Save Game' : '📂 Load Game';
        }
        
        // Update tabs
        document.querySelectorAll('.save-load-tabs .tab-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(mode)) {
                btn.classList.add('active');
            }
        });
        
        // Refresh slots
        this.refreshSaveSlots();
    }
    
    async refreshSaveSlots() {
        const container = document.getElementById('save-slots-container');
        if (!container) return;
        
        container.innerHTML = '<div style="text-align: center; color: var(--text-secondary);">Loading save slots...</div>';
        
        try {
            // Fetch save data
            const response = await fetch('/api/saves');
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to load saves');
            }
            
            // Create slots grid
            container.innerHTML = '<div class="save-slots-grid" id="save-slots-grid"></div>';
            const grid = document.getElementById('save-slots-grid');
            
            // Render each slot
            for (let slot = 0; slot < data.max_slots; slot++) {
                const saveData = data.saves.find(s => s.slot === slot);
                const slotElement = this.createSaveSlotElement(slot, saveData);
                grid.appendChild(slotElement);
            }
        } catch (error) {
            container.innerHTML = `<div style="text-align: center; color: var(--danger-color);">Error loading saves: ${error.message}</div>`;
        }
    }
    
    createSaveSlotElement(slot, saveData) {
        const div = document.createElement('div');
        div.className = 'save-slot';
        
        if (saveData) {
            div.classList.add('filled');
            if (saveData.is_autosave) {
                div.classList.add('autosave');
            }
            
            const metadata = saveData.metadata;
            const timestamp = new Date(metadata.timestamp).toLocaleString();
            
            div.innerHTML = `
                <div class="save-slot-header">
                    <div class="save-slot-number">Slot ${slot}</div>
                    ${saveData.is_autosave ? '<div class="save-slot-badge">AUTO-SAVE</div>' : ''}
                </div>
                <div class="save-slot-location">📍 ${metadata.location}</div>
                <div class="save-slot-details">
                    <div class="save-detail"><span class="save-detail-label">Turn:</span> ${metadata.turn_count}</div>
                    <div class="save-detail"><span class="save-detail-label">Wealth:</span> ${metadata.wealth}</div>
                    <div class="save-detail"><span class="save-detail-label">Health:</span> ${metadata.health}/100</div>
                    <div class="save-detail"><span class="save-detail-label">Version:</span> ${metadata.game_version}</div>
                </div>
                <div class="save-slot-timestamp">${timestamp}</div>
                ${!saveData.is_autosave && this.currentSaveLoadMode === 'save' ? 
                    '<div class="save-slot-actions"><button class="save-action-btn delete" onclick="window.uiManager.deleteSave(' + slot + ')">Delete</button></div>' : ''}
            `;
            
            if (this.currentSaveLoadMode === 'save') {
                div.onclick = () => this.saveToSlot(slot);
            } else {
                div.onclick = () => this.loadFromSlot(slot);
            }
        } else {
            div.classList.add('empty');
            div.innerHTML = `
                <div class="save-slot-header">
                    <div class="save-slot-number">Slot ${slot}</div>
                </div>
                <div style="text-align: center; color: var(--text-secondary); padding: 1.5rem 0;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📁</div>
                    <div>Empty Slot</div>
                </div>
            `;
            
            if (this.currentSaveLoadMode === 'save') {
                div.onclick = () => this.saveToSlot(slot);
            }
        }
        
        return div;
    }
    
    async saveToSlot(slot) {
        const sessionId = window.gameEngine?.sessionId || 'default';
        
        // Show confirmation if slot has existing save
        const response = await fetch(`/api/saves/${slot}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && !data.is_autosave) {
                this.showChoiceModal(
                    'Overwrite Save?',
                    ['Yes, overwrite this save', 'No, cancel'],
                    async (choice) => {
                        if (choice === 1) {
                            await this.performSave(slot, sessionId);
                        }
                    }
                );
                return;
            }
        }
        
        await this.performSave(slot, sessionId);
    }
    
    async performSave(slot, sessionId) {
        try {
            const response = await fetch(`/api/saves/${slot}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification(`Game saved to slot ${slot}!`, 'success');
                this.refreshSaveSlots();
            } else {
                throw new Error(data.error || 'Failed to save game');
            }
        } catch (error) {
            this.showNotification(`Failed to save: ${error.message}`, 'danger');
        }
    }
    
    async loadFromSlot(slot) {
        const sessionId = window.gameEngine?.sessionId || 'default';
        
        this.showChoiceModal(
            'Load Game?',
            ['Yes, load this save', 'No, cancel'],
            async (choice) => {
                if (choice === 1) {
                    try {
                        const response = await fetch(`/api/load/${slot}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ session_id: sessionId })
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            this.showNotification(`Game loaded from slot ${slot}!`, 'success');
                            this.hideSaveLoadModal();
                            
                            // Update game state
                            if (window.gameEngine) {
                                window.gameEngine.gameState = data.game_state;
                                window.gameEngine.updateUI();
                            }
                        } else {
                            throw new Error(data.error || 'Failed to load game');
                        }
                    } catch (error) {
                        this.showNotification(`Failed to load: ${error.message}`, 'danger');
                    }
                }
            }
        );
    }
    
    async deleteSave(slot) {
        this.showChoiceModal(
            'Delete Save?',
            ['Yes, delete this save', 'No, cancel'],
            async (choice) => {
                if (choice === 1) {
                    try {
                        const response = await fetch(`/api/saves/${slot}`, {
                            method: 'DELETE'
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            this.showNotification(`Save in slot ${slot} deleted!`, 'success');
                            this.refreshSaveSlots();
                        } else {
                            throw new Error(data.error || 'Failed to delete save');
                        }
                    } catch (error) {
                        this.showNotification(`Failed to delete: ${error.message}`, 'danger');
                    }
                }
            }
        );
    }
    
    // Add keyboard shortcuts for save/load
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // F5 - Quick Save
            if (e.key === 'F5') {
                e.preventDefault();
                this.showSaveLoadModal('save');
            }
            // F9 - Quick Load
            else if (e.key === 'F9') {
                e.preventDefault();
                this.showSaveLoadModal('load');
            }
        });
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
        
        // Only show buy ship button if ALL conditions are met:
        // 1. In pod mode (ship destroyed)
        // 2. At repair location
        // 3. Have enough wealth (400)
        if (stats.in_pod_mode && gameState.at_repair_location && stats.wealth >= 400) {
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
    
    showPodModsButton(justBoughtPod = false) {
        let podModsBtn = document.getElementById('pod-mods-btn');
        if (!podModsBtn) {
            // Create button if it doesn't exist
            podModsBtn = document.createElement('button');
            podModsBtn.id = 'pod-mods-btn';
            podModsBtn.className = 'action-btn';
            podModsBtn.innerHTML = '<span class="btn-icon">✨</span><span>Pod Mods</span>';
            // Add inline styles to ensure visibility
            podModsBtn.style.cssText = 'background: linear-gradient(135deg, #FFD700, #FFA500); color: #0a0a0f; font-weight: bold;';
            
            const actionPanel = document.getElementById('action-panel');
            if (actionPanel) {
                // Insert before the last button (Star Map) to keep it more visible
                const starMapBtn = actionPanel.querySelector('button:last-child');
                if (starMapBtn) {
                    actionPanel.insertBefore(podModsBtn, starMapBtn);
                } else {
                    actionPanel.appendChild(podModsBtn);
                }
                console.log('Pod Mods button added to action panel');
            }
        }
        
        // Update button state based on justBoughtPod
        if (justBoughtPod) {
            podModsBtn.disabled = true;
            podModsBtn.classList.remove('available');
            podModsBtn.title = 'Navigate at least once before installing augmentations';
            // Update button text to be more helpful
            podModsBtn.innerHTML = '<span class="btn-icon">✨</span><span>Pod Mods (Navigate First)</span>';
            podModsBtn.onclick = () => {
                this.showNotification('You must navigate at least once after buying a pod before installing augmentations!', 'info', 4000);
            };
        } else {
            podModsBtn.disabled = false;
            podModsBtn.classList.add('available');
            podModsBtn.title = 'Install pod augmentations';
            podModsBtn.innerHTML = '<span class="btn-icon">✨</span><span>Pod Mods</span>';
            podModsBtn.onclick = () => {
                this.showPodModsModal();
            };
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
    
    showFoodModal() {
        if (!window.gameEngine || !window.gameEngine.gameState) return;
        
        const gameState = window.gameEngine.gameState;
        const playerStats = gameState.player_stats;
        
        // Create modal if it doesn't exist
        let modal = document.getElementById('food-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'food-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>🍞 Food Supply Management</h3>
                    <div id="food-modal-content">
                        <!-- Content will be dynamically generated -->
                    </div>
                    <button class="menu-btn" onclick="window.uiManager.hideFoodModal()">Close</button>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Populate content
        const modalContent = document.getElementById('food-modal-content');
        modalContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-around; margin-bottom: 1rem;">
                    <div class="stat-display">
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Current Health</div>
                        <div style="font-size: 2rem; font-weight: bold; color: ${playerStats.health < 30 ? 'var(--danger-color)' : playerStats.health < 60 ? 'var(--accent-color)' : 'var(--success-color)'}">
                            ❤️ ${playerStats.health}/100
                        </div>
                    </div>
                    <div class="stat-display">
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Food Supply</div>
                        <div style="font-size: 2rem; font-weight: bold; color: ${playerStats.food < 10 ? 'var(--danger-color)' : 'var(--primary-color)'}">
                            🍞 ${playerStats.food}
                        </div>
                    </div>
                </div>
                
                <div style="padding: 1rem; background: var(--glass-bg); border-radius: 8px; margin-bottom: 1.5rem;">
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">Consume food to restore health. Each unit of food restores 2 health points.</p>
                </div>
                
                <div class="food-consumption-options" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    ${this.createFoodOption(1, 2, playerStats)}
                    ${this.createFoodOption(5, 10, playerStats)}
                    ${this.createFoodOption(10, 20, playerStats)}
                    ${this.createFoodOption(25, 50, playerStats)}
                </div>
                
                ${playerStats.health >= 100 ? '<p style="margin-top: 1rem; color: var(--success-color); text-align: center;">Your health is already at maximum!</p>' : ''}
                ${playerStats.food === 0 ? '<p style="margin-top: 1rem; color: var(--danger-color); text-align: center;">You have no food supplies left!</p>' : ''}
            </div>
        `;
        
        modal.style.display = 'flex';
        
        // Add hover effect to food resource when modal is open
        const foodResource = document.getElementById('food-resource');
        if (foodResource) {
            foodResource.style.transform = 'scale(1.1)';
            foodResource.style.boxShadow = '0 0 10px rgba(255, 200, 0, 0.5)';
        }
    }
    
    createFoodOption(foodCost, healthGain, playerStats) {
        const canAfford = playerStats.food >= foodCost;
        const needsHealth = playerStats.health < 100;
        const wouldOverheal = playerStats.health + healthGain > 100;
        const actualHealthGain = wouldOverheal ? 100 - playerStats.health : healthGain;
        const isDisabled = !canAfford || !needsHealth;
        
        return `
            <div class="food-option ${isDisabled ? 'disabled' : 'available'}" style="
                background: var(--glass-bg);
                border: 2px solid ${isDisabled ? 'var(--glass-border)' : 'var(--primary-color)'};
                border-radius: 8px;
                padding: 1rem;
                text-align: center;
                cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
                transition: all 0.3s ease;
                opacity: ${isDisabled ? '0.5' : '1'};
            " ${!isDisabled ? `onclick="window.uiManager.consumeFood(${foodCost})"` : ''}>
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🍞 ${foodCost}</div>
                <div style="font-size: 0.9rem; color: var(--text-secondary);">Consume</div>
                <div style="font-size: 0.8rem; margin-top: 0.5rem; color: ${isDisabled ? 'var(--text-secondary)' : 'var(--success-color)'}">
                    +${actualHealthGain} ❤️
                </div>
            </div>
        `;
    }
    
    hideFoodModal() {
        const modal = document.getElementById('food-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Remove hover effect from food resource
        const foodResource = document.getElementById('food-resource');
        if (foodResource) {
            foodResource.style.transform = 'scale(1)';
            foodResource.style.boxShadow = 'none';
        }
    }
    
    consumeFood(amount) {
        if (window.gameEngine) {
            window.gameEngine.consumeFood(amount);
            // Close modal after consumption
            setTimeout(() => this.hideFoodModal(), 500);
        }
    }
    
    showShipModal() {
        if (!window.gameEngine || !window.gameEngine.gameState) return;
        
        const gameState = window.gameEngine.gameState;
        const playerStats = gameState.player_stats;
        const shipTypes = gameState.ship_types || {};
        const shipMods = gameState.ship_mods || {};
        
        // Create modal if it doesn't exist
        let modal = document.getElementById('ship-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'ship-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content ship-modal-content" style="max-width: 900px; width: 95%;">
                    <div class="modal-header">
                        <h3>🚀 Ship Management</h3>
                        <button class="modal-close" onclick="window.uiManager.hideShipModal()">×</button>
                    </div>
                    <div class="ship-modal-tabs">
                        <button class="tab-button active" onclick="window.uiManager.showShipTab('overview')">Overview</button>
                        <button class="tab-button" onclick="window.uiManager.showShipTab('modifications')">Modifications</button>
                        <button class="tab-button" onclick="window.uiManager.showShipTab('inventory')">Cargo Hold</button>
                    </div>
                    <div id="ship-modal-content" class="ship-modal-body">
                        <!-- Content will be dynamically generated -->
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Add custom styles
        if (!document.getElementById('ship-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'ship-modal-styles';
            style.textContent = `
                .ship-modal-content {
                    padding: 0;
                    overflow: hidden;
                }
                .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 2px solid var(--glass-border);
                    flex-shrink: 0;
                    }
                .modal-close {
                    background: none;
                    border: none;
                    color: var(--text-primary);
                    font-size: 2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                .modal-close:hover {
                    color: var(--danger-color);
                    transform: rotate(90deg);
                }
                .ship-modal-tabs {
                    display: flex;
                    background: rgba(0, 0, 0, 0.3);
                    border-bottom: 2px solid var(--glass-border);
                }
                .tab-button {
                    flex: 1;
                    padding: 1rem;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                }
                .tab-button:hover {
                    color: var(--text-primary);
                    background: rgba(0, 255, 255, 0.1);
                }
                .tab-button.active {
                    color: var(--primary-color);
                    background: rgba(0, 255, 255, 0.2);
                }
                .tab-button.active::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: var(--primary-color);
                }
                .ship-modal-body {
                    padding: 2rem;
                    min-height: 400px;
                    max-height: 60vh;
                    overflow-y: auto;
                }
                .ship-overview {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 2rem;
                }
                .ship-visual {
                    text-align: center;
                }
                .ship-icon-large {
                    font-size: 6rem;
                    margin-bottom: 1rem;
                }
                .ship-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                }
                .stat-box {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 8px;
                    padding: 1rem;
                }
                .stat-label {
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                    margin-bottom: 0.5rem;
                }
                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--primary-color);
                }
                .slot-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                    margin-top: 2rem;
                }
                .slot-section {
                    background: var(--glass-bg);
                    border: 2px solid var(--glass-border);
                    border-radius: 10px;
                    padding: 1rem;
                }
                .slot-section.high { border-color: #ff6b6b; }
                .slot-section.mid { border-color: #ffd93d; }
                .slot-section.low { border-color: #6bcf7f; }
                .slot-section.rig { border-color: #4ecdc4; }
                .slot-header {
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    text-align: center;
                }
                .slot-item {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 5px;
                    padding: 0.5rem;
                    margin-bottom: 0.5rem;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .slot-item:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateY(-2px);
                }
                .slot-empty {
                    opacity: 0.5;
                    font-style: italic;
                    cursor: default;
                }
                .inventory-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 1rem;
                }
                .inventory-item {
                    background: var(--glass-bg);
                    border: 2px solid var(--glass-border);
                    border-radius: 8px;
                    padding: 1rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .inventory-item:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3);
                }
                .item-icon {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }
                .item-name {
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                .item-quantity {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }
                .cargo-bar {
                    margin: 1rem 0;
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 20px;
                    padding: 0.5rem;
                }
                .cargo-fill {
                    height: 20px;
                    background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
                    border-radius: 15px;
                    transition: width 0.3s ease;
                }
                .cargo-text {
                    text-align: center;
                    margin-top: 0.5rem;
                    font-weight: 600;
                }
                .available-mods {
                    margin-top: 2rem;
                }
                .mod-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1rem;
                    margin-top: 1rem;
                }
                .mod-card {
                    background: var(--glass-bg);
                    border: 2px solid var(--glass-border);
                    border-radius: 10px;
                    padding: 1rem;
                    transition: all 0.3s ease;
                }
                .mod-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 5px 20px rgba(0, 255, 255, 0.2);
                }
                .mod-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .mod-name {
                    font-weight: 700;
                    color: var(--primary-color);
                }
                .mod-cost {
                    color: var(--accent-color);
                    font-weight: 600;
                }
                .mod-description {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                }
                .mod-slot-type {
                    display: inline-block;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                }
                .mod-slot-type.high { background: rgba(255, 107, 107, 0.2); color: #ff6b6b; }
                .mod-slot-type.mid { background: rgba(255, 217, 61, 0.2); color: #ffd93d; }
                .mod-slot-type.low { background: rgba(107, 207, 127, 0.2); color: #6bcf7f; }
                .mod-slot-type.rig { background: rgba(78, 205, 196, 0.2); color: #4ecdc4; }
            `;
            document.head.appendChild(style);
        }
        
        // Show overview tab by default
        this.showShipTab('overview');
        
        modal.style.display = 'flex';
        modal.style.animation = 'fade-in 0.3s ease-out';
    }
    
    hideShipModal() {
        const modal = document.getElementById('ship-modal');
        if (modal) {
            modal.style.animation = 'fade-out 0.3s ease-out';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    showShipTab(tabName) {
        const gameState = window.gameEngine.gameState;
        const playerStats = gameState.player_stats;
        const contentDiv = document.getElementById('ship-modal-content');
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(tabName)) {
                btn.classList.add('active');
            }
        });
        
        if (tabName === 'overview') {
            this.renderShipOverview(contentDiv, gameState);
        } else if (tabName === 'modifications') {
            this.renderShipModifications(contentDiv, gameState);
        } else if (tabName === 'inventory') {
            this.renderShipInventory(contentDiv, gameState);
        }
    }
    
    renderShipOverview(contentDiv, gameState) {
        const playerStats = gameState.player_stats;
        const shipTypes = gameState.ship_types || {};
        const currentShip = shipTypes[playerStats.ship_type] || shipTypes['scout'];
        
        contentDiv.innerHTML = `
            <div class="ship-overview">
                <div class="ship-visual">
                    <div class="ship-icon-large">${currentShip.icon}</div>
                    <h4>${currentShip.name}</h4>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">${currentShip.description}</p>
                    
                    ${gameState.at_repair_location ? `
                        <div style="margin-top: 2rem;">
                            <h5>Available Ships</h5>
                            <div style="display: grid; gap: 0.5rem; margin-top: 1rem;">
                                ${Object.entries(shipTypes).map(([type, ship]) => `
                                    <button class="menu-btn" 
                                        ${playerStats.wealth < ship.cost || type === playerStats.ship_type ? 'disabled' : ''}
                                        onclick="window.uiManager.buyShip('${type}')">
                                        ${ship.icon} ${ship.name} (${ship.cost} credits)
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div>
                    <h5>Ship Statistics</h5>
                    <div class="ship-stats-grid">
                        <div class="stat-box">
                            <div class="stat-label">Hull Strength</div>
                            <div class="stat-value">${playerStats.ship_condition}/${playerStats.max_ship_condition}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Cargo Capacity</div>
                            <div class="stat-value">${playerStats.used_cargo_space}/${playerStats.cargo_capacity}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Fuel Efficiency</div>
                            <div class="stat-value">${Math.round((currentShip.fuel_efficiency || 1) * 100)}%</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Speed Rating</div>
                            <div class="stat-value">${Math.round((currentShip.speed || 1) * 100)}%</div>
                        </div>
                    </div>
                    
                    <h5 style="margin-top: 2rem;">Module Slots</h5>
                    <div class="slot-grid">
                        ${this.renderSlotSection('high', playerStats, currentShip)}
                        ${this.renderSlotSection('mid', playerStats, currentShip)}
                        ${this.renderSlotSection('low', playerStats, currentShip)}
                        ${this.renderSlotSection('rig', playerStats, currentShip)}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderSlotSection(slotType, playerStats, shipInfo) {
        const slotNames = {
            'high': 'High Slots',
            'mid': 'Mid Slots',
            'low': 'Low Slots',
            'rig': 'Rig Slots'
        };
        
        const installedMods = playerStats.ship_mods[slotType] || [];
        const maxSlots = shipInfo.slots[slotType];
        const shipMods = window.gameEngine.gameState.ship_mods || {};
        
        return `
            <div class="slot-section ${slotType}">
                <div class="slot-header">${slotNames[slotType]} (${installedMods.length}/${maxSlots})</div>
                ${installedMods.map(modId => {
                    const mod = shipMods[modId];
                    return mod ? `<div class="slot-item" title="${mod.description}">${mod.icon} ${mod.name}</div>` : '';
                }).join('')}
                ${Array(maxSlots - installedMods.length).fill(0).map(() => 
                    `<div class="slot-item slot-empty">Empty Slot</div>`
                ).join('')}
            </div>
        `;
    }
    
    renderShipModifications(contentDiv, gameState) {
        const playerStats = gameState.player_stats;
        const shipMods = gameState.ship_mods || {};
        const currentShip = gameState.ship_types[playerStats.ship_type];
        
        contentDiv.innerHTML = `
            <div>
                <h4>Installed Modifications</h4>
                <div class="slot-grid">
                    ${this.renderSlotSection('high', playerStats, currentShip)}
                    ${this.renderSlotSection('mid', playerStats, currentShip)}
                    ${this.renderSlotSection('low', playerStats, currentShip)}
                    ${this.renderSlotSection('rig', playerStats, currentShip)}
                </div>
                
                ${gameState.at_repair_location ? `
                    <div class="available-mods">
                        <h4>Available Modifications</h4>
                        <div class="mod-grid">
                            ${Object.entries(shipMods).map(([modId, mod]) => {
                                const canAfford = playerStats.wealth >= mod.cost;
                                const hasSlot = (playerStats.ship_mods[mod.slot] || []).length < currentShip.slots[mod.slot];
                                const alreadyInstalled = (playerStats.ship_mods[mod.slot] || []).includes(modId);
                                
                                return `
                                    <div class="mod-card ${!canAfford || !hasSlot || alreadyInstalled ? 'disabled' : ''}">
                                        <div class="mod-slot-type ${mod.slot}">${mod.slot} slot</div>
                                        <div class="mod-header">
                                            <span class="mod-name">${mod.icon} ${mod.name}</span>
                                            <span class="mod-cost">${mod.cost} cr</span>
                                        </div>
                                        <div class="mod-description">${mod.description}</div>
                                        <button class="menu-btn" style="width: 100%; margin-top: 0.5rem;"
                                            ${!canAfford || !hasSlot || alreadyInstalled ? 'disabled' : ''}
                                            onclick="window.uiManager.buyMod('${modId}')">
                                            ${alreadyInstalled ? 'Installed' : !hasSlot ? 'No Slots' : !canAfford ? 'Too Expensive' : 'Install'}
                                        </button>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : '<p style="text-align: center; color: var(--text-secondary); margin-top: 2rem;">Dock at a station to install modifications</p>'}
            </div>
        `;
    }
    
    renderShipInventory(contentDiv, gameState) {
        const playerStats = gameState.player_stats;
        const itemTypes = gameState.item_types || {};
        const inventory = playerStats.inventory || [];
        
        const cargoPercent = (playerStats.used_cargo_space / playerStats.cargo_capacity) * 100;
        
        contentDiv.innerHTML = `
            <div>
                <h4>Cargo Hold</h4>
                <div class="cargo-bar">
                    <div class="cargo-fill" style="width: ${cargoPercent}%"></div>
                </div>
                <div class="cargo-text">
                    ${playerStats.used_cargo_space} / ${playerStats.cargo_capacity} units
                    ${cargoPercent > 90 ? '<span style="color: var(--danger-color);"> (Nearly Full!)</span>' : ''}
                </div>
                
                <div class="inventory-grid" style="margin-top: 2rem;">
                    ${inventory.length > 0 ? inventory.map(item => {
                        const itemInfo = itemTypes[item.item_id];
                        if (!itemInfo) return '';
                        
                        return `
                            <div class="inventory-item" onclick="window.uiManager.showItemOptions('${item.item_id}')">
                                <div class="item-icon">${itemInfo.icon}</div>
                                <div class="item-name">${itemInfo.name}</div>
                                <div class="item-quantity">x${item.quantity}</div>
                                <div class="item-weight" style="font-size: 0.7rem; color: var(--text-secondary);">${itemInfo.weight * item.quantity}kg</div>
                            </div>
                        `;
                    }).join('') : '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">Cargo hold is empty</p>'}
                </div>
            </div>
        `;
    }
    
    buyShip(shipType) {
        if (window.gameEngine) {
            window.gameEngine.sendAction('buy_ship', { ship_type: shipType });
            setTimeout(() => this.showShipModal(), 500);
        }
    }
    
    buyMod(modId) {
        if (window.gameEngine) {
            window.gameEngine.sendAction('buy_mod', { mod_id: modId });
            setTimeout(() => this.showShipTab('modifications'), 500);
        }
    }
    
    // Audio Visualizer
    initAudioVisualizer() {
        this.visualizerCanvas = document.getElementById('visualizer-canvas');
        this.visualizerCtx = this.visualizerCanvas ? this.visualizerCanvas.getContext('2d') : null;
        this.trackNameEl = document.getElementById('track-name');
        this.musicToggleBtn = document.getElementById('music-toggle');
        
        // Start visualization loop
        if (this.visualizerCtx) {
            this.renderAudioVisualization();
        }
    }
    
    renderAudioVisualization() {
        if (!this.visualizerCtx || !window.audioManager) {
            requestAnimationFrame(() => this.renderAudioVisualization());
            return;
        }
        
        const data = window.audioManager.getVisualizationData();
        const ctx = this.visualizerCtx;
        const width = this.visualizerCanvas.width;
        const height = this.visualizerCanvas.height;
        
        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, width, height);
        
        if (data) {
            // Draw frequency bars
            const barWidth = width / data.length * 2;
            const barSpacing = 2;
            
            for (let i = 0; i < data.length; i += 2) {
                const barHeight = (data[i] / 255) * height * 0.8;
                const x = (i / 2) * (barWidth + barSpacing);
                const y = height - barHeight;
                
                // Create gradient
                const gradient = ctx.createLinearGradient(0, y, 0, height);
                gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
                gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 255, 0, 0.8)');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, barWidth, barHeight);
            }
        }
        
        // Update music state
        if (this.musicToggleBtn && window.audioManager.musicEngine) {
            if (window.audioManager.musicEngine.isPlaying) {
                this.musicToggleBtn.classList.add('playing');
                this.musicToggleBtn.innerHTML = '♫';
            } else {
                this.musicToggleBtn.classList.remove('playing');
                this.musicToggleBtn.innerHTML = '♪';
            }
        }
        
        // Update track name
        if (this.trackNameEl && window.audioManager.musicEngine) {
            const tracks = window.audioManager.musicEngine.tracks;
            const currentTrack = window.audioManager.musicEngine.currentTrack;
            if (tracks[currentTrack]) {
                this.trackNameEl.textContent = tracks[currentTrack].name;
            }
        }
        
        requestAnimationFrame(() => this.renderAudioVisualization());
    }
    
    updateMineButton(gameState) {
        let mineBtn = document.getElementById('mine-btn');
        const location = gameState.current_location;
        const hasMiningLaser = Object.values(gameState.player_stats.ship_mods).some(mods => mods.includes('mining_laser'));
        const isAsteroidField = location && location.node && location.node.type === 'asteroid_field';
        
        if (isAsteroidField && !gameState.player_stats.in_pod_mode) {
            if (!mineBtn) {
                // Create mine button if it doesn't exist
                mineBtn = document.createElement('button');
                mineBtn.id = 'mine-btn';
                mineBtn.className = 'action-btn';
                mineBtn.innerHTML = '<span class="btn-icon">⛏️</span><span>Mine</span>';
                
                // Insert after scan button
                const scanBtn = document.querySelector('button[onclick*="scanArea"]');
                if (scanBtn && scanBtn.parentNode) {
                    scanBtn.parentNode.insertBefore(mineBtn, scanBtn.nextSibling);
                }
            }
            
            mineBtn.style.display = 'flex';
            
            if (hasMiningLaser) {
                mineBtn.disabled = false;
                mineBtn.classList.add('available');
                mineBtn.onclick = () => {
                    if (window.gameEngine) window.gameEngine.mine();
                };
            } else {
                mineBtn.disabled = true;
                mineBtn.classList.remove('available');
                mineBtn.title = 'Requires Mining Laser';
                mineBtn.onclick = () => {
                    this.showNotification('You need a Mining Laser to mine asteroids!', 'warning');
                };
            }
        } else if (mineBtn) {
            mineBtn.style.display = 'none';
        }
    }
    
    showItemOptions(itemId) {
        const gameState = window.gameEngine.gameState;
        const item = gameState.player_stats.inventory.find(i => i.item_id === itemId);
        const itemInfo = gameState.item_types[itemId];
        
        if (!item || !itemInfo) return;
        
        let options = [];
        
        if (itemInfo.category === 'consumable') {
            options.push(`Use ${itemInfo.name}`);
        }
        
        if (gameState.at_repair_location && itemInfo.category === 'trade') {
            options.push(`Sell 1 for ~${itemInfo.base_value} credits`);
            if (item.quantity > 1) {
                options.push(`Sell all ${item.quantity} for ~${itemInfo.base_value * item.quantity} credits`);
            }
        }
        
        options.push('Cancel');
        
        this.showChoiceModal(
            `${itemInfo.icon} ${itemInfo.name} (x${item.quantity})\n${itemInfo.description}`,
            options,
            (choice) => {
                if (options[choice - 1].includes('Use')) {
                    window.gameEngine.sendAction('use_item', { item_id: itemId });
                } else if (options[choice - 1].includes('Sell 1')) {
                    window.gameEngine.sendAction('sell_item', { item_id: itemId, quantity: 1 });
                } else if (options[choice - 1].includes('Sell all')) {
                    window.gameEngine.sendAction('sell_item', { item_id: itemId, quantity: item.quantity });
                }
                // Refresh inventory view
                setTimeout(() => this.showShipTab('inventory'), 500);
            }
        );
    }
    
    showStarMap(starMap, navigationData) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('star-map-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'star-map-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content star-map-content" style="max-width: 95%; width: 1200px; height: 90vh;">
                    <div class="modal-header">
                        <h3>🗺️ Star Map</h3>
                        <button class="modal-close" onclick="window.uiManager.hideStarMap()">×</button>
                    </div>
                    <div class="star-map-body">
                        <canvas id="star-map-canvas"></canvas>
                        <div id="star-map-sidebar">
                            <h4>Navigation Options</h4>
                            <div id="navigation-options-list"></div>
                            <div class="current-location-info">
                                <h5>Current Location</h5>
                                <div id="current-location-details"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add styles
            if (!document.getElementById('star-map-styles')) {
                const style = document.createElement('style');
                style.id = 'star-map-styles';
                style.textContent = `
                    .star-map-content {
                        padding: 0;
                        display: flex;
                        flex-direction: column;
                    }
                    .star-map-body {
                        display: flex;
                        flex: 1;
                        overflow: hidden;
                    }
                    #star-map-canvas {
                        flex: 1;
                        background: #000033;
                        cursor: grab;
                    }
                    #star-map-canvas:active {
                        cursor: grabbing;
                    }
                    #star-map-sidebar {
                        width: 300px;
                        background: var(--glass-bg);
                        border-left: 2px solid var(--glass-border);
                        padding: 1.5rem;
                        overflow-y: auto;
                    }
                    #navigation-options-list {
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                        margin: 1rem 0;
                    }
                    .nav-option {
                        background: rgba(0, 255, 255, 0.1);
                        border: 1px solid var(--primary-color);
                        border-radius: 8px;
                        padding: 1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }
                    .nav-option:hover {
                        background: rgba(0, 255, 255, 0.2);
                        transform: translateX(5px);
                    }
                    .nav-option.region {
                        border-color: var(--accent-color);
                        background: rgba(255, 255, 0, 0.1);
                    }
                    .nav-option.region:hover {
                        background: rgba(255, 255, 0, 0.2);
                    }
                    .nav-option-header {
                        font-weight: 700;
                        margin-bottom: 0.25rem;
                    }
                    .nav-option-details {
                        font-size: 0.8rem;
                        color: var(--text-secondary);
                    }
                    .current-location-info {
                        margin-top: 2rem;
                        padding-top: 1rem;
                        border-top: 1px solid var(--glass-border);
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        // Render star map
        modal.style.display = 'flex';
        
        // Setup canvas
        const canvas = document.getElementById('star-map-canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize canvas
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Camera state
        let camera = { x: 0, y: 0, zoom: 1 };
        let isDragging = false;
        let dragStart = { x: 0, y: 0 };
        
        // Mouse events
        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragStart.x = e.clientX - camera.x;
            dragStart.y = e.clientY - camera.y;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                camera.x = e.clientX - dragStart.x;
                camera.y = e.clientY - dragStart.y;
                renderMap();
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const scale = e.deltaY > 0 ? 0.9 : 1.1;
            camera.zoom *= scale;
            camera.zoom = Math.max(0.5, Math.min(2, camera.zoom));
            renderMap();
        });
        
        // Render navigation options
        const optionsList = document.getElementById('navigation-options-list');
        const currentLocationDiv = document.getElementById('current-location-details');
        
        if (navigationData.current_location) {
            currentLocationDiv.innerHTML = `
                <div><strong>Region:</strong> ${navigationData.current_location.region}</div>
                <div><strong>Node:</strong> ${navigationData.current_location.node}</div>
                <div><strong>Type:</strong> ${navigationData.current_location.type.replace('_', ' ')}</div>
            `;
        }
        
        optionsList.innerHTML = navigationData.options.map(option => {
            if (option.type === 'node') {
                return `
                    <div class="nav-option" onclick="window.gameEngine.navigateToNode('${option.id}')">
                        <div class="nav-option-header">📍 ${option.name}</div>
                        <div class="nav-option-details">
                            Type: ${option.node_type.replace('_', ' ')}<br>
                            ${option.visited ? '✓ Visited' : '◇ Unvisited'}<br>
                            ${option.has_repair ? '🔧 Repairs' : ''} ${option.has_trade ? '💰 Trade' : ''}<br>
                            Fuel Cost: ${option.fuel_cost}
                        </div>
                    </div>
                `;
            } else if (option.type === 'region') {
                return `
                    <div class="nav-option region" onclick="window.gameEngine.navigateToRegion('${option.id}')">
                        <div class="nav-option-header">🌌 ${option.name}</div>
                        <div class="nav-option-details">
                            Region Jump<br>
                            Fuel Cost: ${option.fuel_cost}
                        </div>
                    </div>
                `;
            }
        }).join('');
        
        // Render star map
        function renderMap() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.save();
            ctx.translate(canvas.width / 2 + camera.x, canvas.height / 2 + camera.y);
            ctx.scale(camera.zoom, camera.zoom);
            
            // Draw region connections
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            Object.values(starMap.regions).forEach(region => {
                region.connections.forEach(targetId => {
                    const target = starMap.regions[targetId];
                    if (target) {
                        ctx.beginPath();
                        ctx.moveTo(region.position[0], region.position[1]);
                        ctx.lineTo(target.position[0], target.position[1]);
                        ctx.stroke();
                    }
                });
            });
            
            // Draw regions
            Object.values(starMap.regions).forEach(region => {
                const x = region.position[0];
                const y = region.position[1];
                
                // Region glow
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, 100);
                gradient.addColorStop(0, region.config.background.primary_color + '40');
                gradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, 100, 0, Math.PI * 2);
                ctx.fill();
                
                // Region name
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 16px Orbitron';
                ctx.textAlign = 'center';
                ctx.fillText(region.name, x, y - 120);
                
                // Draw nodes
                region.nodes.forEach(node => {
                    const nodeX = x + node.position[0] * 0.5;
                    const nodeY = y + node.position[1] * 0.5;
                    
                    // Node connections
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
                    ctx.lineWidth = 1;
                    node.connections.forEach(connId => {
                        const connNode = region.nodes.find(n => n.id === connId);
                        if (connNode) {
                            const connX = x + connNode.position[0] * 0.5;
                            const connY = y + connNode.position[1] * 0.5;
                            ctx.beginPath();
                            ctx.moveTo(nodeX, nodeY);
                            ctx.lineTo(connX, connY);
                            ctx.stroke();
                        }
                    });
                    
                    // Node circle
                    const isCurrentNode = node.id === starMap.current_node;
                    ctx.fillStyle = isCurrentNode ? '#FFD700' : (node.visited ? '#00FF00' : '#808080');
                    ctx.beginPath();
                    ctx.arc(nodeX, nodeY, isCurrentNode ? 8 : 5, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Node name (only for current or hovered)
                    if (isCurrentNode) {
                        ctx.fillStyle = '#FFFFFF';
                        ctx.font = '12px Space Mono';
                        ctx.fillText(node.name, nodeX, nodeY - 10);
                    }
                });
            });
            
            ctx.restore();
        }
        
        renderMap();
    }
    
    hideStarMap() {
        const modal = document.getElementById('star-map-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Export for use in other modules
window.UIManager = UIManager;
// Also create a global instance for onclick handlers
window.uiManager = null; // Will be set when UIManager is created
