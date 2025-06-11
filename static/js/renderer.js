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
        
        // Current region theme
        this.currentRegion = null;
        this.regionTheme = {
            primaryColor: '#4169E1',
            secondaryColor: '#87CEEB',
            starDensity: 1.0,
            nebulaOpacity: 0.5,
            ambientBrightness: 0.5
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
            podAugmentations: []
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
        this.renderShip();
        this.renderParticles();
        
        // Restore context
        this.ctx.restore();
        
        // Render UI elements (not affected by camera)
        this.renderScanEffect();
        this.renderScreenFlash();
        this.renderDamageOverlay(gameState);
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
        
        // Render trail
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
        
        // Check if in pod mode
        if (this.ship.inPodMode) {
            this.renderPod();
            return;
        }
        
        // Render ship
        this.ctx.save();
        this.ctx.translate(this.ship.x, this.ship.y);
        this.ctx.rotate(this.ship.angle);
        
        // Ship color based on condition
        let shipColor = GameConfig.colors.ship.healthy;
        if (this.ship.condition < 30) {
            shipColor = GameConfig.colors.ship.critical;
        } else if (this.ship.condition < 70) {
            shipColor = GameConfig.colors.ship.damaged;
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
