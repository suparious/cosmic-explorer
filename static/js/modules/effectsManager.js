// Effects Manager Module for Cosmic Explorer
// Handles all visual and audio effects based on game events

class EffectsManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.renderer = null;
        this.audioManager = null;
        this.particleSystem = null;
    }
    
    init(renderer, audioManager, particleSystem) {
        this.renderer = renderer;
        this.audioManager = audioManager;
        this.particleSystem = particleSystem;
    }
    
    handleEventEffects(event) {
        switch (event.type) {
            case 'navigation':
                this.audioManager.playSound('navigate');
                this.renderer.createThrustParticles();
                break;
                
            case 'scan':
                this.audioManager.playSound('scan');
                this.renderer.startScanEffect();
                break;
                
            case 'repair':
                this.audioManager.playSound('repair');
                this.createHealingEffect();
                break;
                
            case 'danger':
                this.audioManager.playAlertSound();
                this.shakeScreen();
                // Center camera on ship during danger
                this.renderer.centerCameraOn(this.renderer.ship.x, this.renderer.ship.y);
                break;
                
            case 'success':
                this.audioManager.playSound('success');
                this.createSuccessEffect();
                break;
                
            case 'explosion':
                this.audioManager.playExplosionSound();
                this.renderer.createExplosion(this.renderer.ship.x, this.renderer.ship.y);
                // Center camera on explosion
                this.renderer.centerCameraOn(this.renderer.ship.x, this.renderer.ship.y);
                break;
                
            case 'heal':
                this.audioManager.playSound('success');
                this.createHealingEffect();
                this.animateHealthBar();
                break;
                
            case 'pod_activated':
                this.audioManager.playAlertSound();
                this.createPodEjectionEffect();
                this.gameEngine.uiManager.showNotification('ESCAPE POD ACTIVATED!', 'warning');
                // Center camera on pod ejection
                this.renderer.centerCameraOn(this.renderer.ship.x, this.renderer.ship.y);
                break;
                
            case 'purchase':
                this.audioManager.playSound('success');
                this.refreshAugmentationsModal();
                break;
                
            case 'combat_start':
                this.audioManager.playAlertSound();
                // Center camera on combat
                this.renderer.centerCameraOn(this.renderer.ship.x, this.renderer.ship.y);
                break;
                
            case 'damage':
            case 'critical_damage':
                this.audioManager.playAlertSound();
                this.shakeScreen();
                // Center camera on damage event
                this.renderer.centerCameraOn(this.renderer.ship.x, this.renderer.ship.y);
                break;
        }
    }
    
    createWarpEffect() {
        const ship = this.renderer.ship;
        const emitter = this.particleSystem.createEmitter({
            x: ship.x,
            y: ship.y,
            rate: 100,
            lifetime: 1000,
            particleLife: 30,
            particleSize: 2,
            particleColor: '255, 255, 255',
            particleSpeed: 10,
            particleSpread: 0.3
        });
        
        // Update emitter position with ship
        const updateEmitter = setInterval(() => {
            emitter.x = this.renderer.ship.x;
            emitter.y = this.renderer.ship.y;
        }, 16);
        
        setTimeout(() => {
            clearInterval(updateEmitter);
            this.particleSystem.removeEmitter(emitter);
        }, 1000);
    }
    
    createHealingEffect() {
        const ship = this.renderer.ship;
        this.particleSystem.emit(ship.x, ship.y, 20, {
            ...ParticleEffects.healing,
            direction: -Math.PI / 2
        });
    }
    
    createSuccessEffect() {
        const ship = this.renderer.ship;
        this.particleSystem.emit(ship.x, ship.y, 30, ParticleEffects.sparkle);
    }
    
    createPodEjectionEffect() {
        const ship = this.renderer.ship;
        
        // Create explosion effect at ship location
        this.renderer.createExplosion(ship.x, ship.y);
        
        // Create ejection particles
        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 * i) / 50;
            const speed = 5 + Math.random() * 10;
            const particle = {
                x: ship.x,
                y: ship.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 60,
                maxLife: 60,
                size: Math.random() * 3 + 1,
                color: '255, 200, 0'
            };
            this.renderer.particles.push(particle);
        }
        
        // Screen shake effect
        this.shakeScreen();
    }
    
    animateShipMovement(targetX, targetY) {
        const startX = this.renderer.ship.x;
        const startY = this.renderer.ship.y;
        const duration = 2000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            // Update ship position
            this.renderer.ship.x = startX + (targetX - startX) * easeProgress;
            this.renderer.ship.y = startY + (targetY - startY) * easeProgress;
            
            // Update camera to follow ship
            this.renderer.centerCameraOn(this.renderer.ship.x, this.renderer.ship.y);
            
            // Create thrust particles
            if (progress < 1 && Math.random() < 0.5) {
                this.renderer.createThrustParticles();
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    animatePodMovement(targetX, targetY) {
        const startX = this.renderer.ship.x;
        const startY = this.renderer.ship.y;
        const duration = 3000; // Slower than ship
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // More erratic movement for pod
            const wobble = Math.sin(elapsed * 0.01) * 5;
            const easeProgress = 1 - Math.pow(1 - progress, 2);
            
            // Update pod position
            this.renderer.ship.x = startX + (targetX - startX) * easeProgress + wobble;
            this.renderer.ship.y = startY + (targetY - startY) * easeProgress;
            
            // Update camera to follow pod
            this.renderer.centerCameraOn(this.renderer.ship.x, this.renderer.ship.y);
            
            // Create small thrust particles
            if (progress < 1 && Math.random() < 0.3) {
                const particle = {
                    x: this.renderer.ship.x,
                    y: this.renderer.ship.y,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 20,
                    maxLife: 20,
                    size: 1,
                    color: '255, 200, 0'
                };
                this.renderer.particles.push(particle);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    shakeScreen() {
        const canvas = this.renderer.canvas;
        const originalTransform = canvas.style.transform;
        let shakeIntensity = 10;
        
        const shake = () => {
            if (shakeIntensity <= 0) {
                canvas.style.transform = originalTransform;
                return;
            }
            
            const x = (Math.random() - 0.5) * shakeIntensity;
            const y = (Math.random() - 0.5) * shakeIntensity;
            canvas.style.transform = `translate(${x}px, ${y}px)`;
            
            shakeIntensity -= 0.5;
            requestAnimationFrame(shake);
        };
        
        shake();
    }
    
    animateHealthBar() {
        const healthBar = document.querySelector('.health-fill');
        if (healthBar) {
            healthBar.parentElement.classList.add('healing-effect');
            setTimeout(() => healthBar.parentElement.classList.remove('healing-effect'), 1000);
        }
    }
    
    refreshAugmentationsModal() {
        const modal = document.getElementById('choice-modal');
        const modalTitle = document.getElementById('choice-title');
        if (modal && modal.style.display !== 'none' && modalTitle && modalTitle.textContent === 'Pod Augmentations') {
            this.gameEngine.uiManager.showAugmentationsModal();
        }
    }
}

// Export for use in other modules
export default EffectsManager;
