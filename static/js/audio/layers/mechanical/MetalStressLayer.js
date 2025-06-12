// Metal stress layer - creates creaking metal sounds

import { BaseLayer } from '../BaseLayer.js';

export class MetalStressLayer extends BaseLayer {
    static get TYPE() {
        return 'metal_stress';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.creakTimeouts = [];
    }
    
    createNodes() {
        // Start creaking pattern
        this.scheduleCreak();
    }
    
    scheduleCreak() {
        const creak = () => {
            if (!this.isPlaying) return;
            
            const osc = this.context.createOscillator();
            osc.type = 'sawtooth';
            
            const now = this.context.currentTime;
            const startFreq = 100 + Math.random() * 100;
            
            // Frequency glide for creaking effect
            osc.frequency.setValueAtTime(startFreq, now);
            osc.frequency.linearRampToValueAtTime(startFreq * 0.7, now + 0.5);
            
            // Resonant filter for metallic quality
            const filter = this.context.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(startFreq * 2, now);
            filter.Q.setValueAtTime(20, now);
            
            // Add distortion for grittiness
            const waveshaper = this.context.createWaveShaper();
            waveshaper.curve = this.makeDistortionCurve(10);
            
            // Envelope with irregular attack
            const envelope = this.context.createGain();
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(0.1, now + 0.05);
            envelope.gain.linearRampToValueAtTime(0.05, now + 0.3);
            envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            
            // Connect audio path
            osc.connect(filter);
            filter.connect(waveshaper);
            waveshaper.connect(envelope);
            envelope.connect(this.gainNode);
            
            // Start and stop
            osc.start(now);
            osc.stop(now + 0.5);
            
            // Schedule next creak
            const delay = 3000 + Math.random() * 7000;
            const timeout = setTimeout(() => this.scheduleCreak(), delay);
            this.creakTimeouts.push(timeout);
        };
        
        creak();
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
    
    stop(fadeTime = 2) {
        this.creakTimeouts.forEach(timeout => clearTimeout(timeout));
        this.creakTimeouts = [];
        super.stop(fadeTime);
    }
}
