// Dissonance layer - creates dissonant, unsettling sounds

import { BaseLayer } from '../BaseLayer.js';

export class DissonanceLayer extends BaseLayer {
    static get TYPE() {
        return 'dissonance';
    }
    
    createNodes() {
        // Create multiple oscillators with dissonant intervals
        this.config.frequencies.forEach(freq => {
            const osc = this.context.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, this.context.currentTime);
            
            // Add random detune for extra dissonance
            osc.detune.setValueAtTime(Math.random() * 30 - 15, this.context.currentTime);
            
            // Create ring modulator for additional harshness
            const modulator = this.context.createOscillator();
            modulator.frequency.setValueAtTime(freq * 1.01, this.context.currentTime);
            
            const ringMod = this.context.createGain();
            ringMod.gain.setValueAtTime(0, this.context.currentTime);
            
            // Individual gain control
            const oscGain = this.context.createGain();
            oscGain.gain.setValueAtTime(0.3, this.context.currentTime);
            
            // Connect modulator to ring mod gain
            modulator.connect(ringMod.gain);
            osc.connect(ringMod);
            ringMod.connect(oscGain);
            oscGain.connect(this.gainNode);
            
            // Start oscillators
            osc.start();
            modulator.start();
            
            this.registerNode(osc);
            this.registerNode(modulator);
        });
    }
}
