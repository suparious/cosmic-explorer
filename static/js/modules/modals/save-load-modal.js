/**
 * SaveLoadModal - Handles save and load game functionality
 */
export class SaveLoadModal {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.currentSaveLoadMode = 'save';
        this.initStyles();
    }
    
    initStyles() {
        // Add styles if not already present
        if (!document.getElementById('save-load-styles')) {
            const style = document.createElement('style');
            style.id = 'save-load-styles';
            style.textContent = `
                .save-load-content {
                    max-width: 700px;
                    width: 90%;
                    max-height: 80vh;
                    height: 80vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 2px solid var(--glass-border);
                    flex-shrink: 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .save-load-tabs {
                    display: flex;
                    margin-bottom: 1.5rem;
                    border-bottom: 2px solid var(--glass-border);
                    flex-shrink: 0;
                    padding: 0 1.5rem;
                }
                #save-slots-container {
                    overflow-y: auto;
                    overflow-x: hidden;
                    flex: 1;
                    min-height: 0;
                    padding: 0 1.5rem 1.5rem 1.5rem;
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
                @media (max-height: 700px) {
                    .save-load-content {
                        max-height: 90vh;
                        height: 90vh;
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
                    .modal-header h3 {
                        font-size: 1.2rem;
                    }
                }
                
                @media (max-height: 500px) {
                    .save-load-content {
                        max-height: 95vh;
                        height: 95vh;
                    }
                    .modal-header {
                        padding: 1rem;
                    }
                    .save-load-tabs {
                        margin-bottom: 0.5rem;
                        padding: 0 1rem;
                    }
                    #save-slots-container {
                        padding: 0 1rem 1rem 1rem;
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
    
    /**
     * Show the save/load modal
     * @param {string} mode - 'save' or 'load'
     */
    show(mode = 'save') {
        // Remove any existing modal first to prevent duplicates
        const existingModal = document.getElementById('save-load-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create new modal
        const modal = document.createElement('div');
        modal.id = 'save-load-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content save-load-content">
                <div class="modal-header">
                    <h3 id="save-load-title">💾 Save Game</h3>
                    <button class="modal-close" onclick="window.gameUI.saveLoadModal.hide()">×</button>
                </div>
                <div class="save-load-tabs">
                    <button class="tab-button active" onclick="window.gameUI.saveLoadModal.switchMode('save')">Save Game</button>
                    <button class="tab-button" onclick="window.gameUI.saveLoadModal.switchMode('load')">Load Game</button>
                </div>
                <div id="save-slots-container">
                    <!-- Slots will be populated here -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Update modal based on mode
        this.currentSaveLoadMode = mode;
        this.switchMode(mode);
        
        // Load save slots
        this.refreshSaveSlots();
        
        // Track modal
        if (this.uiManager.modalManager) {
            this.uiManager.modalManager.trackModal(modal);
        }
    }
    
    /**
     * Hide the save/load modal
     */
    hide() {
        const modal = document.getElementById('save-load-modal');
        if (this.uiManager.modalManager) {
            this.uiManager.modalManager.hideModal(modal, true);
        }
    }
    
    /**
     * Switch between save and load modes
     * @param {string} mode - 'save' or 'load'
     */
    switchMode(mode) {
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
    
    /**
     * Refresh the save slot display
     */
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
    
    /**
     * Create a save slot element
     * @param {number} slot - The slot number
     * @param {Object} saveData - The save data if exists
     * @returns {HTMLElement} The slot element
     */
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
                    '<div class="save-slot-actions"><button class="save-action-btn delete" onclick="window.gameUI.saveLoadModal.deleteSave(' + slot + ')">Delete</button></div>' : ''}
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
    
    /**
     * Save game to a slot
     * @param {number} slot - The slot number
     */
    async saveToSlot(slot) {
        const sessionId = window.gameEngine?.sessionId || 'default';
        
        // Show confirmation if slot has existing save
        try {
            const response = await fetch(`/api/saves/${slot}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Slot has a save - check if it's autosave or manual save
                    if (data.is_autosave) {
                        // Autosave slot - proceed without confirmation
                        await this.performSave(slot, sessionId);
                    } else {
                        // Manual save exists - ask for confirmation
                        if (this.uiManager.modalManager) {
                            this.uiManager.modalManager.showChoiceModal(
                                'Overwrite Save?',
                                ['Yes, overwrite this save', 'No, cancel'],
                                async (choice) => {
                                    if (choice === 1) {
                                        await this.performSave(slot, sessionId);
                                    }
                                }
                            );
                        }
                    }
                    return; // Important: return here to prevent fall-through
                }
            } else if (response.status === 404) {
                // Slot is empty, proceed with save
                await this.performSave(slot, sessionId);
                return;
            }
        } catch (error) {
            // Network error, try to save anyway
            console.warn('Could not check save slot:', error);
            await this.performSave(slot, sessionId);
        }
    }
    
    /**
     * Perform the actual save operation
     * @param {number} slot - The slot number
     * @param {string} sessionId - The session ID
     */
    async performSave(slot, sessionId) {
        try {
            const response = await fetch(`/api/saves/${slot}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (this.uiManager.notificationManager) {
                    this.uiManager.notificationManager.showNotification(`Game saved to slot ${slot}!`, 'success');
                }
                this.refreshSaveSlots();
            } else {
                throw new Error(data.error || 'Failed to save game');
            }
        } catch (error) {
            if (this.uiManager.notificationManager) {
                this.uiManager.notificationManager.showNotification(`Failed to save: ${error.message}`, 'danger');
            }
        }
    }
    
    /**
     * Load game from a slot
     * @param {number} slot - The slot number
     */
    async loadFromSlot(slot) {
        const sessionId = window.gameEngine?.sessionId || 'default';
        
        if (this.uiManager.modalManager) {
            this.uiManager.modalManager.showChoiceModal(
                'Load Game?',
                ['Yes, load this save', 'No, cancel'],
                async (choice) => {
                    if (choice === 1) {
                        try {
                            // Close all modals and clear notifications before loading
                            this.uiManager.modalManager.closeAllModals();
                            document.querySelectorAll('.notification').forEach(notif => notif.remove());
                            
                            // Small delay to ensure modals are fully closed
                            await new Promise(resolve => setTimeout(resolve, 100));
                            const response = await fetch(`/api/load/${slot}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ session_id: sessionId })
                            });
                            
                            const data = await response.json();
                            
                            if (data.success) {
                                if (this.uiManager.notificationManager) {
                                    this.uiManager.notificationManager.showNotification(`Game loaded from slot ${slot}!`, 'success');
                                }
                                this.hide();
                                
                                // Mark that we have an active game
                                this.uiManager.hasActiveGame = true;
                                if (this.uiManager.screenManager) {
                                    this.uiManager.screenManager.updateContinueButtonVisibility();
                                }
                                
                                // Update game state and ensure proper initialization
                                if (window.gameEngine) {
                                    // Update the game state
                                    window.gameEngine.gameState = data.game_state;
                                    window.gameEngine.sessionId = data.session_id || 'default';
                                    
                                    // Emit game state update event for all components
                                    document.dispatchEvent(new CustomEvent('gameStateUpdated', {
                                        detail: data.game_state
                                    }));
                                    
                                    // Update all UI components
                                    if (this.uiManager.hudManager) {
                                        this.uiManager.hudManager.updateHUD(data.game_state);
                                    }
                                    
                                    // Switch to game screen
                                    if (this.uiManager.screenManager) {
                                        this.uiManager.screenManager.showScreen('game');
                                    }
                                    
                                    // Start music if not already playing
                                    if (window.audioManager) {
                                        window.audioManager.playMusic();
                                        window.audioManager.updateMusicForGameState(data.game_state);
                                    }
                                    
                                    // Update renderer with game state
                                    if (window.gameEngine.renderer) {
                                        // Update region theme if available
                                        if (data.game_state.current_location && data.game_state.current_location.region) {
                                            window.gameEngine.renderer.updateRegionTheme(data.game_state.current_location.region);
                                        }
                                        
                                        // Force ship update
                                        if (window.gameEngine.renderer.ship) {
                                            const stats = data.game_state.player_stats;
                                            window.gameEngine.renderer.ship.health = stats.health;
                                            window.gameEngine.renderer.ship.condition = stats.ship_condition;
                                            window.gameEngine.renderer.ship.hasPod = stats.has_flight_pod;
                                            window.gameEngine.renderer.ship.inPodMode = stats.in_pod_mode;
                                            window.gameEngine.renderer.ship.podHp = stats.pod_hp;
                                            window.gameEngine.renderer.ship.podMaxHp = stats.pod_max_hp;
                                            window.gameEngine.renderer.ship.shipType = stats.ship_type || 'scout';
                                            window.gameEngine.renderer.ship.shipMods = stats.ship_mods || {};
                                        }
                                    }
                                    
                                    // Generate new space environment
                                    window.gameEngine.generateSpaceEnvironment();
                                    
                                    // Re-join the socket session with the correct ID
                                    if (window.gameEngine.socketHandler && window.gameEngine.socketHandler.socket && window.gameEngine.socketHandler.socket.connected) {
                                        window.gameEngine.socketHandler.socket.emit('join_session', { session_id: window.gameEngine.sessionId });
                                    }
                                } else {
                                    // Game engine not ready, reload the page to ensure proper initialization
                                    if (this.uiManager.notificationManager) {
                                        this.uiManager.notificationManager.showNotification('Reloading game...', 'info');
                                    }
                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 1000);
                                }
                            } else {
                                throw new Error(data.error || 'Failed to load game');
                            }
                        } catch (error) {
                            if (this.uiManager.notificationManager) {
                                this.uiManager.notificationManager.showNotification(`Failed to load: ${error.message}`, 'danger');
                            }
                        }
                    }
                }
            );
        }
    }
    
    /**
     * Delete a save
     * @param {number} slot - The slot number
     */
    async deleteSave(slot) {
        if (this.uiManager.modalManager) {
            this.uiManager.modalManager.showChoiceModal(
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
                                if (this.uiManager.notificationManager) {
                                    this.uiManager.notificationManager.showNotification(`Save in slot ${slot} deleted!`, 'success');
                                }
                                // Add a small delay to ensure the file system updates
                                setTimeout(() => {
                                    this.refreshSaveSlots();
                                }, 200);
                            } else {
                                throw new Error(data.error || 'Failed to delete save');
                            }
                        } catch (error) {
                            if (this.uiManager.notificationManager) {
                                this.uiManager.notificationManager.showNotification(`Failed to delete: ${error.message}`, 'danger');
                            }
                        }
                    }
                }
            );
        }
    }
}
