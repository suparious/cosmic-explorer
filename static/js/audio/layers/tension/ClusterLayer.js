// Cluster layer - creates dissonant note clusters

import { BaseLayer } from '../BaseLayer.js';

export class ClusterLayer extends BaseLayer {
    static get TYPE() {
        return 'cluster';
    }
    
    createNodes() {
        // Create multiple oscillators in a tight cluster
        for (let i = 0; i < 5; i++) {
            const osc = this.context.createOscillator();
            osc.type = 'sawtooth';
            
            // Spread frequencies around the base frequency
            const freq = this.config.baseFreq + (Math.random() - 0.5) * this.config.spread;
            osc.frequency.setValueAtTime(freq, this.context.currentTime);
            
            // Individual gain for each oscillator
            const gain = this.context.createGain();
            gain.gain.setValueAtTime(0.2 / 5, this.context.currentTime); // Divide by number of oscillators
            
            // Add slight vibrato to each for movement
            const vibrato = this.context.createOscillator();
            const vibratoGain = this.context.createGain();
            vibrato.frequency.setValueAtTime(3 + Math.random() * 2, this.context.currentTime);
            vibratoGain.gain.setValueAtTime(freq * 0.005, this.context.currentTime);
            
            vibrato.connect(vibratoGain);
            vibratoGain.connect(osc.frequency);
            
            // Connect audio path
            osc.connect(gain);
            gain.connect(this.gainNode);
            
            // Start oscillators
            osc.start();
            vibrato.start();
            
            this.registerNode(osc);
            this.registerNode(vibrato);
        }
    }
}
