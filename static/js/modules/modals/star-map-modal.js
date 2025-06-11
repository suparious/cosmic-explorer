/**
 * StarMapModal - Handles star map display and navigation
 */
export class StarMapModal {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.selectedDestination = null;
        this.initStyles();
    }
    
    initStyles() {
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
                    background: #000428;
                    background: linear-gradient(to bottom, #000428 0%, #004e92 100%);
                    position: relative;
                    overflow: hidden;
                    min-height: 500px;
                }
                #star-map-sidebar {
                    width: 300px;
                    background: var(--glass-bg);
                    border-left: 2px solid var(--glass-border);
                    padding: 1.5rem;
                    overflow-y: auto;
                }
                #navigation-options-list {
                    margin-bottom: 2rem;
                }
                .nav-option {
                    background: var(--glass-bg);
                    border: 2px solid var(--glass-border);
                    border-radius: 8px;
                    padding: 1rem;
                    margin-bottom: 0.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .nav-option:hover {
                    border-color: var(--primary-color);
                    transform: translateX(-5px);
                }
                .nav-option.selected {
                    border-color: var(--success-color);
                    background: rgba(51, 255, 51, 0.1);
                }
                .nav-option-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .nav-option-name {
                    font-weight: 700;
                    color: var(--primary-color);
                }
                .nav-option-distance {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }
                .nav-option-type {
                    font-size: 0.8rem;
                    color: var(--accent-color);
                }
                .nav-option-fuel {
                    font-size: 0.9rem;
                    font-weight: 600;
                }
                .fuel-sufficient {
                    color: var(--success-color);
                }
                .fuel-insufficient {
                    color: var(--danger-color);
                }
                .current-location-info {
                    background: var(--glass-bg);
                    border: 2px solid var(--primary-color);
                    border-radius: 8px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                }
                .star-map-legend {
                    position: absolute;
                    bottom: 1rem;
                    right: 1rem;
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 8px;
                    padding: 1rem;
                    font-size: 0.8rem;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.25rem;
                }
                .legend-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }
                @media (max-width: 768px) {
                    .star-map-body {
                        flex-direction: column;
                    }
                    #star-map-sidebar {
                        width: 100%;
                        border-left: none;
                        border-top: 2px solid var(--glass-border);
                        max-height: 300px;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Show the star map
     * @param {Object} starMap - The star map data
     * @param {Object} navigationData - Navigation options data
     */
    show(starMap, navigationData) {
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
                        <button class="modal-close" onclick="window.gameUI.starMapModal.hide()">×</button>
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
                            <div id="travel-preview" style="display: none; margin-top: 2rem; padding: 1rem; background: var(--glass-bg); border: 2px solid var(--primary-color); border-radius: 8px;">
                                <h5>Travel Preview</h5>
                                <div id="travel-preview-content"></div>
                                <button class="menu-btn" style="width: 100%; margin-top: 1rem;" onclick="window.gameUI.starMapModal.confirmTravel()">Confirm Travel</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Render star map
        this.renderStarMap(starMap);
        
        // Populate navigation options
        this.populateNavigationOptions(navigationData);
        
        // Update current location details
        this.updateCurrentLocationDetails(starMap.current_location);
        
        // Track modal
        if (this.uiManager.modalManager) {
            this.uiManager.modalManager.trackModal(modal);
        }
    }
    
    /**
     * Hide the star map
     */
    hide() {
        const modal = document.getElementById('star-map-modal');
        if (this.uiManager.modalManager) {
            this.uiManager.modalManager.hideModal(modal, true);
        }
        this.selectedDestination = null;
    }
    
    /**
     * Render the star map visualization
     * @param {Object} starMap - The star map data
     */
    renderStarMap(starMap) {
        const canvas = document.getElementById('star-map-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background stars
        this.drawBackgroundStars(ctx, canvas.width, canvas.height);
        
        // Draw connections
        if (starMap.connections) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            starMap.connections.forEach(conn => {
                const from = starMap.locations.find(loc => loc.id === conn.from);
                const to = starMap.locations.find(loc => loc.id === conn.to);
                if (from && to) {
                    ctx.beginPath();
                    ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
                    ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
                    ctx.stroke();
                }
            });
        }
        
        // Draw locations
        starMap.locations.forEach(location => {
            this.drawLocation(ctx, location, canvas.width, canvas.height, location.id === starMap.current_location.id);
        });
        
        // Draw legend
        this.drawLegend();
    }
    
    /**
     * Draw background stars
     */
    drawBackgroundStars(ctx, width, height) {
        const starCount = 200;
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2;
            const brightness = Math.random();
            
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    /**
     * Draw a location on the map
     */
    drawLocation(ctx, location, width, height, isCurrent) {
        const x = location.x * width;
        const y = location.y * height;
        const radius = isCurrent ? 15 : 10;
        
        // Determine color based on type
        let color = '#00ffff'; // Default cyan
        switch (location.type) {
            case 'station': color = '#00ff00'; break;
            case 'planet': color = '#ff9900'; break;
            case 'asteroid_field': color = '#9966ff'; break;
            case 'nebula': color = '#ff00ff'; break;
            case 'abandoned_ship': color = '#ff6666'; break;
        }
        
        // Draw glow effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);
        
        // Draw location dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw current location indicator
        if (isCurrent) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Draw label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(location.name, x, y + radius + 15);
    }
    
    /**
     * Draw the map legend
     */
    drawLegend() {
        const legendContainer = document.createElement('div');
        legendContainer.className = 'star-map-legend';
        legendContainer.innerHTML = `
            <h5 style="margin-bottom: 0.5rem;">Legend</h5>
            <div class="legend-item">
                <div class="legend-dot" style="background: #00ff00;"></div>
                <span>Station</span>
            </div>
            <div class="legend-item">
                <div class="legend-dot" style="background: #ff9900;"></div>
                <span>Planet</span>
            </div>
            <div class="legend-item">
                <div class="legend-dot" style="background: #9966ff;"></div>
                <span>Asteroid Field</span>
            </div>
            <div class="legend-item">
                <div class="legend-dot" style="background: #ff00ff;"></div>
                <span>Nebula</span>
            </div>
            <div class="legend-item">
                <div class="legend-dot" style="background: #ff6666;"></div>
                <span>Abandoned Ship</span>
            </div>
        `;
        
        const canvas = document.getElementById('star-map-canvas');
        if (canvas && canvas.parentElement) {
            const existingLegend = canvas.parentElement.querySelector('.star-map-legend');
            if (existingLegend) existingLegend.remove();
            canvas.parentElement.appendChild(legendContainer);
        }
    }
    
    /**
     * Populate navigation options
     * @param {Object} navigationData - Navigation options data
     */
    populateNavigationOptions(navigationData) {
        const optionsList = document.getElementById('navigation-options-list');
        if (!optionsList) return;
        
        optionsList.innerHTML = '';
        
        const playerFuel = window.gameEngine?.gameState?.player_stats?.fuel || 0;
        
        navigationData.options.forEach((option, index) => {
            const hasFuel = playerFuel >= option.fuel_cost;
            
            const optionDiv = document.createElement('div');
            optionDiv.className = 'nav-option';
            optionDiv.innerHTML = `
                <div class="nav-option-header">
                    <span class="nav-option-name">${option.name}</span>
                    <span class="nav-option-distance">${option.distance} AU</span>
                </div>
                <div class="nav-option-type">${option.type.replace('_', ' ')}</div>
                <div class="nav-option-fuel ${hasFuel ? 'fuel-sufficient' : 'fuel-insufficient'}">
                    Fuel: ${option.fuel_cost} ${hasFuel ? '✓' : '✗'}
                </div>
            `;
            
            optionDiv.onclick = () => this.selectDestination(option, index + 1);
            
            optionsList.appendChild(optionDiv);
        });
    }
    
    /**
     * Update current location details
     * @param {Object} location - Current location data
     */
    updateCurrentLocationDetails(location) {
        const detailsDiv = document.getElementById('current-location-details');
        if (!detailsDiv) return;
        
        detailsDiv.innerHTML = `
            <div><strong>${location.name}</strong></div>
            <div style="color: var(--text-secondary); font-size: 0.9rem;">${location.type.replace('_', ' ')}</div>
            ${location.description ? `<div style="margin-top: 0.5rem; font-size: 0.8rem;">${location.description}</div>` : ''}
        `;
    }
    
    /**
     * Select a destination
     * @param {Object} destination - The destination data
     * @param {number} optionNumber - The option number (1-based)
     */
    selectDestination(destination, optionNumber) {
        // Update selected state
        document.querySelectorAll('.nav-option').forEach((el, idx) => {
            el.classList.toggle('selected', idx === optionNumber - 1);
        });
        
        this.selectedDestination = { destination, optionNumber };
        
        // Show travel preview
        const previewDiv = document.getElementById('travel-preview');
        const previewContent = document.getElementById('travel-preview-content');
        
        if (previewDiv && previewContent) {
            previewContent.innerHTML = `
                <div><strong>Destination:</strong> ${destination.name}</div>
                <div><strong>Type:</strong> ${destination.type.replace('_', ' ')}</div>
                <div><strong>Distance:</strong> ${destination.distance} AU</div>
                <div><strong>Fuel Required:</strong> ${destination.fuel_cost}</div>
                ${destination.description ? `<div style="margin-top: 0.5rem; font-style: italic;">"${destination.description}"</div>` : ''}
            `;
            previewDiv.style.display = 'block';
        }
    }
    
    /**
     * Confirm travel to selected destination
     */
    confirmTravel() {
        if (this.selectedDestination && window.gameEngine) {
            // Send navigation choice to game engine
            window.gameEngine.sendAction('choice', { choice: this.selectedDestination.optionNumber });
            this.hide();
        }
    }
}
