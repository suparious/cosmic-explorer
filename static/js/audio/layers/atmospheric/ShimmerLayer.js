// Shimmer layer - creates ethereal, high-frequency shimmering sounds

import { BaseLayer } from '../BaseLayer.js';

export class ShimmerLayer extends BaseLayer {
    static get TYPE() {
        return 'shimmer';
    }
    
    createNodes() {
        // Create multiple high-frequency oscillators with slow random panning
        for (let i = 0; i < 4; i++) {
            const osc = this.context.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(
                this.config.baseFreq + Math.random() * 1000, 
                this.context.currentTime
            );
            
            // Amplitude envelope for fade in/out
            const envelope = this.context.createGain();
            envelope.gain.setValueAtTime(0, this.context.currentTime);
            
            // Random fade in/out pattern
            this.scheduleShimmer(envelope, i);
            
            // Panning for spatial effect
            const panner = this.context.createStereoPanner();
            const panLfo = this.context.createOscillator();
            panLfo.frequency.setValueAtTime(0.05 + Math.random() * 0.1, this.context.currentTime);
            panLfo.connect(panner.pan);
            
            // Connect audio path
            osc.connect(envelope);
            envelope.connect(panner);
            panner.connect(this.gainNode);
            
            // Start oscillators
            osc.start();
            panLfo.start();
            
            // Register nodes
            this.registerNode(osc);
            this.registerNode(panLfo);
        }
    }
    
    scheduleShimmer(envelope, index) {
        const fadeIn = () => {
            if (!this.isPlaying) return;
            
            const now = this.context.currentTime;
            envelope.gain.linearRampToValueAtTime(0.5, now + 2);
            envelope.gain.linearRampToValueAtTime(0, now + 5);
            
            // Schedule next shimmer
            this.shimmerTimeout = setTimeout(fadeIn, (8 + Math.random() * 4) * 1000);
        };
        
        // Start at different times for each oscillator
        this.shimmerTimeout = setTimeout(fadeIn, index * 2000);
    }
    
    stop(fadeTime = 2) {
        // Clear timeout to prevent scheduling after stop
        if (this.shimmerTimeout) {
            clearTimeout(this.shimmerTimeout);
        }
        super.stop(fadeTime);
    }
}
