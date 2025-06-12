// Mechanical layer - creates industrial humming sounds

import { BaseLayer } from '../BaseLayer.js';

export class MechanicalLayer extends BaseLayer {
    static get TYPE() {
        return 'mechanical';
    }
    
    createNodes() {
        // Main oscillator for industrial hum
        const osc = this.context.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(this.config.frequency, this.context.currentTime);
        
        // Comb filter for metallic sound
        const delay = this.context.createDelay();
        delay.delayTime.setValueAtTime(1 / this.config.frequency, this.context.currentTime);
        
        const feedback = this.context.createGain();
        feedback.gain.setValueAtTime(0.8, this.context.currentTime);
        
        // Bandpass filter for resonance
        const filter = this.context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(this.config.frequency * 4, this.context.currentTime);
        filter.Q.setValueAtTime(10, this.context.currentTime);
        
        // Add slight modulation for realism
        const lfo = this.context.createOscillator();
        const lfoGain = this.context.createGain();
        lfo.frequency.setValueAtTime(0.3, this.context.currentTime);
        lfoGain.gain.setValueAtTime(this.config.frequency * 0.02, this.context.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        // Connect audio path with feedback loop
        osc.connect(filter);
        filter.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(this.gainNode);
        
        // Direct signal mix
        filter.connect(this.gainNode);
        
        // Start oscillators
        osc.start();
        lfo.start();
        
        this.registerNode(osc);
        this.registerNode(lfo);
    }
}
