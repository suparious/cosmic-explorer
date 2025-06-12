// Siren layer - creates emergency siren sounds

import { BaseLayer } from '../BaseLayer.js';

export class SirenLayer extends BaseLayer {
    static get TYPE() {
        return 'siren';
    }
    
    createNodes() {
        // Main oscillator
        const osc = this.context.createOscillator();
        osc.type = 'sawtooth';
        
        // LFO for siren sweep
        const lfo = this.context.createOscillator();
        const lfoGain = this.context.createGain();
        
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.5, this.context.currentTime); // Slow sweep
        lfoGain.gain.setValueAtTime(this.config.frequency * 0.3, this.context.currentTime);
        
        // Connect LFO to frequency
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.frequency.setValueAtTime(this.config.frequency, this.context.currentTime);
        
        // Resonant filter for siren character
        const filter = this.context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(this.config.frequency, this.context.currentTime);
        filter.Q.setValueAtTime(10, this.context.currentTime);
        
        // Connect audio path
        osc.connect(filter);
        filter.connect(this.gainNode);
        
        // Start oscillators
        osc.start();
        lfo.start();
        
        this.registerNode(osc);
        this.registerNode(lfo);
    }
}
