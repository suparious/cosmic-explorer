// Pulse layer - creates rhythmic pulsing sounds for tension

import { BaseLayer } from '../BaseLayer.js';

export class PulseLayer extends BaseLayer {
    static get TYPE() {
        return 'pulse';
    }
    
    createNodes() {
        // Main oscillator
        const osc = this.context.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(this.config.frequency, this.context.currentTime);
        
        // Rhythmic gate for pulsing effect
        const gate = this.context.createGain();
        gate.gain.setValueAtTime(0, this.context.currentTime);
        
        // Start pulse pattern
        this.startPulse(gate);
        
        // Connect audio path
        osc.connect(gate);
        gate.connect(this.gainNode);
        
        // Start oscillator
        osc.start();
        
        // Register nodes
        this.registerNode(osc);
        
        // Store gate reference for pulse control
        this.gateNode = gate;
    }
    
    startPulse(gate) {
        const pulseRate = 2; // Hz
        
        const pulse = () => {
            if (!this.isPlaying) return;
            
            const now = this.context.currentTime;
            gate.gain.setValueAtTime(0, now);
            gate.gain.linearRampToValueAtTime(0.5, now + 0.05);
            gate.gain.linearRampToValueAtTime(0, now + 0.1);
            
            // Schedule next pulse
            this.pulseTimeout = setTimeout(pulse, 1000 / pulseRate);
        };
        
        pulse();
    }
    
    stop(fadeTime = 2) {
        // Clear timeout to prevent scheduling after stop
        if (this.pulseTimeout) {
            clearTimeout(this.pulseTimeout);
        }
        super.stop(fadeTime);
    }
    
    update(params) {
        // Could update pulse rate, pattern, etc.
        if (params.pulseRate && this.gateNode) {
            // Implementation for dynamic pulse rate changes
        }
    }
}
