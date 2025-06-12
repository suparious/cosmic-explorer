// Breathing layer - creates breathing rhythm sounds

import { BaseLayer } from '../BaseLayer.js';
import { createFilteredNoise } from '../../utils/audioHelpers.js';

export class BreathingLayer extends BaseLayer {
    static get TYPE() {
        return 'breathing';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.breathingTimeout = null;
    }
    
    createNodes() {
        // Start breathing cycle
        this.breathe();
    }
    
    breathe() {
        if (!this.isPlaying) return;
        
        // Create filtered noise for breath
        const noise = createFilteredNoise(this.context, 'lowpass', 400, 1);
        
        // Envelope for breathing pattern
        const envelope = this.context.createGain();
        const now = this.context.currentTime;
        
        // Inhale phase
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(0.15, now + 1.5);
        
        // Brief pause at peak
        envelope.gain.setValueAtTime(0.15, now + 1.8);
        
        // Exhale phase
        envelope.gain.linearRampToValueAtTime(0, now + 3.5);
        
        // Add pitch modulation filter
        const filter = this.context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(1, now);
        
        // Frequency changes during breath
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.linearRampToValueAtTime(500, now + 1.5);
        filter.frequency.linearRampToValueAtTime(300, now + 3.5);
        
        // Connect audio path
        noise.connect(filter);
        filter.connect(envelope);
        envelope.connect(this.gainNode);
        
        // Stop noise after breath completes
        setTimeout(() => {
            if (noise.sourceNode && noise.sourceNode.stop) {
                noise.sourceNode.stop();
            }
        }, 3500);
        
        // Schedule next breath
        this.breathingTimeout = setTimeout(() => this.breathe(), 4000);
    }
    
    stop(fadeTime = 2) {
        if (this.breathingTimeout) {
            clearTimeout(this.breathingTimeout);
        }
        super.stop(fadeTime);
    }
}
