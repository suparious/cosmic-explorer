// Sub bass layer - creates deep, low-frequency foundation

import { BaseLayer } from '../BaseLayer.js';

export class SubBassLayer extends BaseLayer {
    static get TYPE() {
        return 'sub';
    }
    
    createNodes() {
        // Main sub oscillator
        const osc = this.context.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(this.config.frequency, this.context.currentTime);
        
        // Subtle pitch bend for movement
        const pitchLfo = this.context.createOscillator();
        const pitchLfoGain = this.context.createGain();
        pitchLfo.frequency.setValueAtTime(0.03, this.context.currentTime);
        pitchLfoGain.gain.setValueAtTime(this.config.frequency * 0.005, this.context.currentTime);
        
        // Connect LFO to frequency
        pitchLfo.connect(pitchLfoGain);
        pitchLfoGain.connect(osc.frequency);
        
        // Connect to output
        osc.connect(this.gainNode);
        
        // Start oscillators
        osc.start();
        pitchLfo.start();
        
        // Register nodes
        this.registerNode(osc);
        this.registerNode(pitchLfo);
    }
}
