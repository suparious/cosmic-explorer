// Breath layer - creates breathing sound effects

import { BaseLayer } from '../BaseLayer.js';
import { createFilteredNoise } from '../../utils/audioHelpers.js';

export class BreathLayer extends BaseLayer {
    static get TYPE() {
        return 'breath';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.breathTimeout = null;
    }
    
    createNodes() {
        // Start breathing cycle
        this.breathe();
    }
    
    breathe() {
        if (!this.isPlaying) return;
        
        // Create noise for breath sound
        const noise = createFilteredNoise(this.context, 'lowpass', 500, 2);
        
        // Envelope for breath shape
        const envelope = this.context.createGain();
        const now = this.context.currentTime;
        
        // Inhale phase
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(0.1, now + 2);
        // Exhale phase
        envelope.gain.linearRampToValueAtTime(0, now + 4);
        
        // Add slight pitch modulation
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, now);
        filter.frequency.linearRampToValueAtTime(700, now + 2);
        filter.frequency.linearRampToValueAtTime(500, now + 4);
        
        // Connect audio path
        noise.connect(filter);
        filter.connect(envelope);
        envelope.connect(this.gainNode);
        
        // Stop noise after breath completes
        setTimeout(() => {
            if (noise.sourceNode && noise.sourceNode.stop) {
                noise.sourceNode.stop();
            }
        }, 4000);
        
        // Schedule next breath
        this.breathTimeout = setTimeout(() => this.breathe(), 5000);
    }
    
    stop(fadeTime = 2) {
        if (this.breathTimeout) {
            clearTimeout(this.breathTimeout);
        }
        super.stop(fadeTime);
    }
}
