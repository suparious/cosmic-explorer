// Heartbeat layer - creates heartbeat rhythm sounds

import { BaseLayer } from '../BaseLayer.js';

export class HeartbeatLayer extends BaseLayer {
    static get TYPE() {
        return 'heartbeat';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.heartbeatTimeout = null;
    }
    
    createNodes() {
        // Start heartbeat pattern
        this.playHeartbeat();
    }
    
    playHeartbeat() {
        if (!this.isPlaying) return;
        
        const createBeat = (delay = 0) => {
            const osc = this.context.createOscillator();
            osc.type = 'sine';
            
            const now = this.context.currentTime + delay;
            
            // Low frequency thump
            osc.frequency.setValueAtTime(this.config.frequency, now);
            osc.frequency.exponentialRampToValueAtTime(this.config.frequency * 0.5, now + 0.2);
            
            // Envelope for thump
            const envelope = this.context.createGain();
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(0.3, now + 0.05);
            envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            
            // Add sub-harmonic for depth
            const subOsc = this.context.createOscillator();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(this.config.frequency / 2, now);
            
            const subEnv = this.context.createGain();
            subEnv.gain.setValueAtTime(0.2, now);
            subEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            
            // Connect audio paths
            osc.connect(envelope);
            subOsc.connect(subEnv);
            envelope.connect(this.gainNode);
            subEnv.connect(this.gainNode);
            
            // Start and stop
            osc.start(now);
            subOsc.start(now);
            osc.stop(now + 0.3);
            subOsc.stop(now + 0.3);
        };
        
        // Double beat pattern (lub-dub)
        createBeat(0);      // First beat
        createBeat(0.2);    // Second beat
        
        // Schedule next heartbeat cycle
        this.heartbeatTimeout = setTimeout(() => this.playHeartbeat(), 1200); // ~50 BPM
    }
    
    stop(fadeTime = 2) {
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
        }
        super.stop(fadeTime);
    }
}
