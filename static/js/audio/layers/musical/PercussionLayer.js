// Percussion layer - creates drum patterns

import { BaseLayer } from '../BaseLayer.js';
import { createFilteredNoise } from '../../utils/audioHelpers.js';

export class PercussionLayer extends BaseLayer {
    static get TYPE() {
        return 'percussion';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.beatIndex = 0;
        this.patterns = {
            combat: [1, 0, 0, 1, 0, 1, 0, 0],
            epic: [1, 0, 1, 0, 1, 0, 1, 0]
        };
        this.pattern = this.patterns[config.pattern] || this.patterns.combat;
        this.beatTimeout = null;
    }
    
    createNodes() {
        // Start beat pattern
        this.playBeat();
    }
    
    playBeat() {
        if (!this.isPlaying) return;
        
        if (this.pattern[this.beatIndex % this.pattern.length] === 1) {
            const now = this.context.currentTime;
            
            // Kick drum
            const kick = this.context.createOscillator();
            kick.type = 'sine';
            kick.frequency.setValueAtTime(150, now);
            kick.frequency.exponentialRampToValueAtTime(50, now + 0.1);
            
            const kickEnv = this.context.createGain();
            kickEnv.gain.setValueAtTime(0.5, now);
            kickEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            
            // Hi-hat
            const hihat = createFilteredNoise(this.context, 'highpass', 8000, 5);
            const hihatEnv = this.context.createGain();
            hihatEnv.gain.setValueAtTime(0.1, now);
            hihatEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            
            // Connect audio paths
            kick.connect(kickEnv);
            kickEnv.connect(this.gainNode);
            
            hihat.connect(hihatEnv);
            hihatEnv.connect(this.gainNode);
            
            // Start and stop
            kick.start(now);
            kick.stop(now + 0.2);
            
            setTimeout(() => {
                if (hihat.sourceNode && hihat.sourceNode.stop) {
                    hihat.sourceNode.stop();
                }
            }, 50);
        }
        
        // Advance pattern
        this.beatIndex++;
        
        // Schedule next beat (16th notes at 120 BPM = 125ms)
        this.beatTimeout = setTimeout(() => this.playBeat(), 250);
    }
    
    stop(fadeTime = 2) {
        if (this.beatTimeout) {
            clearTimeout(this.beatTimeout);
        }
        super.stop(fadeTime);
    }
}
