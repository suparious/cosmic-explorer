// Air flow layer - creates ambient air circulation sounds

import { BaseLayer } from '../BaseLayer.js';
import { createFilteredNoise } from '../../utils/audioHelpers.js';

export class AirFlowLayer extends BaseLayer {
    static get TYPE() {
        return 'air_flow';
    }
    
    createNodes() {
        // Create filtered noise for air sound
        const noise = createFilteredNoise(this.context, 'lowpass', 300, 0.5);
        
        // LFO for subtle volume modulation
        const lfo = this.context.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.2, this.context.currentTime);
        
        // LFO gain control
        const lfoGain = this.context.createGain();
        lfoGain.gain.setValueAtTime(0.02, this.context.currentTime);
        
        // Constant gain offset
        const constantGain = this.context.createGain();
        constantGain.gain.setValueAtTime(this.config.gain || 0.02, this.context.currentTime);
        
        // Connect LFO to modulate the constant gain
        lfo.connect(lfoGain);
        lfoGain.connect(constantGain.gain);
        
        // Connect audio path
        noise.connect(constantGain);
        constantGain.connect(this.gainNode);
        
        // Start LFO
        lfo.start();
        
        // Register nodes
        this.registerNode(lfo);
        
        // Store noise reference for cleanup
        this.noiseSource = noise;
    }
    
    stop(fadeTime = 2) {
        // Stop noise source
        if (this.noiseSource && this.noiseSource.sourceNode && this.noiseSource.sourceNode.stop) {
            setTimeout(() => {
                this.noiseSource.sourceNode.stop();
            }, fadeTime * 1000);
        }
        super.stop(fadeTime);
    }
}
