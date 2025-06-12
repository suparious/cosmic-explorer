// Brass stab layer - creates punchy brass-like stabs

import { BaseLayer } from '../BaseLayer.js';

export class BrassStabLayer extends BaseLayer {
    static get TYPE() {
        return 'brass_stab';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.stabTimeout = null;
    }
    
    createNodes() {
        // Schedule first stab
        this.playStab();
    }
    
    playStab() {
        if (!this.isPlaying) return;
        
        const now = this.context.currentTime;
        
        // Create multiple oscillators for brass ensemble
        this.config.frequencies.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);
            
            // Filter for brass character
            const filter = this.context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.Q.setValueAtTime(5, now);
            
            // Filter envelope for "wah" effect
            filter.frequency.setValueAtTime(100, now);
            filter.frequency.linearRampToValueAtTime(2000, now + 0.05);
            filter.frequency.exponentialRampToValueAtTime(500, now + 0.3);
            
            // Amplitude envelope
            const envelope = this.context.createGain();
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(0.3, now + 0.02);
            envelope.gain.linearRampToValueAtTime(0.2, now + 0.1);
            envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            
            // Add slight vibrato
            const vibrato = this.context.createOscillator();
            const vibratoGain = this.context.createGain();
            vibrato.frequency.setValueAtTime(5, now);
            vibratoGain.gain.setValueAtTime(freq * 0.01, now);
            
            vibrato.connect(vibratoGain);
            vibratoGain.connect(osc.frequency);
            
            // Connect audio path
            osc.connect(filter);
            filter.connect(envelope);
            envelope.connect(this.gainNode);
            
            // Start and stop
            osc.start(now);
            vibrato.start(now);
            osc.stop(now + 0.3);
            vibrato.stop(now + 0.3);
        });
        
        // Schedule next stab
        const delay = 2000 + Math.random() * 2000;
        this.stabTimeout = setTimeout(() => this.playStab(), delay);
    }
    
    stop(fadeTime = 2) {
        if (this.stabTimeout) {
            clearTimeout(this.stabTimeout);
        }
        super.stop(fadeTime);
    }
}
