// System beep layer - creates computer system beep sounds

import { BaseLayer } from '../BaseLayer.js';

export class SystemBeepLayer extends BaseLayer {
    static get TYPE() {
        return 'system_beep';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.freqIndex = 0;
        this.beepTimeout = null;
    }
    
    createNodes() {
        // Start beeping pattern
        this.beep();
    }
    
    beep() {
        if (!this.isPlaying) return;
        
        // Get current frequency from array
        const freq = this.config.frequencies[this.freqIndex % this.config.frequencies.length];
        
        // Create oscillator
        const osc = this.context.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, this.context.currentTime);
        
        // Short envelope for beep
        const envelope = this.context.createGain();
        const now = this.context.currentTime;
        envelope.gain.setValueAtTime(0.1, now);
        envelope.gain.setValueAtTime(0, now + 0.05);
        
        // Add slight filter for less harsh sound
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 2, now);
        
        // Connect audio path
        osc.connect(filter);
        filter.connect(envelope);
        envelope.connect(this.gainNode);
        
        // Play beep
        osc.start(now);
        osc.stop(now + 0.05);
        
        // Update frequency index
        this.freqIndex++;
        
        // Schedule next beep with some randomization
        const delay = 500 + Math.random() * 2000;
        this.beepTimeout = setTimeout(() => this.beep(), delay);
    }
    
    stop(fadeTime = 2) {
        if (this.beepTimeout) {
            clearTimeout(this.beepTimeout);
        }
        super.stop(fadeTime);
    }
}
