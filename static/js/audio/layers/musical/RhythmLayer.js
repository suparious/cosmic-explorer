// Rhythm layer - creates rhythmic elements for energy

import { BaseLayer } from '../BaseLayer.js';

export class RhythmLayer extends BaseLayer {
    static get TYPE() {
        return 'rhythm';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.kickTimeout = null;
    }
    
    createNodes() {
        // Start rhythm pattern
        this.playKick();
    }
    
    playKick() {
        if (!this.isPlaying) return;
        
        // Synthesize kick drum
        const osc = this.context.createOscillator();
        osc.type = 'sine';
        
        const envelope = this.context.createGain();
        
        const now = this.context.currentTime;
        
        // Pitch envelope for punch
        osc.frequency.setValueAtTime(this.config.frequency, now);
        osc.frequency.exponentialRampToValueAtTime(this.config.frequency * 0.5, now + 0.1);
        
        // Volume envelope
        envelope.gain.setValueAtTime(0.5, now);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        // Add click for attack
        const click = this.context.createOscillator();
        click.type = 'square';
        click.frequency.setValueAtTime(1000, now);
        
        const clickEnv = this.context.createGain();
        clickEnv.gain.setValueAtTime(0.1, now);
        clickEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.005);
        
        // Connect audio paths
        osc.connect(envelope);
        envelope.connect(this.gainNode);
        
        click.connect(clickEnv);
        clickEnv.connect(this.gainNode);
        
        // Start and stop
        osc.start(now);
        osc.stop(now + 0.5);
        click.start(now);
        click.stop(now + 0.005);
        
        // Schedule next kick (60 BPM = 1000ms)
        this.kickTimeout = setTimeout(() => this.playKick(), 1000);
    }
    
    stop(fadeTime = 2) {
        if (this.kickTimeout) {
            clearTimeout(this.kickTimeout);
        }
        super.stop(fadeTime);
    }
}
