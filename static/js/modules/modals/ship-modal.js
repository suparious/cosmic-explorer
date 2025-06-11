/**
 * ShipModal - Handles ship management interface
 */
export class ShipModal {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.initStyles();
    }
    
    initStyles() {
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
                    z-index: 10;
                    position: relative;
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
    }
    
    /**
     * Show the ship modal
     */
    show() {
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
                        <button class="modal-close" onclick="window.gameUI.shipModal.hide()">×</button>
                    </div>
                    <div class="ship-modal-tabs">
                        <button class="tab-button active" onclick="window.gameUI.shipModal.showTab('overview')">Overview</button>
                        <button class="tab-button" onclick="window.gameUI.shipModal.showTab('modifications')">Modifications</button>
                        <button class="tab-button" onclick="window.gameUI.shipModal.showTab('inventory')">Cargo Hold</button>
                    </div>
                    <div id="ship-modal-content" class="ship-modal-body">
                        <!-- Content will be dynamically generated -->
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Show overview tab by default
        this.showTab('overview');
        
        // Track modal
        if (this.uiManager.modalManager) {
            this.uiManager.modalManager.trackModal(modal);
        }
    }
    
    /**
     * Hide the ship modal
     */
    hide() {
        const modal = document.getElementById('ship-modal');
        if (this.uiManager.modalManager) {
            this.uiManager.modalManager.hideModal(modal, true);
        }
    }
    
    /**
     * Show a specific tab
     * @param {string} tabName - The tab to show
     */
    showTab(tabName) {
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
                                        onclick="window.gameUI.shipModal.buyShip('${type}')">
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
                                            onclick="window.gameUI.shipModal.buyMod('${modId}')">
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
                            <div class="inventory-item" onclick="window.gameUI.shipModal.showItemOptions('${item.item_id}')">
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
            setTimeout(() => this.show(), 500);
        }
    }
    
    buyMod(modId) {
        if (window.gameEngine) {
            window.gameEngine.sendAction('buy_mod', { mod_id: modId });
            setTimeout(() => this.showTab('modifications'), 500);
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
        
        if (this.uiManager.modalManager) {
            this.uiManager.modalManager.showChoiceModal(
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
                    setTimeout(() => this.showTab('inventory'), 500);
                }
            );
        }
    }
}
