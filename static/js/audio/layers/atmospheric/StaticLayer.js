// Static layer - creates white noise static sounds

import { BaseLayer } from '../BaseLayer.js';
import { createFilteredNoise } from '../../utils/audioHelpers.js';

export class StaticLayer extends BaseLayer {
    static get TYPE() {
        return 'static';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.fluctuateTimeout = null;
    }
    
    createNodes() {
        // Create filtered white noise
        const noise = createFilteredNoise(this.context, 'bandpass', 2000, 1);
        
        // Dynamic gain for fluctuations
        this.staticGain = this.context.createGain();
        this.staticGain.gain.setValueAtTime(this.config.gain, this.context.currentTime);
        
        // Connect audio path
        noise.connect(this.staticGain);
        this.staticGain.connect(this.gainNode);
        
        // Store noise reference
        this.noiseSource = noise;
        
        // Start fluctuations
        this.fluctuate();
    }
    
    fluctuate() {
        if (!this.isPlaying) return;
        
        // Random volume fluctuations
        const now = this.context.currentTime;
        const targetGain = this.config.gain * (0.5 + Math.random() * 0.5);
        
        this.staticGain.gain.linearRampToValueAtTime(targetGain, now + 0.1);
        
        // Schedule next fluctuation
        const delay = 100 + Math.random() * 200;
        this.fluctuateTimeout = setTimeout(() => this.fluctuate(), delay);
    }
    
    stop(fadeTime = 2) {
        if (this.fluctuateTimeout) {
            clearTimeout(this.fluctuateTimeout);
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
