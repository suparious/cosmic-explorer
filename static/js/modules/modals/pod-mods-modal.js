/**
 * PodModsModal - Handles pod augmentation interface
 */
export class PodModsModal {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.initStyles();
    }
    
    initStyles() {
        if (!document.getElementById('pod-mods-styles')) {
            const style = document.createElement('style');
            style.id = 'pod-mods-styles';
            style.textContent = `
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
    }
    
    /**
     * Show the pod mods modal
     */
    show() {
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
                    <button class="menu-btn" onclick="window.gameUI.podModsModal.hide()">Close</button>
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
                ${!isOwned ? `<button class="aug-buy-btn" ${!canAfford ? 'disabled' : ''} onclick="window.gameUI.podModsModal.buyAugmentation('${aug.id}')">Purchase</button>` : ''}
            `;
            
            augList.appendChild(augCard);
        });
        
        // Track modal
        if (this.uiManager.modalManager) {
            this.uiManager.modalManager.trackModal(modal);
        }
    }
    
    /**
     * Hide the pod mods modal
     */
    hide() {
        const modal = document.getElementById('pod-mods-modal');
        if (this.uiManager.modalManager) {
            this.uiManager.modalManager.hideModal(modal, true);
        }
    }
    
    /**
     * Buy an augmentation
     * @param {string} augId - The augmentation ID
     */
    buyAugmentation(augId) {
        if (window.gameEngine) {
            window.gameEngine.sendAction('buy_augmentation', { augmentation_id: augId });
            // Modal will refresh when game state updates
            setTimeout(() => this.show(), 500);
        }
    }
}
