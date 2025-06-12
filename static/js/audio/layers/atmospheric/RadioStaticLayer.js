// Radio static layer - creates radio interference static sounds

import { BaseLayer } from '../BaseLayer.js';
import { createFilteredNoise } from '../../utils/audioHelpers.js';

export class RadioStaticLayer extends BaseLayer {
    static get TYPE() {
        return 'radio_static';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.modulateTimeout = null;
    }
    
    createNodes() {
        // Create bandpass filtered noise for radio quality
        const noise = createFilteredNoise(this.context, 'bandpass', 2500, 5);
        
        // Amplitude modulation envelope
        this.envelope = this.context.createGain();
        this.envelope.gain.setValueAtTime(0, this.context.currentTime);
        
        // Additional high-pass filter for tinny radio sound
        const radioFilter = this.context.createBiquadFilter();
        radioFilter.type = 'highpass';
        radioFilter.frequency.setValueAtTime(500, this.context.currentTime);
        
        // Connect audio path
        noise.connect(radioFilter);
        radioFilter.connect(this.envelope);
        this.envelope.connect(this.gainNode);
        
        // Store noise reference
        this.noiseSource = noise;
        
        // Start modulation
        this.modulate();
    }
    
    modulate() {
        if (!this.isPlaying) return;
        
        // Random amplitude modulation for interference effect
        const now = this.context.currentTime;
        const targetGain = Math.random() * this.config.gain;
        
        this.envelope.gain.linearRampToValueAtTime(targetGain, now + 0.1);
        
        // Occasionally create bursts
        if (Math.random() < 0.1) {
            // Burst of static
            this.envelope.gain.setValueAtTime(this.config.gain * 0.8, now + 0.1);
            this.envelope.gain.linearRampToValueAtTime(targetGain, now + 0.2);
        }
        
        // Schedule next modulation
        const delay = 50 + Math.random() * 150;
        this.modulateTimeout = setTimeout(() => this.modulate(), delay);
    }
    
    stop(fadeTime = 2) {
        if (this.modulateTimeout) {
            clearTimeout(this.modulateTimeout);
        }
        
        // Stop noise source
        if (this.noiseSource && this.noiseSource.sourceNode && this.noiseSource.sourceNode.stop) {
            setTimeout(() => {
                this.noiseSource.sourceNode.stop();
            }, fadeTime * 1000);
        }
        
        super.stop(fadeTime);
    }
}
