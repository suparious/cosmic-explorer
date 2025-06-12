// Chime layer - creates bell-like chiming sounds

import { BaseLayer } from '../BaseLayer.js';

export class ChimeLayer extends BaseLayer {
    static get TYPE() {
        return 'chime';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.chimeTimeouts = [];
    }
    
    createNodes() {
        // Schedule chimes for each frequency
        this.config.frequencies.forEach((freq, i) => {
            this.scheduleChime(freq, i);
        });
    }
    
    scheduleChime(frequency, index) {
        const playChime = () => {
            if (!this.isPlaying) return;
            
            const osc = this.context.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(frequency, this.context.currentTime);
            
            // Add harmonics for bell-like quality
            const harmonic2 = this.context.createOscillator();
            harmonic2.type = 'sine';
            harmonic2.frequency.setValueAtTime(frequency * 2.4, this.context.currentTime);
            
            const harmonic3 = this.context.createOscillator();
            harmonic3.type = 'sine';
            harmonic3.frequency.setValueAtTime(frequency * 5.2, this.context.currentTime);
            
            // Envelopes for each harmonic
            const envelope1 = this.context.createGain();
            const envelope2 = this.context.createGain();
            const envelope3 = this.context.createGain();
            
            const now = this.context.currentTime;
            
            // Main tone envelope
            envelope1.gain.setValueAtTime(0, now);
            envelope1.gain.linearRampToValueAtTime(0.3, now + 0.01);
            envelope1.gain.exponentialRampToValueAtTime(0.001, now + 3);
            
            // Harmonic envelopes (decay faster)
            envelope2.gain.setValueAtTime(0, now);
            envelope2.gain.linearRampToValueAtTime(0.1, now + 0.01);
            envelope2.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
            
            envelope3.gain.setValueAtTime(0, now);
            envelope3.gain.linearRampToValueAtTime(0.05, now + 0.01);
            envelope3.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            
            // Connect audio paths
            osc.connect(envelope1);
            harmonic2.connect(envelope2);
            harmonic3.connect(envelope3);
            
            envelope1.connect(this.gainNode);
            envelope2.connect(this.gainNode);
            envelope3.connect(this.gainNode);
            
            // Start and stop oscillators
            osc.start(now);
            harmonic2.start(now);
            harmonic3.start(now);
            
            osc.stop(now + 3);
            harmonic2.stop(now + 1.5);
            harmonic3.stop(now + 0.8);
            
            // Schedule next chime with randomization
            const delay = (10 + Math.random() * 20) * 1000;
            const timeout = setTimeout(() => playChime(), delay);
            this.chimeTimeouts.push(timeout);
        };
        
        // Start each chime at different times
        const initialDelay = index * 3000 + Math.random() * 5000;
        const timeout = setTimeout(playChime, initialDelay);
        this.chimeTimeouts.push(timeout);
    }
    
    stop(fadeTime = 2) {
        // Clear all chime timeouts
        this.chimeTimeouts.forEach(timeout => clearTimeout(timeout));
        this.chimeTimeouts = [];
        super.stop(fadeTime);
    }
}
