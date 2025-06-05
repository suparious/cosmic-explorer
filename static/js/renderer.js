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
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }
    
    generateStars() {
        const count = GameConfig.visuals.starCount;
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
        const colors = [
            ['rgba(255, 0, 255, 0.1)', 'rgba(0, 255, 255, 0.1)'],
            ['rgba(255, 255, 0, 0.1)', 'rgba(255, 0, 255, 0.1)'],
            ['rgba(0, 255, 255, 0.1)', 'rgba(0, 255, 0, 0.1)']
        ];
        
        for (let i = 0; i < GameConfig.visuals.nebulaCount; i++) {
            const colorPair = colors[i % colors.length];
            this.nebulae.push({
                x: Math.random() * this.width * 2,
                y: Math.random() * this.height * 2,
                radius: Math.random() * 300 + 200,
                colors: colorPair,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.001
            });
        }
    }
    
    updateCamera() {
        // Smooth camera follow
        const smoothing = 0.1;
        this.camera.x += (this.camera.targetX - this.camera.x) * smoothing;
        this.camera.y += (this.camera.targetY - this.camera.y) * smoothing;
        this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * smoothing;
    }
    
    render(gameState) {
        // Clear canvas
        this.ctx.fillStyle = GameConfig.colors.space.deep;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
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
        this.renderShip();
        this.renderParticles();
        
        // Restore context
        this.ctx.restore();
        
        // Render UI elements (not affected by camera)
        this.renderScanEffect();
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
        
        // Draw ship shape
        this.ctx.fillStyle = shipColor;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;
        
        // Simple triangle ship
        this.ctx.beginPath();
        this.ctx.moveTo(20, 0);
        this.ctx.lineTo(-15, -12);
        this.ctx.lineTo(-10, 0);
        this.ctx.lineTo(-15, 12);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Engine glow
        const engineGlow = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        this.ctx.fillStyle = `rgba(0, 255, 255, ${engineGlow})`;
        this.ctx.beginPath();
        this.ctx.arc(-10, 0, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
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
}

// Export for use in other modules
window.Renderer = Renderer;
