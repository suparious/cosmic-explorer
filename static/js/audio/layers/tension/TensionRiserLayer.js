// Tension riser layer - creates building tension sounds

import { BaseLayer } from '../BaseLayer.js';

export class TensionRiserLayer extends BaseLayer {
    static get TYPE() {
        return 'tension_riser';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.riserTimeout = null;
    }
    
    createNodes() {
        // Schedule first riser with random delay
        const initialDelay = Math.random() * 10000;
        this.riserTimeout = setTimeout(() => this.createRiser(), initialDelay);
    }
    
    createRiser() {
        if (!this.isPlaying) return;
        
        const osc = this.context.createOscillator();
        osc.type = 'sawtooth';
        
        // Filter for sweep
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.setValueAtTime(10, this.context.currentTime);
        
        const now = this.context.currentTime;
        const duration = 8;
        
        // Frequency rise
        osc.frequency.setValueAtTime(55, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + duration);
        
        // Filter sweep
        filter.frequency.setValueAtTime(100, now);
        filter.frequency.exponentialRampToValueAtTime(5000, now + duration);
        
        // Volume envelope
        const envelope = this.context.createGain();
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(this.config.gain, now + duration * 0.8);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        // Add subtle tremolo for tension
        const tremolo = this.context.createOscillator();
        const tremoloGain = this.context.createGain();
        tremolo.frequency.setValueAtTime(0.5, now);
        tremolo.frequency.exponentialRampToValueAtTime(10, now + duration);
        tremoloGain.gain.setValueAtTime(0.1, now);
        
        tremolo.connect(tremoloGain);
        tremoloGain.connect(envelope.gain);
        
        // Connect audio path
        osc.connect(filter);
        filter.connect(envelope);
        envelope.connect(this.gainNode);
        
        // Start and stop
        osc.start(now);
        tremolo.start(now);
        osc.stop(now + duration);
        tremolo.stop(now + duration);
        
        // Schedule next riser
        const delay = duration * 1000 + 5000;
        this.riserTimeout = setTimeout(() => this.createRiser(), delay);
    }
    
    stop(fadeTime = 2) {
        if (this.riserTimeout) {
            clearTimeout(this.riserTimeout);
        }
        super.stop(fadeTime);
    }
}
