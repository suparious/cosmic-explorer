// Harmonic layer - creates rich harmonic series for depth and warmth

import { BaseLayer } from '../BaseLayer.js';

export class HarmonicLayer extends BaseLayer {
    static get TYPE() {
        return 'harmonic';
    }
    
    createNodes() {
        // Create fundamental oscillator
        const fundamental = this.context.createOscillator();
        fundamental.type = 'sine';
        fundamental.frequency.setValueAtTime(this.config.baseFreq, this.context.currentTime);
        
        // Gain for fundamental
        const fundamentalGain = this.context.createGain();
        fundamentalGain.gain.setValueAtTime(0.5, this.context.currentTime);
        fundamental.connect(fundamentalGain);
        fundamentalGain.connect(this.gainNode);
        
        // Add harmonics
        this.config.harmonics.forEach((harmonic, i) => {
            if (i === 0) return; // Skip fundamental (already created)
            
            const osc = this.context.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(
                this.config.baseFreq * harmonic, 
                this.context.currentTime
            );
            
            // Decreasing amplitude for higher harmonics
            const gain = this.context.createGain();
            gain.gain.setValueAtTime(0.3 / harmonic, this.context.currentTime);
            
            osc.connect(gain);
            gain.connect(this.gainNode);
            
            osc.start();
            this.registerNode(osc);
        });
        
        // Start fundamental
        fundamental.start();
        this.registerNode(fundamental);
    }
    
    update(params) {
        // Could update harmonic intensities based on chord changes
        if (params.chordIndex !== undefined) {
            // Future enhancement: adjust harmonic balance
        }
    }
}
