// Warning layer - creates warning siren sounds

import { BaseLayer } from '../BaseLayer.js';

export class WarningLayer extends BaseLayer {
    static get TYPE() {
        return 'warning';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.beepTimeout = null;
    }
    
    createNodes() {
        // Main oscillator
        const osc = this.context.createOscillator();
        osc.type = 'square';
        
        // Siren effect with frequency modulation
        const freqLfo = this.context.createOscillator();
        const freqLfoGain = this.context.createGain();
        freqLfo.frequency.setValueAtTime(2, this.context.currentTime);
        freqLfoGain.gain.setValueAtTime(this.config.frequency * 0.5, this.context.currentTime);
        
        // Connect LFO to oscillator frequency
        freqLfo.connect(freqLfoGain);
        freqLfoGain.connect(osc.frequency);
        osc.frequency.setValueAtTime(this.config.frequency, this.context.currentTime);
        
        // Gate for intermittent beeping
        const gate = this.context.createGain();
        this.startBeeping(gate);
        
        // Connect audio path
        osc.connect(gate);
        gate.connect(this.gainNode);
        
        // Start oscillators
        osc.start();
        freqLfo.start();
        
        this.registerNode(osc);
        this.registerNode(freqLfo);
    }
    
    startBeeping(gate) {
        const beep = () => {
            if (!this.isPlaying) return;
            
            const now = this.context.currentTime;
            gate.gain.setValueAtTime(0.3, now);
            gate.gain.setValueAtTime(0, now + 0.2);
            
            this.beepTimeout = setTimeout(beep, 1000);
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
