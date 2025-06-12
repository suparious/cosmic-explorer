// Alarm layer - creates rapid alarm beeping sounds

import { BaseLayer } from '../BaseLayer.js';

export class AlarmLayer extends BaseLayer {
    static get TYPE() {
        return 'alarm';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.beepTimeout = null;
    }
    
    createNodes() {
        // Main oscillator
        const osc = this.context.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(this.config.frequency, this.context.currentTime);
        
        // Rapid beeping gate
        const gate = this.context.createGain();
        this.startRapidBeeping(gate);
        
        // Add slight resonance
        const filter = this.context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(this.config.frequency, this.context.currentTime);
        filter.Q.setValueAtTime(5, this.context.currentTime);
        
        // Connect audio path
        osc.connect(filter);
        filter.connect(gate);
        gate.connect(this.gainNode);
        
        // Start oscillator
        osc.start();
        
        this.registerNode(osc);
    }
    
    startRapidBeeping(gate) {
        const beep = () => {
            if (!this.isPlaying) return;
            
            const now = this.context.currentTime;
            gate.gain.setValueAtTime(0.1, now);
            gate.gain.setValueAtTime(0, now + 0.05);
            
            // Rapid beeping rate
            this.beepTimeout = setTimeout(beep, 100);
        };
        
        beep();
    }
    
    stop(fadeTime = 2) {
        if (this.beepTimeout) {
            clearTimeout(this.beepTimeout);
        }
        super.stop(fadeTime);
    }
}
