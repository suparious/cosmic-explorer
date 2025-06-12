// Explosion rumble layer - creates deep explosion rumble effects

import { BaseLayer } from '../BaseLayer.js';
import { createFilteredNoise } from '../../utils/audioHelpers.js';

export class ExplosionRumbleLayer extends BaseLayer {
    static get TYPE() {
        return 'explosion_rumble';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.rumbleTimeouts = [];
    }
    
    createNodes() {
        // Schedule first rumble with random delay
        const initialDelay = Math.random() * 5000;
        const timeout = setTimeout(() => this.createRumble(), initialDelay);
        this.rumbleTimeouts.push(timeout);
    }
    
    createRumble() {
        if (!this.isPlaying) return;
        
        const now = this.context.currentTime;
        
        // Low-frequency filtered noise
        const noise = createFilteredNoise(this.context, 'lowpass', 60, 2);
        const noiseEnvelope = this.context.createGain();
        
        // Explosion envelope
        noiseEnvelope.gain.setValueAtTime(0.3, now);
        noiseEnvelope.gain.exponentialRampToValueAtTime(0.001, now + 4);
        
        // Sub frequency oscillator for deep rumble
        const sub = this.context.createOscillator();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(30 + Math.random() * 20, now);
        
        // Sub envelope
        const subEnv = this.context.createGain();
        subEnv.gain.setValueAtTime(0.4, now);
        subEnv.gain.exponentialRampToValueAtTime(0.001, now + 4);
        
        // Add slight pitch modulation to sub
        const pitchLfo = this.context.createOscillator();
        const pitchLfoGain = this.context.createGain();
        pitchLfo.frequency.setValueAtTime(0.5, now);
        pitchLfoGain.gain.setValueAtTime(5, now);
        
        pitchLfo.connect(pitchLfoGain);
        pitchLfoGain.connect(sub.frequency);
        
        // Connect audio paths
        noise.connect(noiseEnvelope);
        noiseEnvelope.connect(this.gainNode);
        
        sub.connect(subEnv);
        subEnv.connect(this.gainNode);
        
        // Start and stop
        sub.start(now);
        pitchLfo.start(now);
        sub.stop(now + 4);
        pitchLfo.stop(now + 4);
        
        setTimeout(() => {
            if (noise.sourceNode && noise.sourceNode.stop) {
                noise.sourceNode.stop();
            }
        }, 4000);
        
        // Schedule next rumble
        const delay = 10000 + Math.random() * 10000;
        const timeout = setTimeout(() => this.createRumble(), delay);
        this.rumbleTimeouts.push(timeout);
    }
    
    stop(fadeTime = 2) {
        this.rumbleTimeouts.forEach(timeout => clearTimeout(timeout));
        this.rumbleTimeouts = [];
        super.stop(fadeTime);
    }
}
