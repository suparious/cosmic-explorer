// Whisper layer - creates ethereal whisper-like sounds

import { BaseLayer } from '../BaseLayer.js';
import { createFilteredNoise } from '../../utils/audioHelpers.js';

export class WhisperLayer extends BaseLayer {
    static get TYPE() {
        return 'whisper';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.whisperTimeouts = [];
    }
    
    createNodes() {
        // Create whispers for each frequency
        this.config.frequencies.forEach((freq, i) => {
            this.scheduleWhisper(freq, i);
        });
    }
    
    scheduleWhisper(frequency, index) {
        const whisper = () => {
            if (!this.isPlaying) return;
            
            // Create filtered noise for whisper effect
            const noise = createFilteredNoise(this.context, 'bandpass', frequency, 50);
            
            // Envelope for whisper shape
            const envelope = this.context.createGain();
            const now = this.context.currentTime;
            
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(0.05, now + 1);
            envelope.gain.linearRampToValueAtTime(0, now + 3);
            
            // Connect audio path
            noise.connect(envelope);
            envelope.connect(this.gainNode);
            
            // Stop noise after envelope completes
            setTimeout(() => {
                if (noise.sourceNode && noise.sourceNode.stop) {
                    noise.sourceNode.stop();
                }
            }, 3000);
            
            // Schedule next whisper
            const delay = 5000 + Math.random() * 5000;
            const timeout = setTimeout(() => whisper(), delay);
            this.whisperTimeouts.push(timeout);
        };
        
        // Start at different times for each frequency
        const initialDelay = index * 2000;
        const timeout = setTimeout(whisper, initialDelay);
        this.whisperTimeouts.push(timeout);
    }
    
    stop(fadeTime = 2) {
        this.whisperTimeouts.forEach(timeout => clearTimeout(timeout));
        this.whisperTimeouts = [];
        super.stop(fadeTime);
    }
}
