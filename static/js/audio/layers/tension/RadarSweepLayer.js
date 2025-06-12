// Radar sweep layer - creates radar sweep sounds

import { BaseLayer } from '../BaseLayer.js';

export class RadarSweepLayer extends BaseLayer {
    static get TYPE() {
        return 'radar_sweep';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.sweepTimeout = null;
    }
    
    createNodes() {
        // Start sweep pattern
        this.sweep();
    }
    
    sweep() {
        if (!this.isPlaying) return;
        
        // Sweep oscillator
        const osc = this.context.createOscillator();
        osc.type = 'sine';
        
        const now = this.context.currentTime;
        
        // Frequency sweep from high to low
        osc.frequency.setValueAtTime(2000, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.5);
        
        // Envelope for sweep
        const envelope = this.context.createGain();
        envelope.gain.setValueAtTime(0.1, now);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        // Create ping at the end
        const ping = this.context.createOscillator();
        ping.type = 'sine';
        ping.frequency.setValueAtTime(1000, now + 0.5);
        
        const pingEnv = this.context.createGain();
        pingEnv.gain.setValueAtTime(0, now + 0.5);
        pingEnv.gain.linearRampToValueAtTime(0.2, now + 0.51);
        pingEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        // Add resonant filter for metallic quality
        const filter = this.context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.Q.setValueAtTime(10, now);
        
        // Connect audio paths
        osc.connect(envelope);
        envelope.connect(filter);
        filter.connect(this.gainNode);
        
        ping.connect(pingEnv);
        pingEnv.connect(this.gainNode);
        
        // Start and stop oscillators
        osc.start(now);
        osc.stop(now + 0.5);
        ping.start(now + 0.5);
        ping.stop(now + 0.8);
        
        // Schedule next sweep
        this.sweepTimeout = setTimeout(() => this.sweep(), 3000);
    }
    
    stop(fadeTime = 2) {
        if (this.sweepTimeout) {
            clearTimeout(this.sweepTimeout);
        }
        super.stop(fadeTime);
    }
}
