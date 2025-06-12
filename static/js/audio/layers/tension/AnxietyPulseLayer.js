// Anxiety pulse layer - creates unsettling low-frequency pulses

import { BaseLayer } from '../BaseLayer.js';

export class AnxietyPulseLayer extends BaseLayer {
    static get TYPE() {
        return 'anxiety_pulse';
    }
    
    createNodes() {
        // Very slow LFO for anxiety-inducing pulse
        const lfo = this.context.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.5, this.context.currentTime); // Very slow pulse
        
        // LFO controls gain
        const lfoGain = this.context.createGain();
        lfoGain.gain.setValueAtTime(this.config.gain, this.context.currentTime);
        
        // Base tone
        const baseOsc = this.context.createOscillator();
        baseOsc.type = 'sine';
        baseOsc.frequency.setValueAtTime(60, this.context.currentTime); // Low frequency
        
        // Add subtle beating with second oscillator
        const beatOsc = this.context.createOscillator();
        beatOsc.type = 'sine';
        beatOsc.frequency.setValueAtTime(61, this.context.currentTime); // Slight detuning for beats
        
        // Mix oscillators
        const mixer = this.context.createGain();
        mixer.gain.setValueAtTime(0.5, this.context.currentTime);
        
        // Connect LFO to control overall gain
        lfo.connect(lfoGain.gain);
        
        // Connect audio path
        baseOsc.connect(lfoGain);
        beatOsc.connect(mixer);
        mixer.connect(lfoGain);
        lfoGain.connect(this.gainNode);
        
        // Start oscillators
        lfo.start();
        baseOsc.start();
        beatOsc.start();
        
        this.registerNode(lfo);
        this.registerNode(baseOsc);
        this.registerNode(beatOsc);
    }
}
