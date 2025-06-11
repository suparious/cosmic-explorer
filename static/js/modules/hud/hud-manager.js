/**
 * HUDManager - Handles all HUD updates and status displays
 */
export class HUDManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.lowHealthWarningPlayed = false;
        this.lowFuelWarningPlayed = false;
    }
    
    /**
     * Update all HUD elements based on game state
     * @param {Object} gameState - The current game state
     */
    updateHUD(gameState) {
        if (!gameState || !gameState.player_stats) return;
        
        const stats = gameState.player_stats;
        
        // Update mine button visibility
        this.updateMineButton(gameState);
        
        // Update health
        this.updateHealth(stats);
        
        // Update fuel
        this.updateFuel(stats);
        
        // Update ship condition or pod HP
        this.updateShipCondition(gameState, stats);
        
        // Update pod indicator
        this.updatePodIndicator(gameState, stats);
        
        // Update resources
        this.updateResources(stats);
        
        // Update turn counter
        this.updateTurnCounter(gameState);
        
        // Update quest indicator
        this.updateQuestIndicator(gameState);
        
        // Update action buttons
        this.updateActionButtons(gameState, stats);
        
        // Update pod mode specific UI
        if (stats.in_pod_mode) {
            this.updatePodModeActions(gameState, stats);
        }
    }
    
    updateHealth(stats) {
        const healthValue = document.getElementById('health-value');
        if (healthValue) healthValue.textContent = stats.health;
        
        const healthBar = document.querySelector('.health-fill');
        if (healthBar) {
            healthBar.style.width = `${(stats.health / 100) * 100}%`;
            
            // Flash warnings for critical stats and play warning sounds
            if (stats.health < 30) {
                healthBar.classList.add('critical');
                // Play low health warning once per threshold
                if (!this.lowHealthWarningPlayed && window.audioManager) {
                    window.audioManager.playLowHealthWarning();
                    this.lowHealthWarningPlayed = true;
                }
            } else {
                healthBar.classList.remove('critical');
                // Reset warning flag when health improves
                if (stats.health >= 50) {
                    this.lowHealthWarningPlayed = false;
                }
            }
        }
    }
    
    updateFuel(stats) {
        const fuelValue = document.getElementById('fuel-value');
        if (fuelValue) fuelValue.textContent = stats.fuel;
        
        const fuelBar = document.querySelector('.fuel-fill');
        if (fuelBar) {
            fuelBar.style.width = `${(stats.fuel / 100) * 100}%`;
            
            if (stats.fuel < 20) {
                fuelBar.classList.add('critical');
                // Play low fuel warning once per threshold
                if (!this.lowFuelWarningPlayed && window.audioManager) {
                    window.audioManager.playLowFuelWarning();
                    this.lowFuelWarningPlayed = true;
                }
            } else {
                fuelBar.classList.remove('critical');
                // Reset warning flag when fuel improves
                if (stats.fuel >= 40) {
                    this.lowFuelWarningPlayed = false;
                }
            }
        }
    }
    
    updateShipCondition(gameState, stats) {
        const shipValue = document.getElementById('ship-value');
        const shipBar = document.querySelector('.ship-fill');
        const shipIcon = document.querySelector('.ship-icon');
        
        // Make ship icon clickable for ship customization
        if (shipIcon) {
            const shipInfo = gameState.ship_types ? gameState.ship_types[stats.ship_type || 'scout'] : null;
            
            if (!stats.in_pod_mode) {
                shipIcon.style.cursor = 'pointer';
                shipIcon.onclick = () => {
                    if (this.uiManager.shipModal) {
                        this.uiManager.shipModal.show();
                    }
                };
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
                
                if (stats.pod_hp < 10) {
                    shipBar.classList.add('critical');
                } else {
                    shipBar.classList.remove('critical');
                }
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
                
                if (stats.ship_condition < 30) {
                    shipBar.classList.add('critical');
                } else {
                    shipBar.classList.remove('critical');
                }
            }
            if (shipIcon) {
                shipIcon.innerHTML = '🚀'; // Ship icon
            }
        }
    }
    
    updatePodIndicator(gameState, stats) {
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
                    
                    if (this.uiManager.notificationManager) {
                        this.uiManager.notificationManager.showNotification(message, 'info', 5000);
                    }
                };
            }
        } else {
            const podIndicator = document.getElementById('pod-owned-indicator');
            if (podIndicator) {
                podIndicator.style.display = 'none';
            }
        }
    }
    
    updateResources(stats) {
        const wealthValue = document.getElementById('wealth-value');
        if (wealthValue) wealthValue.textContent = stats.wealth;
        
        const foodValue = document.getElementById('food-value');
        if (foodValue) foodValue.textContent = stats.food;
    }
    
    updateTurnCounter(gameState) {
        const turnValue = document.getElementById('turn-value');
        if (turnValue) turnValue.textContent = `${gameState.turn_count}/${gameState.max_turns}`;
    }
    
    updateQuestIndicator(gameState) {
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
    }
    
    updateActionButtons(gameState, stats) {
        const repairBtn = document.getElementById('repair-btn');
        
        if (stats.in_pod_mode) {
            // Pod mode actions
            this.updatePodModeActions(gameState, stats);
        } else {
            // Normal mode actions - ALWAYS hide buy ship button when not in pod mode
            if (this.uiManager.actionButtons) {
                this.uiManager.actionButtons.hideBuyShipButton();
            }
            
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
                if (this.uiManager.actionButtons) {
                    this.uiManager.actionButtons.showBuyPodButton();
                }
            } else {
                if (this.uiManager.actionButtons) {
                    this.uiManager.actionButtons.hideBuyPodButton();
                }
            }
            
            // Show pod mods button if has pod and at location
            if (stats.has_flight_pod && gameState.at_repair_location && !stats.in_pod_mode) {
                if (this.uiManager.actionButtons) {
                    this.uiManager.actionButtons.showPodModsButton(stats.just_bought_pod);
                }
            } else {
                if (this.uiManager.actionButtons) {
                    this.uiManager.actionButtons.hidePodModsButton();
                }
            }
        }
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
            if (this.uiManager.actionButtons) {
                this.uiManager.actionButtons.showBuyShipButton();
            }
        } else {
            if (this.uiManager.actionButtons) {
                this.uiManager.actionButtons.hideBuyShipButton();
            }
        }
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
                    if (this.uiManager.notificationManager) {
                        this.uiManager.notificationManager.showNotification('You need a Mining Laser to mine asteroids!', 'warning');
                    }
                };
            }
        } else if (mineBtn) {
            mineBtn.style.display = 'none';
        }
    }
}
