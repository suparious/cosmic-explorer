// Power chord layer - creates massive power chords

import { BaseLayer } from '../BaseLayer.js';

export class PowerChordLayer extends BaseLayer {
    static get TYPE() {
        return 'power_chord';
    }
    
    createNodes() {
        // Create oscillators for each frequency in the power chord
        this.config.frequencies.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, this.context.currentTime);
            
            // Add slight detuning for thickness
            const detune = (i - 1) * 3; // Center, slight sharp, slight flat
            osc.detune.setValueAtTime(detune, this.context.currentTime);
            
            // Individual gain
            const gain = this.context.createGain();
            gain.gain.setValueAtTime(0.3 / this.config.frequencies.length, this.context.currentTime);
            
            // Distortion for power
            const waveshaper = this.context.createWaveShaper();
            waveshaper.curve = this.makeDistortionCurve(20);
            waveshaper.oversample = '4x';
            
            // Low-pass filter to control harshness
            const filter = this.context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, this.context.currentTime);
            
            // Connect audio path
            osc.connect(waveshaper);
            waveshaper.connect(filter);
            filter.connect(gain);
            gain.connect(this.gainNode);
            
            // Start oscillator
            osc.start();
            
            this.registerNode(osc);
        });
    }
    
    makeDistortionCurve(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        
        return curve;
    }
}
