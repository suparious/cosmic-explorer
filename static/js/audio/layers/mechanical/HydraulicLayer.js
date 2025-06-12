// Hydraulic layer - creates hydraulic hiss and clunk sounds

import { BaseLayer } from '../BaseLayer.js';
import { createFilteredNoise } from '../../utils/audioHelpers.js';

export class HydraulicLayer extends BaseLayer {
    static get TYPE() {
        return 'hydraulic';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.hissTimeouts = [];
    }
    
    createNodes() {
        // Start hydraulic sound pattern
        this.scheduleHiss();
    }
    
    scheduleHiss() {
        const hiss = () => {
            if (!this.isPlaying) return;
            
            // Create hiss noise
            const noise = createFilteredNoise(this.context, 'highpass', 2000, 1);
            const noiseEnvelope = this.context.createGain();
            
            const now = this.context.currentTime;
            noiseEnvelope.gain.setValueAtTime(0, now);
            noiseEnvelope.gain.linearRampToValueAtTime(0.08, now + 0.1);
            noiseEnvelope.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            
            // Create clunk sound
            const clunk = this.context.createOscillator();
            clunk.type = 'sawtooth';
            clunk.frequency.setValueAtTime(80, now);
            clunk.frequency.exponentialRampToValueAtTime(40, now + 0.1);
            
            const clunkEnvelope = this.context.createGain();
            clunkEnvelope.gain.setValueAtTime(0.2, now);
            clunkEnvelope.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            
            // Add resonant filter to clunk
            const clunkFilter = this.context.createBiquadFilter();
            clunkFilter.type = 'bandpass';
            clunkFilter.frequency.setValueAtTime(60, now);
            clunkFilter.Q.setValueAtTime(5, now);
            
            // Connect audio paths
            noise.connect(noiseEnvelope);
            noiseEnvelope.connect(this.gainNode);
            
            clunk.connect(clunkFilter);
            clunkFilter.connect(clunkEnvelope);
            clunkEnvelope.connect(this.gainNode);
            
            // Start and stop
            clunk.start(now);
            clunk.stop(now + 0.1);
            
            setTimeout(() => {
                if (noise.sourceNode && noise.sourceNode.stop) {
                    noise.sourceNode.stop();
                }
            }, 500);
            
            // Schedule next hiss
            const delay = 3000 + Math.random() * 4000;
            const timeout = setTimeout(() => this.scheduleHiss(), delay);
            this.hissTimeouts.push(timeout);
        };
        
        hiss();
    }
    
    stop(fadeTime = 2) {
        // Clear all timeouts
        this.hissTimeouts.forEach(timeout => clearTimeout(timeout));
        this.hissTimeouts = [];
        super.stop(fadeTime);
    }
}
