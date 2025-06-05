// Particle System for Cosmic Explorer
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.emitters = [];
    }
    
    createEmitter(config) {
        const emitter = {
            x: config.x || 0,
            y: config.y || 0,
            active: true,
            rate: config.rate || 10,
            lifetime: config.lifetime || Infinity,
            particleConfig: {
                life: config.particleLife || 60,
                size: config.particleSize || 2,
                color: config.particleColor || '255, 255, 255',
                speed: config.particleSpeed || 1,
                spread: config.particleSpread || Math.PI * 2,
                gravity: config.gravity || 0,
                fadeOut: config.fadeOut !== false
            },
            elapsed: 0,
            accumulator: 0
        };
        
        this.emitters.push(emitter);
        return emitter;
    }
    
    removeEmitter(emitter) {
        const index = this.emitters.indexOf(emitter);
        if (index > -1) {
            this.emitters.splice(index, 1);
        }
    }
    
    emit(x, y, count, config) {
        for (let i = 0; i < count; i++) {
            const angle = config.direction + (Math.random() - 0.5) * config.spread;
            const speed = config.speed * (0.5 + Math.random() * 0.5);
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: config.size * (0.5 + Math.random() * 0.5),
                life: config.life,
                maxLife: config.life,
                color: config.color,
                gravity: config.gravity || 0,
                fadeOut: config.fadeOut !== false
            });
        }
    }
    
    update(deltaTime) {
        // Update emitters
        this.emitters = this.emitters.filter(emitter => {
            if (!emitter.active) return false;
            
            emitter.elapsed += deltaTime;
            emitter.accumulator += deltaTime;
            
            // Check lifetime
            if (emitter.lifetime !== Infinity && emitter.elapsed >= emitter.lifetime) {
                return false;
            }
            
            // Emit particles
            const particlesToEmit = Math.floor(emitter.accumulator * emitter.rate / 1000);
            if (particlesToEmit > 0) {
                emitter.accumulator = 0;
                for (let i = 0; i < particlesToEmit; i++) {
                    const config = emitter.particleConfig;
                    const angle = Math.random() * config.spread;
                    const speed = config.speed * (0.5 + Math.random() * 0.5);
                    
                    this.particles.push({
                        x: emitter.x,
                        y: emitter.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        size: config.size * (0.5 + Math.random() * 0.5),
                        life: config.life,
                        maxLife: config.life,
                        color: config.color,
                        gravity: config.gravity,
                        fadeOut: config.fadeOut
                    });
                }
            }
            
            return true;
        });
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += particle.gravity;
            particle.life--;
            
            return particle.life > 0;
        });
    }
    
    render(ctx) {
        this.particles.forEach(particle => {
            const alpha = particle.fadeOut ? particle.life / particle.maxLife : 1;
            ctx.fillStyle = `rgba(${particle.color}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    clear() {
        this.particles = [];
        this.emitters = [];
    }
}

// Predefined particle effects
const ParticleEffects = {
    shipThrust: {
        rate: 30,
        particleLife: 30,
        particleSize: 3,
        particleColor: '0, 255, 255',
        particleSpeed: 3,
        particleSpread: 0.5,
        fadeOut: true
    },
    
    explosion: {
        rate: 0, // Burst effect
        particleLife: 60,
        particleSize: 4,
        particleColor: '255, 100, 0',
        particleSpeed: 5,
        particleSpread: Math.PI * 2,
        fadeOut: true
    },
    
    sparkle: {
        rate: 5,
        particleLife: 45,
        particleSize: 2,
        particleColor: '255, 255, 0',
        particleSpeed: 0.5,
        particleSpread: Math.PI * 2,
        fadeOut: true
    },
    
    damage: {
        rate: 20,
        particleLife: 40,
        particleSize: 2,
        particleColor: '255, 50, 0',
        particleSpeed: 2,
        particleSpread: Math.PI * 2,
        gravity: 0.1,
        fadeOut: true
    },
    
    healing: {
        rate: 15,
        particleLife: 50,
        particleSize: 3,
        particleColor: '0, 255, 0',
        particleSpeed: 1,
        particleSpread: Math.PI,
        gravity: -0.05,
        fadeOut: true
    },
    
    warpDrive: {
        rate: 50,
        particleLife: 20,
        particleSize: 1,
        particleColor: '255, 255, 255',
        particleSpeed: 10,
        particleSpread: 0.2,
        fadeOut: true
    }
};

// Export for use in other modules
window.ParticleSystem = ParticleSystem;
window.ParticleEffects = ParticleEffects;
