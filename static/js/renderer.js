// Canvas Renderer for Cosmic Explorer
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Background elements
        this.stars = [];
        this.nebulae = [];
        
        // Game objects
        this.ship = null;
        this.planets = [];
        this.stations = [];
        this.asteroids = [];
        this.particles = [];
        this.enemies = [];
        this.merchants = [];
        this.projectiles = [];
        this.damageNumbers = [];
        this.visualEvents = [];
        this.wrecks = [];
        this.cargoContainers = [];
        this.targetLocks = [];
        this.tractorBeams = [];
        
        // Current region theme
        this.currentRegion = null;
        this.regionTheme = {
            primaryColor: '#4169E1',
            secondaryColor: '#87CEEB',
            starDensity: 1.0,
            nebulaOpacity: 0.5,
            ambientBrightness: 0.5
        };
        
        // Warp effect state
        this.warpEffect = {
            active: false,
            progress: 0,
            startTime: 0,
            duration: 2000
        };
        
        // Camera
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            targetX: 0,
            targetY: 0,
            targetZoom: 1
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        // Resize canvas to full window
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Generate background
        this.generateStars();
        this.generateNebulae();
        
        // Initialize ship
        this.ship = {
            x: this.width / 2,
            y: this.height / 2,
            angle: 0,
            velocity: { x: 0, y: 0 },
            thrustParticles: [],
            trail: [],
            health: 100,
            condition: 100,
            hasPod: false,
            inPodMode: false,
            podHp: 0,
            podMaxHp: 30,
            podAnimationState: 'idle',
            podAugmentations: [],
            // EVE-style systems
            shield: 100,
            maxShield: 100,
            armor: 100,
            maxArmor: 100,
            hull: 100,
            maxHull: 100,
            capacitor: 100,
            maxCapacitor: 100,
            targetLocked: null,
            lockingTarget: null,
            lockProgress: 0,
            orbitTarget: null,
            orbitRange: 200,
            modules: []
        };
        
        // Center camera on ship initially
        this.camera.x = this.ship.x;
        this.camera.y = this.ship.y;
        this.camera.targetX = this.ship.x;
        this.camera.targetY = this.ship.y;
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }
    
    generateStars() {
        this.stars = [];  // Clear existing stars
        const baseCount = GameConfig.visuals.starCount;
        const count = Math.floor(baseCount * this.regionTheme.starDensity);
        
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.width * 2,
                y: Math.random() * this.height * 2,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    generateNebulae() {
        this.nebulae = [];  // Clear existing nebulae
        
        // Use region theme colors
        const primary = this.hexToRgba(this.regionTheme.primaryColor, this.regionTheme.nebulaOpacity);
        const secondary = this.hexToRgba(this.regionTheme.secondaryColor, this.regionTheme.nebulaOpacity * 0.7);
        
        for (let i = 0; i < GameConfig.visuals.nebulaCount; i++) {
            this.nebulae.push({
                x: Math.random() * this.width * 2,
                y: Math.random() * this.height * 2,
                radius: Math.random() * 300 + 200,
                colors: [primary, secondary],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.001
            });
        }
    }
    
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    updateCamera() {
        // Smooth camera follow
        const smoothing = 0.1;
        this.camera.x += (this.camera.targetX - this.camera.x) * smoothing;
        this.camera.y += (this.camera.targetY - this.camera.y) * smoothing;
        this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * smoothing;
    }
    
    // Center camera on a specific position (for events)
    centerCameraOn(x, y, immediate = false) {
        this.camera.targetX = x;
        this.camera.targetY = y;
        
        if (immediate) {
            this.camera.x = x;
            this.camera.y = y;
        }
    }
    
    // Ensure the ship is always visible
    ensureShipVisible() {
        if (this.ship) {
            // Always keep camera centered on ship
            this.camera.targetX = this.ship.x;
            this.camera.targetY = this.ship.y;
        }
    }
    
    render(gameState) {
        // Update region theme if changed
        if (gameState && gameState.current_location && gameState.current_location.region) {
            this.updateRegionTheme(gameState.current_location.region);
        }
        
        // Clear canvas with region-influenced background
        const bgBrightness = Math.floor(15 * this.regionTheme.ambientBrightness);
        this.ctx.fillStyle = `rgb(${bgBrightness}, ${bgBrightness}, ${bgBrightness + 5})`;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Ensure ship is always visible
        this.ensureShipVisible();
        
        // Update camera
        this.updateCamera();
        
        // Save context
        this.ctx.save();
        
        // Apply camera transform
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Render layers in order
        this.renderNebulae();
        this.renderStars();
        this.renderPlanets();
        this.renderStations();
        this.renderAsteroids();
        this.renderRegionEffects();
        this.renderWrecks();
        this.renderCargoContainers();
        this.renderEnemies();
        this.renderMerchants();
        this.renderShip();
        this.renderTargetLocks();
        this.renderProjectiles();
        this.renderTractorBeams();
        this.renderParticles();
        this.renderVisualEvents();
        
        // Restore context
        this.ctx.restore();
        
        // Render UI elements (not affected by camera)
        this.renderWarpEffect();
        this.renderScanEffect();
        this.renderScreenFlash();
        this.renderDamageOverlay(gameState);
        this.renderDamageNumbers();
        this.renderCapacitorUI();
        this.renderShipStatusUI();
    }
    
    renderStars() {
        this.stars.forEach(star => {
            const twinkle = Math.sin(Date.now() * star.twinkleSpeed) * 0.5 + 0.5;
            const brightness = star.brightness * twinkle;
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    renderNebulae() {
        this.nebulae.forEach(nebula => {
            nebula.rotation += nebula.rotationSpeed;
            
            const gradient = this.ctx.createRadialGradient(
                nebula.x, nebula.y, 0,
                nebula.x, nebula.y, nebula.radius
            );
            gradient.addColorStop(0, nebula.colors[0]);
            gradient.addColorStop(0.5, nebula.colors[1]);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.save();
            this.ctx.translate(nebula.x, nebula.y);
            this.ctx.rotate(nebula.rotation);
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(-nebula.radius, -nebula.radius, nebula.radius * 2, nebula.radius * 2);
            this.ctx.restore();
        });
    }
    
    renderShip() {
        if (!this.ship) return;
        
        // Update ship trail
        this.ship.trail.push({ x: this.ship.x, y: this.ship.y });
        if (this.ship.trail.length > GameConfig.visuals.trailLength) {
            this.ship.trail.shift();
        }
        
        // Render trail (enhanced for warp)
        if (this.warpEffect.active) {
            // Stretched warp trail
            const warpStretch = 1 + this.warpEffect.progress * 5;
            this.ctx.strokeStyle = `rgba(0, 255, 255, ${0.6 - this.warpEffect.progress * 0.3})`;
            this.ctx.lineWidth = 2 + this.warpEffect.progress * 10;
            this.ctx.beginPath();
            this.ship.trail.forEach((point, i) => {
                const dx = point.x - this.ship.x;
                const dy = point.y - this.ship.y;
                const stretchedX = this.ship.x + dx * warpStretch;
                const stretchedY = this.ship.y + dy * warpStretch;
                
                if (i === 0) {
                    this.ctx.moveTo(stretchedX, stretchedY);
                } else {
                    this.ctx.lineTo(stretchedX, stretchedY);
                }
            });
            this.ctx.stroke();
        } else {
            // Normal trail
            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ship.trail.forEach((point, i) => {
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            });
            this.ctx.stroke();
        }
        
        // Check if in pod mode
        if (this.ship.inPodMode) {
            this.renderPod();
            return;
        }
        
        // Render ship
        this.ctx.save();
        this.ctx.translate(this.ship.x, this.ship.y);
        
        // Render shield effect if shields are active
        if (this.ship.shield > 0) {
            this.renderShieldBubble();
        }
        
        this.ctx.rotate(this.ship.angle);
        
        // Ship color based on hull damage
        let shipColor = GameConfig.colors.ship.healthy;
        const hullPercent = this.ship.hull / this.ship.maxHull;
        if (hullPercent < 0.3) {
            shipColor = GameConfig.colors.ship.critical;
        } else if (hullPercent < 0.7) {
            shipColor = GameConfig.colors.ship.damaged;
        }
        
        // Add damage effects based on armor/hull
        if (this.ship.armor < this.ship.maxArmor * 0.5) {
            this.renderArmorDamage();
        }
        if (this.ship.hull < this.ship.maxHull * 0.5) {
            this.renderHullBreach();
        }
        
        // Ship type affects shape
        const shipType = this.ship.shipType || 'scout';
        this.drawShipByType(shipType, shipColor);
        
        // Draw ship mods visual indicators
        if (this.ship.shipMods) {
            this.renderShipModIndicators();
        }
        
        // Pod attached to ship
        if (this.ship.hasPod) {
            // Pod attachment point - make it more visible
            this.ctx.save();
            this.ctx.translate(-28, 0);
            
            // Pulsing effect
            const pulseTime = Date.now() * 0.001;
            const pulseScale = 1 + Math.sin(pulseTime * 3) * 0.1;
            this.ctx.scale(pulseScale, pulseScale);
            
            // Larger pod glow effect
            const podGlow = this.ctx.createRadialGradient(0, 0, 10, 0, 0, 20);
            podGlow.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
            podGlow.addColorStop(0.5, 'rgba(255, 150, 0, 0.4)');
            podGlow.addColorStop(1, 'rgba(255, 200, 0, 0)');
            this.ctx.fillStyle = podGlow;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Pod body - larger and more prominent
            this.ctx.fillStyle = '#FFA500';
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Pod window
            this.ctx.fillStyle = 'rgba(200, 200, 255, 0.9)';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Show augmentation indicators
            if (this.ship.podAugmentations && this.ship.podAugmentations.length > 0) {
                this.ctx.save();
                this.ctx.font = '10px Arial';
                this.ctx.textAlign = 'center';
                
                // Position augmentation icons around the pod
                this.ship.podAugmentations.forEach((aug, index) => {
                    const angle = (index / 4) * Math.PI * 2 - Math.PI / 2;
                    const x = Math.cos(angle) * 18;
                    const y = Math.sin(angle) * 18;
                    
                    // Small glow for each augmentation
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 6, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Augmentation color
                    let augColor = '#FFD700';
                    if (aug === 'shield_boost') augColor = '#00FF00';
                    else if (aug === 'scanner_array') augColor = '#00FFFF';
                    else if (aug === 'cargo_module') augColor = '#FF00FF';
                    else if (aug === 'emergency_thrusters') augColor = '#FF0000';
                    
                    this.ctx.fillStyle = augColor;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 4, 0, Math.PI * 2);
                    this.ctx.fill();
                });
                
                this.ctx.restore();
            }
            
            // Connection line to ship
            this.ctx.strokeStyle = 'rgba(255, 200, 0, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(10, 0);
            this.ctx.lineTo(28, 0);
            this.ctx.stroke();
            
            // Draw augmentation indicators
            if (this.ship.augmentations && this.ship.augmentations.length > 0) {
                const augColors = {
                    'shield_boost': '#00FF00',
                    'scanner_array': '#00FFFF',
                    'cargo_module': '#FF00FF',
                    'emergency_thrusters': '#FF0000'
                };
                
                this.ship.augmentations.forEach((aug, index) => {
                    const angle = (index / this.ship.augmentations.length) * Math.PI * 2 - Math.PI / 2;
                    const x = Math.cos(angle) * 18;
                    const y = Math.sin(angle) * 18;
                    
                    // Augmentation dot with glow
                    this.ctx.fillStyle = augColors[aug] || '#FFFFFF';
                    this.ctx.shadowColor = augColors[aug] || '#FFFFFF';
                    this.ctx.shadowBlur = 5;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                });
            }
            
            // Show augmentation indicators
            if (this.ship.podAugmentations && this.ship.podAugmentations.length > 0) {
                this.ctx.save();
                this.ctx.translate(-10, -20);
                
                // Draw small icons for each augmentation
                const augIcons = {
                    'shield_boost': '🛡️',
                    'scanner_array': '📡',
                    'cargo_module': '📦', 
                    'emergency_thrusters': '🚀'
                };
                
                this.ship.podAugmentations.forEach((augId, index) => {
                    if (augIcons[augId]) {
                        const x = index * 12;
                        
                        // Small glow for augmentation
                        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                        this.ctx.beginPath();
                        this.ctx.arc(x, 0, 8, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        // Draw icon
                        this.ctx.font = '10px sans-serif';
                        this.ctx.textAlign = 'center';
                        this.ctx.fillText(augIcons[augId], x, 3);
                    }
                });
                
                this.ctx.restore();
            }
            
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }
    
    renderPod() {
        if (!this.ship) return;
        
        this.ctx.save();
        this.ctx.translate(this.ship.x, this.ship.y);
        
        // Pod damage effect
        if (this.ship.podAnimationState === 'damaged') {
            const shake = Math.sin(Date.now() * 0.1) * 2;
            this.ctx.translate(shake, 0);
        }
        
        // Pod shield/energy field
        const time = Date.now() * 0.001;
        const shieldAlpha = 0.2 + Math.sin(time * 2) * 0.1;
        const shieldRadius = 25 + Math.sin(time * 3) * 3;
        
        // Draw shield based on pod HP
        const hpRatio = this.ship.podHp / this.ship.podMaxHp;
        let shieldColor;
        if (hpRatio > 0.6) {
            shieldColor = `rgba(0, 255, 255, ${shieldAlpha})`;
        } else if (hpRatio > 0.3) {
            shieldColor = `rgba(255, 255, 0, ${shieldAlpha})`;
        } else {
            shieldColor = `rgba(255, 0, 0, ${shieldAlpha * 1.5})`;
        }
        
        this.ctx.strokeStyle = shieldColor;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Pod glow
        const podGlow = this.ctx.createRadialGradient(0, 0, 12, 0, 0, 20);
        podGlow.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
        podGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');
        this.ctx.fillStyle = podGlow;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pod body
        this.ctx.fillStyle = '#FFA500';
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 12, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Pod window/cockpit
        this.ctx.fillStyle = 'rgba(150, 150, 255, 0.9)';
        this.ctx.beginPath();
        this.ctx.arc(0, -2, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Thruster effects
        if (this.ship.podAnimationState === 'active') {
            const thrustIntensity = Math.sin(time * 10) * 0.3 + 0.7;
            this.ctx.fillStyle = `rgba(0, 200, 255, ${thrustIntensity})`;
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2 + time;
                const x = Math.cos(angle) * 15;
                const y = Math.sin(angle) * 15;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        // Critical warning
        if (hpRatio <= 0.3) {
            const warningAlpha = Math.sin(time * 8) * 0.5 + 0.5;
            this.ctx.fillStyle = `rgba(255, 0, 0, ${warningAlpha})`;
            this.ctx.font = 'bold 12px Orbitron';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('CRITICAL', 0, -35);
        }
        
        this.ctx.restore();
    }
    
    renderPlanets() {
        this.planets.forEach(planet => {
            // Planet glow
            const gradient = this.ctx.createRadialGradient(
                planet.x, planet.y, planet.radius * 0.8,
                planet.x, planet.y, planet.radius * 1.2
            );
            gradient.addColorStop(0, planet.color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(planet.x, planet.y, planet.radius * 1.2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Planet body
            this.ctx.fillStyle = planet.color;
            this.ctx.beginPath();
            this.ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Planet details
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
    
    renderStations() {
        this.stations.forEach(station => {
            // Station rotation
            station.rotation = (station.rotation || 0) + 0.01;
            
            this.ctx.save();
            this.ctx.translate(station.x, station.y);
            this.ctx.rotate(station.rotation);
            
            // Station body
            this.ctx.strokeStyle = GameConfig.colors.primary;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(-20, -20, 40, 40);
            
            // Station core
            this.ctx.fillStyle = GameConfig.colors.primary;
            this.ctx.fillRect(-5, -5, 10, 10);
            
            // Rotating elements
            for (let i = 0; i < 4; i++) {
                this.ctx.save();
                this.ctx.rotate(i * Math.PI / 2);
                this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                this.ctx.beginPath();
                this.ctx.moveTo(10, 0);
                this.ctx.lineTo(30, 0);
                this.ctx.stroke();
                this.ctx.restore();
            }
            
            this.ctx.restore();
        });
    }
    
    renderAsteroids() {
        this.asteroids.forEach(asteroid => {
            asteroid.rotation = (asteroid.rotation || 0) + asteroid.rotationSpeed;
            
            this.ctx.save();
            this.ctx.translate(asteroid.x, asteroid.y);
            this.ctx.rotate(asteroid.rotation);
            
            // Asteroid shape (irregular polygon)
            this.ctx.fillStyle = '#8B7355';
            this.ctx.strokeStyle = '#654321';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const radius = asteroid.radius * (0.8 + Math.random() * 0.4);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.restore();
        });
    }
    
    renderParticles() {
        // Update and render particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.life <= 0) return false;
            
            const alpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = `rgba(${particle.color}, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            return true;
        });
    }
    
    renderScanEffect() {
        if (this.scanEffect && this.scanEffect.active) {
            const progress = (Date.now() - this.scanEffect.startTime) / GameConfig.animations.scan.duration;
            
            if (progress < 1) {
                const radius = GameConfig.animations.scan.radius * progress;
                const alpha = 0.3 * (1 - progress);
                
                this.ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
                this.ctx.stroke();
            } else {
                this.scanEffect.active = false;
            }
        }
    }
    
    renderDamageOverlay(gameState) {
        if (gameState && gameState.player_stats) {
            const health = gameState.player_stats.health;
            if (health < 30) {
                const alpha = 0.3 * (1 - health / 30);
                this.ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
                this.ctx.fillRect(0, 0, this.width, this.height);
            }
        }
    }
    
    renderRegionEffects() {
        // Render trade ships
        if (this.tradeShips) {
            this.tradeShips.forEach(ship => {
                // Draw trail
                this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                ship.trail.forEach((point, i) => {
                    if (i === 0) {
                        this.ctx.moveTo(point.x, point.y);
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                });
                this.ctx.stroke();
                
                // Draw ship
                this.ctx.save();
                this.ctx.translate(ship.x, ship.y);
                const angle = Math.atan2(ship.targetY - ship.y, ship.targetX - ship.x);
                this.ctx.rotate(angle);
                
                this.ctx.fillStyle = ship.color;
                this.ctx.beginPath();
                this.ctx.moveTo(10, 0);
                this.ctx.lineTo(-8, -6);
                this.ctx.lineTo(-5, 0);
                this.ctx.lineTo(-8, 6);
                this.ctx.closePath();
                this.ctx.fill();
                
                this.ctx.restore();
            });
        }
        
        // Render floating asteroids
        if (this.floatingAsteroids) {
            this.floatingAsteroids.forEach(asteroid => {
                // Update position
                asteroid.x += asteroid.vx;
                asteroid.y += asteroid.vy;
                asteroid.rotation += asteroid.rotationSpeed;
                
                this.ctx.save();
                this.ctx.translate(asteroid.x, asteroid.y);
                this.ctx.rotate(asteroid.rotation);
                
                // Draw asteroid
                this.ctx.fillStyle = '#8B7355';
                this.ctx.strokeStyle = '#654321';
                this.ctx.lineWidth = 2;
                
                this.ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const radius = asteroid.size * (0.8 + Math.sin(i * 1.7) * 0.2);
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                
                this.ctx.restore();
            });
        }
    }
    
    renderScreenFlash() {
        if (this.screenFlash && this.screenFlash.duration > 0) {
            this.ctx.fillStyle = this.screenFlash.color;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.screenFlash.duration--;
        }
    }
    
    // Effects methods
    startScanEffect() {
        this.scanEffect = {
            active: true,
            startTime: Date.now()
        };
    }
    
    createExplosion(x, y) {
        const config = GameConfig.animations.explosion;
        for (let i = 0; i < config.particleCount; i++) {
            const angle = (i / config.particleCount) * Math.PI * 2;
            const speed = config.particleSpeed * (0.5 + Math.random() * 0.5);
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 1,
                life: config.particleLife,
                maxLife: config.particleLife,
                color: '255, 100, 0'
            });
        }
    }
    
    createThrustParticles() {
        if (!this.ship) return;
        
        const config = GameConfig.animations.shipThrust;
        const angle = this.ship.angle + Math.PI;
        
        for (let i = 0; i < config.particleCount; i++) {
            const spread = (Math.random() - 0.5) * 0.5;
            const particleAngle = angle + spread;
            const speed = config.particleSpeed * (0.5 + Math.random() * 0.5);
            
            this.particles.push({
                x: this.ship.x + Math.cos(angle) * 20,
                y: this.ship.y + Math.sin(angle) * 20,
                vx: Math.cos(particleAngle) * speed,
                vy: Math.sin(particleAngle) * speed,
                size: Math.random() * 2 + 1,
                life: config.particleLife,
                maxLife: config.particleLife,
                color: '0, 255, 255'
            });
        }
    }
    
    // Update ship position
    updateShip(targetX, targetY) {
        if (!this.ship) return;
        
        // Calculate direction to target
        const dx = targetX - this.ship.x;
        const dy = targetY - this.ship.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            // Update angle
            this.ship.angle = Math.atan2(dy, dx);
            
            // Update velocity
            const thrust = GameConfig.ship.thrustPower;
            this.ship.velocity.x += Math.cos(this.ship.angle) * thrust;
            this.ship.velocity.y += Math.sin(this.ship.angle) * thrust;
            
            // Limit velocity
            const speed = Math.sqrt(this.ship.velocity.x ** 2 + this.ship.velocity.y ** 2);
            if (speed > GameConfig.ship.maxVelocity) {
                this.ship.velocity.x = (this.ship.velocity.x / speed) * GameConfig.ship.maxVelocity;
                this.ship.velocity.y = (this.ship.velocity.y / speed) * GameConfig.ship.maxVelocity;
            }
            
            // Create thrust particles
            if (Math.random() < 0.3) {
                this.createThrustParticles();
            }
        } else {
            // Apply friction when close to target
            this.ship.velocity.x *= 0.95;
            this.ship.velocity.y *= 0.95;
        }
        
        // Update position
        this.ship.x += this.ship.velocity.x;
        this.ship.y += this.ship.velocity.y;
        
        // Update camera target
        this.camera.targetX = this.ship.x;
        this.camera.targetY = this.ship.y;
    }
    
    // Add game objects
    addPlanet(x, y, radius, color) {
        this.planets.push({ x, y, radius, color });
    }
    
    addStation(x, y) {
        this.stations.push({ x, y, rotation: 0 });
    }
    
    addAsteroid(x, y, radius) {
        this.asteroids.push({
            x, y, radius,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.02
        });
    }
    
    renderEnemies() {
        // Remove enemies marked for removal
        this.enemies = this.enemies.filter(enemy => !enemy.toRemove);
        
        this.enemies.forEach(enemy => {
            // Update enemy AI
            this.updateEnemyAI(enemy);
            
            this.ctx.save();
            this.ctx.translate(enemy.x, enemy.y);
            this.ctx.rotate(enemy.angle);
            
            // Draw enemy based on type
            switch(enemy.type) {
                case 'pirate':
                    this.drawPirateShip(enemy);
                    break;
                case 'alien':
                    this.drawAlienShip(enemy);
                    break;
                case 'rogue_ai':
                    this.drawRogueAIShip(enemy);
                    break;
                default:
                    this.drawGenericEnemy(enemy);
            }
            
            // Draw health bar
            if (enemy.showHealthBar) {
                this.ctx.restore();
                this.ctx.save();
                this.ctx.translate(enemy.x, enemy.y - 40);
                this.drawHealthBar(enemy.hp, enemy.maxHp, 40, 6);
            }
            
            this.ctx.restore();
        });
    }
    
    renderMerchants() {
        // Remove merchants marked for removal
        this.merchants = this.merchants.filter(merchant => !merchant.toRemove);
        
        this.merchants.forEach(merchant => {
            // Update merchant movement
            if (merchant.docking) {
                this.updateMerchantDocking(merchant);
            } else {
                this.updateMerchantMovement(merchant);
            }
            
            this.ctx.save();
            this.ctx.translate(merchant.x, merchant.y);
            this.ctx.rotate(merchant.angle);
            
            // Draw merchant ship
            this.drawMerchantShip(merchant);
            
            this.ctx.restore();
            
            // Draw trade indicator
            if (merchant.showTradeIndicator) {
                this.ctx.save();
                this.ctx.translate(merchant.x, merchant.y - 35);
                this.ctx.fillStyle = '#FFD700';
                this.ctx.font = '20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('💰', 0, 0);
                this.ctx.restore();
            }
        });
    }
    
    renderProjectiles() {
        this.projectiles = this.projectiles.filter(projectile => {
            // Update position
            projectile.x += projectile.vx;
            projectile.y += projectile.vy;
            projectile.life--;
            
            if (projectile.life <= 0) return false;
            
            // Draw projectile based on type
            this.ctx.save();
            
            switch(projectile.type) {
                case 'laser':
                    // Laser beam effect
                    const gradient = this.ctx.createLinearGradient(
                        projectile.x - projectile.vx * 10,
                        projectile.y - projectile.vy * 10,
                        projectile.x,
                        projectile.y
                    );
                    gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
                    gradient.addColorStop(1, projectile.color || 'rgba(255, 0, 0, 0.8)');
                    
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(projectile.x - projectile.vx * 10, projectile.y - projectile.vy * 10);
                    this.ctx.lineTo(projectile.x, projectile.y);
                    this.ctx.stroke();
                    break;
                    
                case 'plasma':
                    // Plasma bolt
                    const plasmaGlow = this.ctx.createRadialGradient(
                        projectile.x, projectile.y, 0,
                        projectile.x, projectile.y, 8
                    );
                    plasmaGlow.addColorStop(0, projectile.color || 'rgba(0, 255, 255, 0.8)');
                    plasmaGlow.addColorStop(1, 'rgba(0, 255, 255, 0)');
                    
                    this.ctx.fillStyle = plasmaGlow;
                    this.ctx.beginPath();
                    this.ctx.arc(projectile.x, projectile.y, 8, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
                    
                default:
                    // Generic projectile
                    this.ctx.fillStyle = projectile.color || '#FFFF00';
                    this.ctx.beginPath();
                    this.ctx.arc(projectile.x, projectile.y, 3, 0, Math.PI * 2);
                    this.ctx.fill();
            }
            
            this.ctx.restore();
            return true;
        });
    }
    
    renderDamageNumbers() {
        this.damageNumbers = this.damageNumbers.filter(dmg => {
            dmg.y -= dmg.vy;
            dmg.vy *= 0.95;
            dmg.life--;
            
            if (dmg.life <= 0) return false;
            
            const alpha = dmg.life / dmg.maxLife;
            
            // Convert world coordinates to screen coordinates
            const screenX = (dmg.x - this.camera.x) * this.camera.zoom + this.width / 2;
            const screenY = (dmg.y - this.camera.y) * this.camera.zoom + this.height / 2;
            
            this.ctx.save();
            this.ctx.font = `bold ${20 * this.camera.zoom}px Orbitron`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Shadow for readability
            this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
            this.ctx.fillText(dmg.text, screenX + 2, screenY + 2);
            
            // Damage text
            this.ctx.fillStyle = dmg.color || `rgba(255, 100, 100, ${alpha})`;
            this.ctx.fillText(dmg.text, screenX, screenY);
            
            this.ctx.restore();
            return true;
        });
    }
    
    renderVisualEvents() {
        this.visualEvents = this.visualEvents.filter(event => {
            event.duration--;
            
            if (event.duration <= 0) return false;
            
            switch(event.type) {
                case 'warning':
                    // Flashing warning indicator
                    if (Math.floor(event.duration / 10) % 2 === 0) {
                        this.ctx.save();
                        this.ctx.translate(event.x, event.y);
                        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
                        this.ctx.font = 'bold 30px Arial';
                        this.ctx.textAlign = 'center';
                        this.ctx.fillText('⚠️', 0, 0);
                        this.ctx.restore();
                    }
                    break;
                    
                case 'trade':
                    // Trade completed indicator
                    this.ctx.save();
                    this.ctx.translate(event.x, event.y - event.duration);
                    this.ctx.globalAlpha = event.duration / event.maxDuration;
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.font = '24px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('💰 +' + event.value, 0, 0);
                    this.ctx.restore();
                    break;
                    
                case 'salvage':
                    // Salvage indicator
                    this.ctx.save();
                    this.ctx.translate(event.x, event.y);
                    this.ctx.rotate(event.duration * 0.05);
                    this.ctx.fillStyle = '#FFA500';
                    this.ctx.font = '20px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('🔧', 0, 0);
                    this.ctx.restore();
                    break;
            }
            
            return true;
        });
    }
    
    renderWrecks() {
        this.wrecks.forEach(wreck => {
            wreck.rotation += 0.01;
            
            this.ctx.save();
            this.ctx.translate(wreck.x, wreck.y);
            this.ctx.rotate(wreck.rotation);
            
            // Wreck body - damaged version of original ship
            this.ctx.fillStyle = '#3E3E3E';
            this.ctx.strokeStyle = '#666666';
            this.ctx.lineWidth = 2;
            
            // Draw broken ship pieces
            this.ctx.beginPath();
            this.ctx.moveTo(10, 0);
            this.ctx.lineTo(-5, -8);
            this.ctx.lineTo(-10, -5);
            this.ctx.lineTo(-8, 5);
            this.ctx.lineTo(5, 8);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            // Salvageable indicator
            if (wreck.salvageable) {
                const pulseAlpha = 0.5 + Math.sin(Date.now() * 0.003) * 0.3;
                this.ctx.strokeStyle = `rgba(255, 200, 0, ${pulseAlpha})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        });
    }
    
    renderCargoContainers() {
        this.cargoContainers.forEach(container => {
            this.ctx.save();
            this.ctx.translate(container.x, container.y);
            
            // Container glow
            const glowRadius = 15 + Math.sin(Date.now() * 0.002) * 3;
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
            gradient.addColorStop(0, 'rgba(255, 200, 0, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Container body
            this.ctx.fillStyle = '#8B6914';
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 2;
            this.ctx.fillRect(-8, -8, 16, 16);
            this.ctx.strokeRect(-8, -8, 16, 16);
            
            // Loot indicator
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('📦', 0, 0);
            
            this.ctx.restore();
        });
    }
    
    renderTargetLocks() {
        // Render target lock on enemies
        if (this.ship.targetLocked) {
            const target = this.enemies.find(e => e.id === this.ship.targetLocked);
            if (target) {
                this.ctx.save();
                this.ctx.translate(target.x, target.y);
                
                // Target lock brackets
                const lockSize = 40;
                const cornerLength = 10;
                this.ctx.strokeStyle = '#FF0000';
                this.ctx.lineWidth = 2;
                
                // Top-left corner
                this.ctx.beginPath();
                this.ctx.moveTo(-lockSize/2, -lockSize/2 + cornerLength);
                this.ctx.lineTo(-lockSize/2, -lockSize/2);
                this.ctx.lineTo(-lockSize/2 + cornerLength, -lockSize/2);
                this.ctx.stroke();
                
                // Top-right corner
                this.ctx.beginPath();
                this.ctx.moveTo(lockSize/2 - cornerLength, -lockSize/2);
                this.ctx.lineTo(lockSize/2, -lockSize/2);
                this.ctx.lineTo(lockSize/2, -lockSize/2 + cornerLength);
                this.ctx.stroke();
                
                // Bottom-left corner
                this.ctx.beginPath();
                this.ctx.moveTo(-lockSize/2, lockSize/2 - cornerLength);
                this.ctx.lineTo(-lockSize/2, lockSize/2);
                this.ctx.lineTo(-lockSize/2 + cornerLength, lockSize/2);
                this.ctx.stroke();
                
                // Bottom-right corner
                this.ctx.beginPath();
                this.ctx.moveTo(lockSize/2 - cornerLength, lockSize/2);
                this.ctx.lineTo(lockSize/2, lockSize/2);
                this.ctx.lineTo(lockSize/2, lockSize/2 - cornerLength);
                this.ctx.stroke();
                
                // Range indicator
                const distance = Math.sqrt(
                    Math.pow(target.x - this.ship.x, 2) + 
                    Math.pow(target.y - this.ship.y, 2)
                );
                this.ctx.font = '10px Orbitron';
                this.ctx.fillStyle = '#FF0000';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`${Math.round(distance)}m`, 0, lockSize/2 + 15);
                
                this.ctx.restore();
            }
        }
        
        // Render locking progress
        if (this.ship.lockingTarget) {
            const target = this.enemies.find(e => e.id === this.ship.lockingTarget);
            if (target) {
                this.ctx.save();
                this.ctx.translate(target.x, target.y);
                
                // Locking animation
                const lockProgress = this.ship.lockProgress;
                const lockRadius = 30;
                
                this.ctx.strokeStyle = `rgba(255, 255, 0, ${0.5 + lockProgress * 0.5})`;
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                this.ctx.beginPath();
                this.ctx.arc(0, 0, lockRadius, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * lockProgress));
                this.ctx.stroke();
                this.ctx.setLineDash([]);
                
                // Lock percentage
                this.ctx.font = '12px Orbitron';
                this.ctx.fillStyle = '#FFFF00';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`${Math.round(lockProgress * 100)}%`, 0, 0);
                
                this.ctx.restore();
            }
        }
    }
    
    renderTractorBeams() {
        this.tractorBeams.forEach(beam => {
            beam.progress += 0.02;
            if (beam.progress > 1) beam.progress = 0;
            
            // Draw tractor beam
            const gradient = this.ctx.createLinearGradient(
                beam.sourceX, beam.sourceY,
                beam.targetX, beam.targetY
            );
            gradient.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
            gradient.addColorStop(beam.progress, 'rgba(0, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0.2)');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([10, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(beam.sourceX, beam.sourceY);
            this.ctx.lineTo(beam.targetX, beam.targetY);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // Tractor beam particles
            const dx = beam.targetX - beam.sourceX;
            const dy = beam.targetY - beam.sourceY;
            const particleX = beam.sourceX + dx * beam.progress;
            const particleY = beam.sourceY + dy * beam.progress;
            
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(particleX, particleY, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    renderShieldBubble() {
        const shieldPercent = this.ship.shield / this.ship.maxShield;
        if (shieldPercent <= 0) return;
        
        const time = Date.now() * 0.001;
        const shieldRadius = 40;
        
        // Shield hit effect
        let hitAlpha = 0;
        if (this.ship.lastHitTime && Date.now() - this.ship.lastHitTime < 500) {
            hitAlpha = (500 - (Date.now() - this.ship.lastHitTime)) / 500;
        }
        
        // Shield bubble
        const shieldAlpha = 0.1 + shieldPercent * 0.2 + hitAlpha * 0.3;
        let shieldColor;
        if (shieldPercent > 0.5) {
            shieldColor = `rgba(0, 200, 255, ${shieldAlpha})`;
        } else if (shieldPercent > 0.25) {
            shieldColor = `rgba(255, 255, 0, ${shieldAlpha})`;
        } else {
            shieldColor = `rgba(255, 100, 0, ${shieldAlpha})`;
        }
        
        // Hexagonal shield pattern
        this.ctx.save();
        this.ctx.strokeStyle = shieldColor;
        this.ctx.lineWidth = 2 + hitAlpha * 3;
        
        for (let ring = 0; ring < 3; ring++) {
            const ringRadius = shieldRadius * (0.8 + ring * 0.1);
            const hexAlpha = shieldAlpha * (1 - ring * 0.3);
            this.ctx.strokeStyle = shieldColor.replace(shieldAlpha.toString(), hexAlpha.toString());
            
            this.ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + time * 0.5;
                const x = Math.cos(angle) * ringRadius;
                const y = Math.sin(angle) * ringRadius;
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            this.ctx.stroke();
        }
        
        // Shield shimmer effect
        if (shieldPercent > 0) {
            const shimmerAngle = time * 2;
            const shimmerX = Math.cos(shimmerAngle) * shieldRadius;
            const shimmerY = Math.sin(shimmerAngle) * shieldRadius;
            
            const shimmerGradient = this.ctx.createRadialGradient(
                shimmerX, shimmerY, 0,
                shimmerX, shimmerY, 10
            );
            shimmerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            shimmerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = shimmerGradient;
            this.ctx.beginPath();
            this.ctx.arc(shimmerX, shimmerY, 10, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    renderArmorDamage() {
        // Armor breach marks
        const armorPercent = this.ship.armor / this.ship.maxArmor;
        const numBreaches = Math.floor((1 - armorPercent) * 5);
        
        for (let i = 0; i < numBreaches; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const x = Math.cos(angle) * 15;
            const y = Math.sin(angle) * 15;
            
            // Scorch marks
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Damage lines
            this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.8)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x - 3, y - 3);
            this.ctx.lineTo(x + 3, y + 3);
            this.ctx.moveTo(x + 3, y - 3);
            this.ctx.lineTo(x - 3, y + 3);
            this.ctx.stroke();
        }
    }
    
    renderHullBreach() {
        // Hull breach effects - sparks and venting
        const hullPercent = this.ship.hull / this.ship.maxHull;
        const breachSeverity = 1 - hullPercent;
        
        if (Math.random() < breachSeverity) {
            // Create spark
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 20;
            const sparkX = Math.cos(angle) * distance;
            const sparkY = Math.sin(angle) * distance;
            
            this.particles.push({
                x: this.ship.x + sparkX,
                y: this.ship.y + sparkY,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                size: 1,
                life: 20,
                maxLife: 20,
                color: '255, 200, 0'
            });
        }
        
        // Venting atmosphere
        if (Math.random() < breachSeverity * 0.5) {
            const ventAngle = Math.random() * Math.PI * 2;
            const ventX = Math.cos(ventAngle) * 15;
            const ventY = Math.sin(ventAngle) * 15;
            
            for (let i = 0; i < 5; i++) {
                this.particles.push({
                    x: this.ship.x + ventX,
                    y: this.ship.y + ventY,
                    vx: Math.cos(ventAngle) * (2 + Math.random() * 2),
                    vy: Math.sin(ventAngle) * (2 + Math.random() * 2),
                    size: Math.random() * 3 + 1,
                    life: 30,
                    maxLife: 30,
                    color: '200, 200, 200'
                });
            }
        }
    }
    
    renderWarpEffect() {
        if (!this.warpEffect.active) return;
        
        const progress = (Date.now() - this.warpEffect.startTime) / this.warpEffect.duration;
        if (progress >= 1) {
            this.warpEffect.active = false;
            return;
        }
        
        this.warpEffect.progress = progress;
        
        // Warp tunnel effect
        this.ctx.save();
        this.ctx.translate(this.width / 2, this.height / 2);
        
        // Create warp lines
        const numLines = 50;
        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const startRadius = progress * 50;
            const endRadius = Math.max(this.width, this.height);
            
            const gradient = this.ctx.createLinearGradient(
                Math.cos(angle) * startRadius,
                Math.sin(angle) * startRadius,
                Math.cos(angle) * endRadius,
                Math.sin(angle) * endRadius
            );
            gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
            gradient.addColorStop(0.5, `rgba(0, 255, 255, ${0.8 - progress * 0.5})`);
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2 + progress * 3;
            this.ctx.beginPath();
            this.ctx.moveTo(Math.cos(angle) * startRadius, Math.sin(angle) * startRadius);
            this.ctx.lineTo(Math.cos(angle) * endRadius, Math.sin(angle) * endRadius);
            this.ctx.stroke();
        }
        
        // Warp flash
        if (progress < 0.3) {
            const flashAlpha = (0.3 - progress) / 0.3;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.5})`;
            this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        }
        
        this.ctx.restore();
    }
    
    renderCapacitorUI() {
        const capPercent = this.ship.capacitor / this.ship.maxCapacitor;
        
        // Capacitor bar position
        const barX = 20;
        const barY = this.height - 60;
        const barWidth = 200;
        const barHeight = 20;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Capacitor fill
        const gradient = this.ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
        if (capPercent > 0.5) {
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(1, '#FFA500');
        } else if (capPercent > 0.25) {
            gradient.addColorStop(0, '#FFA500');
            gradient.addColorStop(1, '#FF6347');
        } else {
            gradient.addColorStop(0, '#FF6347');
            gradient.addColorStop(1, '#DC143C');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(barX, barY, barWidth * capPercent, barHeight);
        
        // Border
        this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Capacitor text
        this.ctx.font = '12px Orbitron';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `Capacitor: ${Math.round(capPercent * 100)}%`,
            barX + barWidth / 2,
            barY - 5
        );
        
        // Recharge rate indicator
        if (capPercent < 1) {
            const rechargeX = barX + barWidth * capPercent;
            this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(rechargeX, barY);
            this.ctx.lineTo(rechargeX, barY + barHeight);
            this.ctx.stroke();
        }
    }
    
    renderShipStatusUI() {
        // Ship status bars (Shield/Armor/Hull)
        const startX = this.width - 220;
        const startY = this.height - 100;
        const barWidth = 180;
        const barHeight = 15;
        const barSpacing = 20;
        
        const statuses = [
            { label: 'Shield', value: this.ship.shield, max: this.ship.maxShield, color1: '#00FFFF', color2: '#0080FF' },
            { label: 'Armor', value: this.ship.armor, max: this.ship.maxArmor, color1: '#FFD700', color2: '#FF8C00' },
            { label: 'Hull', value: this.ship.hull, max: this.ship.maxHull, color1: '#DC143C', color2: '#8B0000' }
        ];
        
        statuses.forEach((status, index) => {
            const y = startY + index * barSpacing;
            const percent = status.value / status.max;
            
            // Background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(startX, y, barWidth, barHeight);
            
            // Status fill
            if (percent > 0) {
                const gradient = this.ctx.createLinearGradient(startX, y, startX + barWidth, y);
                gradient.addColorStop(0, status.color1);
                gradient.addColorStop(1, status.color2);
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(startX, y, barWidth * percent, barHeight);
            }
            
            // Damage flash
            if (status.label === 'Shield' && this.ship.lastShieldHit && Date.now() - this.ship.lastShieldHit < 300) {
                const flashAlpha = (300 - (Date.now() - this.ship.lastShieldHit)) / 300;
                this.ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.5})`;
                this.ctx.fillRect(startX, y, barWidth, barHeight);
            }
            
            // Border
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(startX, y, barWidth, barHeight);
            
            // Label
            this.ctx.font = '11px Orbitron';
            this.ctx.fillStyle = status.color1;
            this.ctx.textAlign = 'right';
            this.ctx.fillText(status.label, startX - 5, y + barHeight - 3);
            
            // Value
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                `${Math.round(status.value)}/${status.max}`,
                startX + barWidth / 2,
                y + barHeight - 3
            );
        });
    }
    
    // Enemy ship drawing methods
    drawPirateShip(enemy) {
        const size = enemy.size || 25;
        
        // Main body - aggressive angular design
        this.ctx.fillStyle = enemy.damaged ? '#8B0000' : '#DC143C';
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(size, 0);
        this.ctx.lineTo(size * 0.3, -size * 0.8);
        this.ctx.lineTo(-size * 0.5, -size * 0.6);
        this.ctx.lineTo(-size * 0.8, -size * 0.2);
        this.ctx.lineTo(-size * 0.8, size * 0.2);
        this.ctx.lineTo(-size * 0.5, size * 0.6);
        this.ctx.lineTo(size * 0.3, size * 0.8);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Spikes
        this.ctx.fillStyle = '#8B0000';
        for (let i = 0; i < 3; i++) {
            const angle = (i - 1) * 0.5;
            this.ctx.save();
            this.ctx.rotate(angle);
            this.ctx.beginPath();
            this.ctx.moveTo(size, 0);
            this.ctx.lineTo(size * 1.3, -size * 0.1);
            this.ctx.lineTo(size * 1.3, size * 0.1);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
        }
        
        // Engine glow
        const engineGlow = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        this.ctx.fillStyle = `rgba(255, 100, 0, ${engineGlow})`;
        this.ctx.beginPath();
        this.ctx.arc(-size * 0.7, 0, size * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawAlienShip(enemy) {
        const size = enemy.size || 25;
        const time = Date.now() * 0.001;
        
        // Organic, curved design
        this.ctx.fillStyle = enemy.damaged ? '#2F4F2F' : '#32CD32';
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.lineWidth = 2;
        
        // Main body with curves
        this.ctx.beginPath();
        this.ctx.moveTo(size * 0.8, 0);
        this.ctx.quadraticCurveTo(size * 0.6, -size * 0.6, 0, -size * 0.8);
        this.ctx.quadraticCurveTo(-size * 0.6, -size * 0.6, -size * 0.8, 0);
        this.ctx.quadraticCurveTo(-size * 0.6, size * 0.6, 0, size * 0.8);
        this.ctx.quadraticCurveTo(size * 0.6, size * 0.6, size * 0.8, 0);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Bio-luminescent spots
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + time;
            const x = Math.cos(angle) * size * 0.5;
            const y = Math.sin(angle) * size * 0.5;
            const glowSize = 3 + Math.sin(time * 3 + i) * 1;
            
            this.ctx.fillStyle = `rgba(0, 255, 0, ${0.6 + Math.sin(time * 2 + i) * 0.2})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, glowSize, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Central eye
        this.ctx.fillStyle = '#9400D3';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawRogueAIShip(enemy) {
        const size = enemy.size || 25;
        const time = Date.now() * 0.001;
        
        // Geometric, high-tech design
        this.ctx.fillStyle = enemy.damaged ? '#191970' : '#0000CD';
        this.ctx.strokeStyle = '#00FFFF';
        this.ctx.lineWidth = 2;
        
        // Hexagonal main body
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Energy core
        const coreGlow = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.4);
        coreGlow.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        coreGlow.addColorStop(1, 'rgba(0, 100, 255, 0.2)');
        this.ctx.fillStyle = coreGlow;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Rotating energy rings
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            this.ctx.save();
            this.ctx.rotate(time * (i + 1) * 0.5);
            this.ctx.beginPath();
            this.ctx.arc(0, 0, size * (0.6 + i * 0.2), 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        }
    }
    
    drawGenericEnemy(enemy) {
        const size = enemy.size || 20;
        
        // Simple triangle enemy
        this.ctx.fillStyle = enemy.damaged ? '#8B4513' : '#FF6347';
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(size, 0);
        this.ctx.lineTo(-size * 0.7, -size * 0.7);
        this.ctx.lineTo(-size * 0.5, 0);
        this.ctx.lineTo(-size * 0.7, size * 0.7);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }
    
    drawMerchantShip(merchant) {
        const size = merchant.size || 30;
        
        // Bulky cargo design
        this.ctx.fillStyle = '#DAA520';
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        
        // Main cargo hold
        this.ctx.fillRect(-size * 0.8, -size * 0.6, size * 1.6, size * 1.2);
        this.ctx.strokeRect(-size * 0.8, -size * 0.6, size * 1.6, size * 1.2);
        
        // Cockpit
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.moveTo(size * 0.8, 0);
        this.ctx.lineTo(size * 1.2, -size * 0.3);
        this.ctx.lineTo(size * 1.2, size * 0.3);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Cargo containers
        this.ctx.fillStyle = '#8B7355';
        for (let i = 0; i < 3; i++) {
            const y = (i - 1) * size * 0.4;
            this.ctx.fillRect(-size * 0.6, y - size * 0.15, size * 0.3, size * 0.3);
            this.ctx.fillRect(-size * 0.2, y - size * 0.15, size * 0.3, size * 0.3);
        }
        
        // Engine glow
        this.ctx.fillStyle = 'rgba(255, 200, 0, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(-size * 0.9, -size * 0.3, size * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(-size * 0.9, size * 0.3, size * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawHealthBar(hp, maxHp, width, height) {
        const percentage = Math.max(0, hp / maxHp);
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(-width/2, -height/2, width, height);
        
        // Health fill
        let healthColor;
        if (percentage > 0.6) {
            healthColor = '#00FF00';
        } else if (percentage > 0.3) {
            healthColor = '#FFFF00';
        } else {
            healthColor = '#FF0000';
        }
        
        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(-width/2, -height/2, width * percentage, height);
        
        // Border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(-width/2, -height/2, width, height);
    }
    
    // AI and movement methods
    updateEnemyAI(enemy) {
        if (!enemy.ai) return;
        
        switch(enemy.ai.state) {
            case 'approach':
                // Move towards player
                const dx = this.ship.x - enemy.x;
                const dy = this.ship.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > enemy.ai.attackRange) {
                    enemy.angle = Math.atan2(dy, dx);
                    enemy.x += Math.cos(enemy.angle) * enemy.speed;
                    enemy.y += Math.sin(enemy.angle) * enemy.speed;
                } else {
                    enemy.ai.state = 'attack';
                }
                break;
                
            case 'attack':
                // Face player and attack
                const adx = this.ship.x - enemy.x;
                const ady = this.ship.y - enemy.y;
                enemy.angle = Math.atan2(ady, adx);
                
                // Fire projectile
                if (!enemy.ai.cooldown || enemy.ai.cooldown <= 0) {
                    this.fireEnemyProjectile(enemy);
                    enemy.ai.cooldown = enemy.ai.attackCooldown || 60;
                }
                
                if (enemy.ai.cooldown > 0) {
                    enemy.ai.cooldown--;
                }
                break;
                
            case 'flee':
                // Move away from player
                const fdx = enemy.x - this.ship.x;
                const fdy = enemy.y - this.ship.y;
                enemy.angle = Math.atan2(fdy, fdx);
                enemy.x += Math.cos(enemy.angle) * enemy.speed * 1.5;
                enemy.y += Math.sin(enemy.angle) * enemy.speed * 1.5;
                break;
                
            case 'patrol':
                // Move in a pattern
                enemy.ai.patrolAngle = (enemy.ai.patrolAngle || 0) + 0.02;
                enemy.x = enemy.ai.centerX + Math.cos(enemy.ai.patrolAngle) * enemy.ai.patrolRadius;
                enemy.y = enemy.ai.centerY + Math.sin(enemy.ai.patrolAngle) * enemy.ai.patrolRadius;
                enemy.angle = enemy.ai.patrolAngle + Math.PI / 2;
                break;
        }
        
        // Check if enemy is too far from ship (despawn)
        const despawnDx = this.ship.x - enemy.x;
        const despawnDy = this.ship.y - enemy.y;
        const despawnDistance = Math.sqrt(despawnDx * despawnDx + despawnDy * despawnDy);
        if (despawnDistance > 2000) {
            enemy.toRemove = true;
        }
    }
    
    updateMerchantMovement(merchant) {
        if (merchant.arriving) {
            // Approach from edge of screen
            const dx = merchant.targetX - merchant.x;
            const dy = merchant.targetY - merchant.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                merchant.angle = Math.atan2(dy, dx);
                merchant.x += Math.cos(merchant.angle) * merchant.speed;
                merchant.y += Math.sin(merchant.angle) * merchant.speed;
            } else {
                merchant.arriving = false;
                merchant.showTradeIndicator = true;
            }
        } else if (merchant.leaving) {
            // Leave towards edge of screen
            merchant.x += Math.cos(merchant.angle) * merchant.speed;
            merchant.y += Math.sin(merchant.angle) * merchant.speed;
            
            // Check if off screen
            const offScreenDistance = Math.max(
                Math.abs(merchant.x - this.ship.x),
                Math.abs(merchant.y - this.ship.y)
            );
            if (offScreenDistance > 1000) {
                merchant.toRemove = true;
            }
        }
    }
    
    updateMerchantDocking(merchant) {
        // Smooth docking animation
        const stationX = merchant.dockTarget.x;
        const stationY = merchant.dockTarget.y;
        const dx = stationX - merchant.x;
        const dy = stationY - merchant.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 50) {
            merchant.angle = Math.atan2(dy, dx);
            merchant.x += Math.cos(merchant.angle) * merchant.speed * 0.5;
            merchant.y += Math.sin(merchant.angle) * merchant.speed * 0.5;
        } else {
            // Orbit around station
            merchant.dockAngle = (merchant.dockAngle || 0) + 0.01;
            merchant.x = stationX + Math.cos(merchant.dockAngle) * 50;
            merchant.y = stationY + Math.sin(merchant.dockAngle) * 50;
            merchant.angle = merchant.dockAngle + Math.PI / 2;
        }
    }
    
    fireEnemyProjectile(enemy) {
        const projectileSpeed = 8;
        const dx = this.ship.x - enemy.x;
        const dy = this.ship.y - enemy.y;
        const angle = Math.atan2(dy, dx);
        
        let projectileType = 'laser';
        let projectileColor = '#FF0000';
        
        if (enemy.type === 'alien') {
            projectileType = 'plasma';
            projectileColor = '#00FF00';
        } else if (enemy.type === 'rogue_ai') {
            projectileType = 'plasma';
            projectileColor = '#00FFFF';
        }
        
        this.projectiles.push({
            x: enemy.x + Math.cos(angle) * 30,
            y: enemy.y + Math.sin(angle) * 30,
            vx: Math.cos(angle) * projectileSpeed,
            vy: Math.sin(angle) * projectileSpeed,
            type: projectileType,
            color: projectileColor,
            damage: enemy.damage || 10,
            life: 60,
            owner: 'enemy'
        });
        
        // Muzzle flash
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: enemy.x + Math.cos(angle) * 30,
                y: enemy.y + Math.sin(angle) * 30,
                vx: Math.cos(angle + (Math.random() - 0.5) * 0.5) * 3,
                vy: Math.sin(angle + (Math.random() - 0.5) * 0.5) * 3,
                size: 2,
                life: 10,
                maxLife: 10,
                color: projectileType === 'plasma' ? '0, 255, 255' : '255, 100, 0'
            });
        }
    }
    
    // Visual event methods
    spawnEnemy(type, x, y, combatState) {
        const enemy = {
            x: x || this.ship.x + (Math.random() - 0.5) * 600,
            y: y || this.ship.y + (Math.random() - 0.5) * 600,
            angle: 0,
            type: type,
            hp: combatState?.enemy_hp || 100,
            maxHp: combatState?.enemy_max_hp || 100,
            speed: 2,
            size: 25,
            showHealthBar: true,
            damaged: false,
            ai: {
                state: 'approach',
                attackRange: 200,
                attackCooldown: 60,
                cooldown: 0
            }
        };
        
        // Customize based on enemy type
        if (type === 'pirate') {
            enemy.speed = 3;
            enemy.ai.attackRange = 250;
        } else if (type === 'alien') {
            enemy.speed = 2.5;
            enemy.ai.attackCooldown = 45;
        } else if (type === 'rogue_ai') {
            enemy.speed = 4;
            enemy.ai.attackCooldown = 30;
            enemy.ai.attackRange = 300;
        }
        
        // Warp in effect
        this.createWarpInEffect(enemy.x, enemy.y);
        
        this.enemies.push(enemy);
        return enemy;
    }
    
    spawnMerchant(targetX, targetY) {
        // Spawn from edge of visible area
        const angle = Math.random() * Math.PI * 2;
        const distance = 800;
        
        const merchant = {
            x: this.ship.x + Math.cos(angle) * distance,
            y: this.ship.y + Math.sin(angle) * distance,
            targetX: targetX || this.ship.x,
            targetY: targetY || this.ship.y,
            angle: 0,
            speed: 1.5,
            size: 30,
            arriving: true,
            showTradeIndicator: false
        };
        
        this.merchants.push(merchant);
        return merchant;
    }
    
    createDamageNumber(x, y, damage, color) {
        this.damageNumbers.push({
            x: x,
            y: y,
            text: `-${damage}`,
            color: color || 'rgba(255, 100, 100, 1)',
            vy: 2,
            life: 60,
            maxLife: 60
        });
    }
    
    createVisualEvent(type, x, y, data = {}) {
        const event = {
            type: type,
            x: x,
            y: y,
            duration: data.duration || 60,
            maxDuration: data.duration || 60,
            ...data
        };
        
        this.visualEvents.push(event);
        return event;
    }
    
    createWarpInEffect(x, y) {
        // Create warp-in particles
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const speed = 5 + Math.random() * 5;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3,
                life: 30,
                maxLife: 30,
                color: '100, 200, 255'
            });
        }
        
        // Flash effect
        this.screenFlash = {
            intensity: 0.3,
            color: 'rgba(100, 200, 255, 0.3)',
            duration: 10
        };
    }
    
    firePlayerProjectile(targetX, targetY) {
        const dx = targetX - this.ship.x;
        const dy = targetY - this.ship.y;
        const angle = Math.atan2(dy, dx);
        const projectileSpeed = 10;
        
        this.projectiles.push({
            x: this.ship.x + Math.cos(angle) * 30,
            y: this.ship.y + Math.sin(angle) * 30,
            vx: Math.cos(angle) * projectileSpeed,
            vy: Math.sin(angle) * projectileSpeed,
            type: 'laser',
            color: '#00FF00',
            damage: 25,
            life: 60,
            owner: 'player'
        });
        
        // Muzzle flash
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.ship.x + Math.cos(angle) * 30,
                y: this.ship.y + Math.sin(angle) * 30,
                vx: Math.cos(angle + (Math.random() - 0.5) * 0.5) * 3,
                vy: Math.sin(angle + (Math.random() - 0.5) * 0.5) * 3,
                size: 2,
                life: 10,
                maxLife: 10,
                color: '0, 255, 0'
            });
        }
    }
    
    // Cleanup methods
    clearCombatEntities() {
        this.enemies = [];
        this.projectiles = [];
        this.damageNumbers = [];
    }
    
    clearTradeEntities() {
        this.merchants = [];
    }
    
    updateEnemyHealth(hp, maxHp) {
        // Update the first enemy's health (assuming single combat)
        if (this.enemies.length > 0) {
            const enemy = this.enemies[0];
            const oldHp = enemy.hp;
            enemy.hp = hp;
            enemy.maxHp = maxHp;
            
            // Show damage if health decreased
            if (hp < oldHp) {
                const damage = oldHp - hp;
                this.createDamageNumber(enemy.x, enemy.y, damage, 'rgba(255, 200, 100, 1)');
                enemy.damaged = true;
                setTimeout(() => { enemy.damaged = false; }, 500);
                
                // Flash effect on enemy
                for (let i = 0; i < 10; i++) {
                    this.particles.push({
                        x: enemy.x + (Math.random() - 0.5) * 40,
                        y: enemy.y + (Math.random() - 0.5) * 40,
                        vx: (Math.random() - 0.5) * 5,
                        vy: (Math.random() - 0.5) * 5,
                        size: 3,
                        life: 20,
                        maxLife: 20,
                        color: '255, 100, 0'
                    });
                }
            }
            
            // Destroy enemy if hp <= 0
            if (hp <= 0) {
                this.createExplosion(enemy.x, enemy.y);
                enemy.toRemove = true;
            }
        }
    }
    
    updateRegionTheme(region) {
        // Only update if region has changed
        if (this.currentRegion === region.id) return;
        
        this.currentRegion = region.id;
        const config = region.config;
        
        if (config && config.background) {
            // Smoothly transition to new theme
            this.regionTheme = {
                primaryColor: config.background.primary_color || '#4169E1',
                secondaryColor: config.background.secondary_color || '#87CEEB',
                starDensity: config.background.star_density || 1.0,
                nebulaOpacity: config.background.nebula_opacity || 0.5,
                ambientBrightness: config.background.ambient_brightness || 0.5,
                particleEffects: config.background.particle_effects || []
            };
            
            // Regenerate background elements with new theme
            this.generateStars();
            this.generateNebulae();
            
            // Start region-specific particle effects
            this.startRegionParticleEffects();
            
            // Trigger music change
            if (window.audioManager && config.music_theme) {
                window.audioManager.changeRegionMusic(config.music_theme);
            }
            
            // Show region transition notification
            if (window.uiManager) {
                window.uiManager.showNotification(`Entering ${region.name}`, 'info', 3000);
            }
        }
    }
    
    startRegionParticleEffects() {
        // Clear any existing region particle emitters
        if (this.regionParticleEmitters) {
            this.regionParticleEmitters.forEach(emitter => clearInterval(emitter));
        }
        this.regionParticleEmitters = [];
        
        // Create particle effects based on region type
        const effects = this.regionTheme.particleEffects;
        
        effects.forEach(effect => {
            switch(effect) {
                case 'trade_ships':
                    // Occasional trading ships passing by
                    const tradeEmitter = setInterval(() => {
                        if (Math.random() < 0.3) {
                            const startX = Math.random() < 0.5 ? -100 : this.width + 100;
                            const startY = Math.random() * this.height;
                            const targetX = startX < 0 ? this.width + 100 : -100;
                            const targetY = Math.random() * this.height;
                            
                            this.createTradeShipEffect(startX, startY, targetX, targetY);
                        }
                    }, 3000);
                    this.regionParticleEmitters.push(tradeEmitter);
                    break;
                    
                case 'station_lights':
                    // Blinking station lights
                    const lightEmitter = setInterval(() => {
                        const x = Math.random() * this.width;
                        const y = Math.random() * this.height;
                        this.createStationLightEffect(x, y);
                    }, 2000);
                    this.regionParticleEmitters.push(lightEmitter);
                    break;
                    
                case 'asteroids':
                    // Floating asteroids
                    const asteroidEmitter = setInterval(() => {
                        this.createAsteroidEffect();
                    }, 4000);
                    this.regionParticleEmitters.push(asteroidEmitter);
                    break;
                    
                case 'debris':
                    // Space debris
                    const debrisEmitter = setInterval(() => {
                        this.createDebrisEffect();
                    }, 1500);
                    this.regionParticleEmitters.push(debrisEmitter);
                    break;
                    
                case 'nebula_wisps':
                    // Nebula energy wisps
                    const wispEmitter = setInterval(() => {
                        this.createNebulaWispEffect();
                    }, 2000);
                    this.regionParticleEmitters.push(wispEmitter);
                    break;
                    
                case 'energy_storms':
                    // Energy storm flashes
                    const stormEmitter = setInterval(() => {
                        if (Math.random() < 0.2) {
                            this.createEnergyStormEffect();
                        }
                    }, 5000);
                    this.regionParticleEmitters.push(stormEmitter);
                    break;
                    
                case 'void_whispers':
                    // Mysterious void particles
                    const voidEmitter = setInterval(() => {
                        this.createVoidWhisperEffect();
                    }, 3000);
                    this.regionParticleEmitters.push(voidEmitter);
                    break;
                    
                case 'ancient_artifacts':
                    // Glowing ancient artifacts
                    const artifactEmitter = setInterval(() => {
                        this.createAncientArtifactEffect();
                    }, 6000);
                    this.regionParticleEmitters.push(artifactEmitter);
                    break;
                    
                case 'energy_fields':
                    // Energy field pulses
                    const fieldEmitter = setInterval(() => {
                        this.createEnergyFieldEffect();
                    }, 4000);
                    this.regionParticleEmitters.push(fieldEmitter);
                    break;
            }
        });
    }
    
    createTradeShipEffect(startX, startY, targetX, targetY) {
        const ship = {
            x: startX,
            y: startY,
            targetX: targetX,
            targetY: targetY,
            speed: 2,
            size: 15,
            trail: [],
            color: 'rgba(100, 200, 255, 0.8)'
        };
        
        const moveShip = () => {
            const dx = ship.targetX - ship.x;
            const dy = ship.targetY - ship.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                ship.x += (dx / distance) * ship.speed;
                ship.y += (dy / distance) * ship.speed;
                
                // Add to trail
                ship.trail.push({ x: ship.x, y: ship.y });
                if (ship.trail.length > 20) ship.trail.shift();
                
                // Create engine particles
                this.particles.push({
                    x: ship.x - (dx / distance) * 10,
                    y: ship.y - (dy / distance) * 10,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    life: 20,
                    maxLife: 20,
                    size: 2,
                    color: '100, 200, 255'
                });
                
                requestAnimationFrame(moveShip);
            }
        };
        
        // Add ship to temporary render list
        if (!this.tradeShips) this.tradeShips = [];
        this.tradeShips.push(ship);
        moveShip();
        
        // Remove after reaching destination
        setTimeout(() => {
            const index = this.tradeShips.indexOf(ship);
            if (index > -1) this.tradeShips.splice(index, 1);
        }, 30000);
    }
    
    createStationLightEffect(x, y) {
        // Blinking light effect
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.particles.push({
                    x: x,
                    y: y,
                    vx: 0,
                    vy: 0,
                    life: 10,
                    maxLife: 10,
                    size: 5 + Math.random() * 5,
                    color: '255, 255, 100'
                });
            }, i * 200);
        }
    }
    
    createAsteroidEffect() {
        const asteroid = {
            x: -50,
            y: Math.random() * this.height,
            vx: 0.5 + Math.random() * 0.5,
            vy: (Math.random() - 0.5) * 0.2,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            size: 20 + Math.random() * 30,
            life: 1000
        };
        
        if (!this.floatingAsteroids) this.floatingAsteroids = [];
        this.floatingAsteroids.push(asteroid);
        
        // Remove after time
        setTimeout(() => {
            const index = this.floatingAsteroids.indexOf(asteroid);
            if (index > -1) this.floatingAsteroids.splice(index, 1);
        }, 20000);
    }
    
    createDebrisEffect() {
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: -20,
                y: Math.random() * this.height,
                vx: 1 + Math.random() * 2,
                vy: (Math.random() - 0.5) * 0.5,
                life: 200,
                maxLife: 200,
                size: 1 + Math.random() * 2,
                color: '150, 150, 150'
            });
        }
    }
    
    createNebulaWispEffect() {
        const wisp = {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            phase: 0,
            radius: 50 + Math.random() * 50,
            speed: 0.01 + Math.random() * 0.02
        };
        
        const animateWisp = () => {
            wisp.phase += wisp.speed;
            
            // Create glowing particles in a spiral
            for (let i = 0; i < 3; i++) {
                const angle = wisp.phase + (i * Math.PI * 2 / 3);
                const r = wisp.radius * (0.5 + 0.5 * Math.sin(wisp.phase * 2));
                
                this.particles.push({
                    x: wisp.x + Math.cos(angle) * r,
                    y: wisp.y + Math.sin(angle) * r,
                    vx: 0,
                    vy: -0.5,
                    life: 30,
                    maxLife: 30,
                    size: 3,
                    color: '200, 100, 255'
                });
            }
            
            if (wisp.phase < Math.PI * 4) {
                requestAnimationFrame(animateWisp);
            }
        };
        
        animateWisp();
    }
    
    createEnergyStormEffect() {
        // Lightning-like effect
        const startX = Math.random() * this.width;
        const startY = 0;
        const endX = startX + (Math.random() - 0.5) * 200;
        const endY = this.height;
        
        // Create lightning path
        const segments = 20;
        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 50;
            const y = startY + (endY - startY) * t;
            
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 20,
                maxLife: 20,
                size: 5 + Math.random() * 5,
                color: '255, 100, 255'
            });
        }
        
        // Flash effect
        this.screenFlash = {
            intensity: 0.3,
            color: 'rgba(255, 100, 255, 0.3)',
            duration: 10
        };
    }
    
    createVoidWhisperEffect() {
        // Dark, mysterious particles
        const centerX = Math.random() * this.width;
        const centerY = Math.random() * this.height;
        
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 30 + Math.random() * 20;
            
            this.particles.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                vx: -Math.cos(angle) * 0.5,
                vy: -Math.sin(angle) * 0.5,
                life: 60,
                maxLife: 60,
                size: 2,
                color: '50, 0, 100'
            });
        }
    }
    
    createAncientArtifactEffect() {
        // Glowing artifact
        const artifact = {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            glowPhase: 0,
            size: 20
        };
        
        const glowArtifact = () => {
            artifact.glowPhase += 0.05;
            const glowSize = artifact.size + Math.sin(artifact.glowPhase) * 10;
            
            // Create glow particles
            this.particles.push({
                x: artifact.x,
                y: artifact.y,
                vx: 0,
                vy: 0,
                life: 10,
                maxLife: 10,
                size: glowSize,
                color: '255, 215, 0'
            });
            
            if (artifact.glowPhase < Math.PI * 4) {
                requestAnimationFrame(glowArtifact);
            }
        };
        
        glowArtifact();
    }
    
    createEnergyFieldEffect() {
        // Expanding energy ring
        const x = Math.random() * this.width;
        const y = Math.random() * this.height;
        let radius = 0;
        
        const expandRing = () => {
            radius += 3;
            
            // Create ring particles
            const particles = 30;
            for (let i = 0; i < particles; i++) {
                const angle = (i / particles) * Math.PI * 2;
                
                this.particles.push({
                    x: x + Math.cos(angle) * radius,
                    y: y + Math.sin(angle) * radius,
                    vx: Math.cos(angle) * 0.5,
                    vy: Math.sin(angle) * 0.5,
                    life: 20,
                    maxLife: 20,
                    size: 2,
                    color: '100, 255, 200'
                });
            }
            
            if (radius < 150) {
                requestAnimationFrame(expandRing);
            }
        };
        
        expandRing();
    }
    
    drawShipByType(shipType, shipColor) {
        this.ctx.fillStyle = shipColor;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;
        
        switch(shipType) {
            case 'scout':
                // Small, sleek triangle
                this.ctx.beginPath();
                this.ctx.moveTo(18, 0);
                this.ctx.lineTo(-12, -10);
                this.ctx.lineTo(-8, 0);
                this.ctx.lineTo(-12, 10);
                this.ctx.closePath();
                break;
                
            case 'trader':
                // Bulky cargo ship
                this.ctx.beginPath();
                this.ctx.moveTo(15, 0);
                this.ctx.lineTo(10, -15);
                this.ctx.lineTo(-15, -15);
                this.ctx.lineTo(-20, -8);
                this.ctx.lineTo(-20, 8);
                this.ctx.lineTo(-15, 15);
                this.ctx.lineTo(10, 15);
                this.ctx.closePath();
                break;
                
            case 'combat':
                // Angular fighter
                this.ctx.beginPath();
                this.ctx.moveTo(25, 0);
                this.ctx.lineTo(15, -8);
                this.ctx.lineTo(0, -12);
                this.ctx.lineTo(-10, -8);
                this.ctx.lineTo(-15, 0);
                this.ctx.lineTo(-10, 8);
                this.ctx.lineTo(0, 12);
                this.ctx.lineTo(15, 8);
                this.ctx.closePath();
                break;
                
            case 'explorer':
                // Advanced design
                this.ctx.beginPath();
                this.ctx.moveTo(22, 0);
                this.ctx.lineTo(12, -10);
                this.ctx.lineTo(0, -15);
                this.ctx.lineTo(-10, -10);
                this.ctx.lineTo(-12, 0);
                this.ctx.lineTo(-10, 10);
                this.ctx.lineTo(0, 15);
                this.ctx.lineTo(12, 10);
                this.ctx.closePath();
                // Add secondary wings
                this.ctx.moveTo(5, -8);
                this.ctx.lineTo(-5, -18);
                this.ctx.lineTo(-8, -8);
                this.ctx.moveTo(5, 8);
                this.ctx.lineTo(-5, 18);
                this.ctx.lineTo(-8, 8);
                break;
                
            default:
                // Default triangle
                this.ctx.beginPath();
                this.ctx.moveTo(20, 0);
                this.ctx.lineTo(-15, -12);
                this.ctx.lineTo(-10, 0);
                this.ctx.lineTo(-15, 12);
                this.ctx.closePath();
        }
        
        this.ctx.fill();
        this.ctx.stroke();
        
        // Engine glow (varies by ship type)
        const engineGlow = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        const enginePositions = {
            'scout': [{x: -10, y: 0, size: 5}],
            'trader': [{x: -18, y: -8, size: 4}, {x: -18, y: 8, size: 4}],
            'combat': [{x: -12, y: -4, size: 3}, {x: -12, y: 4, size: 3}, {x: -12, y: 0, size: 3}],
            'explorer': [{x: -10, y: 0, size: 6}, {x: -8, y: -8, size: 3}, {x: -8, y: 8, size: 3}]
        };
        
        const engines = enginePositions[shipType] || enginePositions['scout'];
        engines.forEach(engine => {
            this.ctx.fillStyle = `rgba(0, 255, 255, ${engineGlow})`;
            this.ctx.beginPath();
            this.ctx.arc(engine.x, engine.y, engine.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    renderShipModIndicators() {
        if (!this.ship.shipMods) return;
        
        const modIndicators = {
            // High slot mods - displayed at front
            'laser_cannon': { x: 15, y: -5, color: '#FF0000', size: 3 },
            'missile_launcher': { x: 15, y: 5, color: '#FFA500', size: 3 },
            'mining_laser': { x: 12, y: 0, color: '#FFFF00', size: 3 },
            'salvager': { x: 18, y: 0, color: '#00FF00', size: 3 },
            
            // Mid slot mods - displayed on sides
            'shield_booster': { x: 0, y: -15, color: '#00FFFF', size: 4 },
            'scanner_upgrade': { x: 0, y: 15, color: '#FF00FF', size: 4 },
            'targeting_computer': { x: 5, y: -12, color: '#FF69B4', size: 3 },
            'afterburner': { x: -15, y: 0, color: '#FF4500', size: 5 },
            
            // Low slot mods - displayed at rear
            'armor_plates': { x: -10, y: -8, color: '#8B4513', size: 3 },
            'cargo_expander': { x: -10, y: 8, color: '#4B0082', size: 3 },
            'fuel_optimizer': { x: -15, y: -5, color: '#32CD32', size: 3 },
            'repair_drones': { x: -15, y: 5, color: '#FFD700', size: 3 }
        };
        
        // Draw mod indicators
        Object.values(this.ship.shipMods).forEach(modList => {
            modList.forEach(modId => {
                const indicator = modIndicators[modId];
                if (indicator) {
                    // Glow effect
                    const glowSize = indicator.size + Math.sin(Date.now() * 0.005) * 1;
                    this.ctx.fillStyle = indicator.color + '40'; // 40 = 25% opacity
                    this.ctx.beginPath();
                    this.ctx.arc(indicator.x, indicator.y, glowSize + 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Main indicator
                    this.ctx.fillStyle = indicator.color;
                    this.ctx.beginPath();
                    this.ctx.arc(indicator.x, indicator.y, indicator.size, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Inner bright spot
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.beginPath();
                    this.ctx.arc(indicator.x, indicator.y, indicator.size * 0.3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });
        });
        
        // Rig modifications create an energy field around the ship
        if (this.ship.shipMods.rig && this.ship.shipMods.rig.length > 0) {
            const time = Date.now() * 0.001;
            const rigAlpha = 0.1 + Math.sin(time * 2) * 0.05;
            
            this.ctx.strokeStyle = `rgba(255, 215, 0, ${rigAlpha})`;
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, 35, 25, 0, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }
}

// Export for use in other modules
window.Renderer = Renderer;
