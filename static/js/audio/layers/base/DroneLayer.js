// Drone layer - creates sustained tones with subtle modulation

import { BaseLayer } from '../BaseLayer.js';

export class DroneLayer extends BaseLayer {
    static get TYPE() {
        return 'drone';
    }
    
    createNodes() {
        // Main oscillator
        const osc = this.context.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(this.config.frequency, this.context.currentTime);
        
        if (this.config.detune) {
            osc.detune.setValueAtTime(this.config.detune, this.context.currentTime);
        }
        
        // Add subtle frequency modulation
        const lfo = this.context.createOscillator();
        const lfoGain = this.context.createGain();
        lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.05, this.context.currentTime);
        lfoGain.gain.setValueAtTime(this.config.frequency * 0.01, this.context.currentTime);
        
        // Connect LFO
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        // Connect main oscillator
        osc.connect(this.gainNode);
        
        // Start oscillators
        osc.start();
        lfo.start();
        
        // Register nodes for cleanup
        this.registerNode(osc);
        this.registerNode(lfo);
    }
}
