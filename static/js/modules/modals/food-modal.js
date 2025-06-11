/**
 * FoodModal - Handles food consumption interface
 */
export class FoodModal {
    constructor(uiManager) {
        this.uiManager = uiManager;
    }
    
    /**
     * Show the food modal
     */
    show() {
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
                    <button class="menu-btn" onclick="window.gameUI.foodModal.hide()">Close</button>
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
        
        // Track modal
        if (this.uiManager.modalManager) {
            this.uiManager.modalManager.trackModal(modal);
        }
        
        // Add hover effect to food resource when modal is open
        const foodResource = document.getElementById('food-resource');
        if (foodResource) {
            foodResource.style.transform = 'scale(1.1)';
            foodResource.style.boxShadow = '0 0 10px rgba(255, 200, 0, 0.5)';
        }
    }
    
    /**
     * Create a food consumption option
     * @param {number} foodCost - Amount of food required
     * @param {number} healthGain - Amount of health gained
     * @param {Object} playerStats - Current player stats
     * @returns {string} HTML for the food option
     */
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
            " ${!isDisabled ? `onclick="window.gameUI.foodModal.consumeFood(${foodCost})"` : ''}>
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🍞 ${foodCost}</div>
                <div style="font-size: 0.9rem; color: var(--text-secondary);">Consume</div>
                <div style="font-size: 0.8rem; margin-top: 0.5rem; color: ${isDisabled ? 'var(--text-secondary)' : 'var(--success-color)'}">
                    +${actualHealthGain} ❤️
                </div>
            </div>
        `;
    }
    
    /**
     * Hide the food modal
     */
    hide() {
        const modal = document.getElementById('food-modal');
        if (this.uiManager.modalManager) {
            this.uiManager.modalManager.hideModal(modal, true);
        }
        
        // Remove hover effect from food resource
        const foodResource = document.getElementById('food-resource');
        if (foodResource) {
            foodResource.style.transform = 'scale(1)';
            foodResource.style.boxShadow = 'none';
        }
    }
    
    /**
     * Consume food
     * @param {number} amount - Amount of food to consume
     */
    consumeFood(amount) {
        if (window.gameEngine) {
            window.gameEngine.consumeFood(amount);
            // Close modal after consumption
            setTimeout(() => this.hide(), 500);
        }
    }
}
