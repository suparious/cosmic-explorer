// Comm chatter layer - creates radio communication chatter sounds

import { BaseLayer } from '../BaseLayer.js';
import { createFilteredNoise } from '../../utils/audioHelpers.js';

export class CommChatterLayer extends BaseLayer {
    static get TYPE() {
        return 'comm_chatter';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.chatterTimeouts = [];
    }
    
    createNodes() {
        // Start chatter pattern
        this.scheduleChatter();
    }
    
    scheduleChatter() {
        const chatter = () => {
            if (!this.isPlaying) return;
            
            // Create bandpass filtered noise for radio effect
            const frequency = 1000 + Math.random() * 1000;
            const noise = createFilteredNoise(this.context, 'bandpass', frequency, 10);
            
            // Create envelope for speech-like rhythm
            const envelope = this.context.createGain();
            const now = this.context.currentTime;
            const duration = 2 + Math.random() * 2;
            
            // Generate speech-like pattern
            let time = now;
            while (time < now + duration) {
                // Random burst length for word-like sounds
                const burstLength = Math.random() * 0.1 + 0.05;
                envelope.gain.setValueAtTime(Math.random() * 0.03, time);
                time += burstLength;
                
                // Silence between "words"
                envelope.gain.setValueAtTime(0, time);
                time += Math.random() * 0.1;
            }
            
            // Add radio static characteristics
            const distortion = this.context.createWaveShaper();
            distortion.curve = this.makeDistortionCurve(5);
            
            // High-pass filter for tinny radio sound
            const radioFilter = this.context.createBiquadFilter();
            radioFilter.type = 'highpass';
            radioFilter.frequency.setValueAtTime(300, now);
            
            // Connect audio path
            noise.connect(envelope);
            envelope.connect(distortion);
            distortion.connect(radioFilter);
            radioFilter.connect(this.gainNode);
            
            // Stop noise after duration
            setTimeout(() => {
                if (noise.sourceNode && noise.sourceNode.stop) {
                    noise.sourceNode.stop();
                }
            }, duration * 1000);
            
            // Schedule next chatter
            const delay = 8000 + Math.random() * 10000;
            const timeout = setTimeout(() => this.scheduleChatter(), delay);
            this.chatterTimeouts.push(timeout);
        };
        
        // Start with random delay
        const initialDelay = Math.random() * 5000;
        const timeout = setTimeout(chatter, initialDelay);
        this.chatterTimeouts.push(timeout);
    }
    
    makeDistortionCurve(amount) {
        const samples = 256;
        const curve = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = Math.tanh(x * amount);
        }
        
        return curve;
    }
    
    stop(fadeTime = 2) {
        this.chatterTimeouts.forEach(timeout => clearTimeout(timeout));
        this.chatterTimeouts = [];
        super.stop(fadeTime);
    }
}
