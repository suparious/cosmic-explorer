// Effects chain processor for the music engine

import { createAdvancedReverbImpulse, createStereoWidener } from '../utils/audioHelpers.js';

/**
 * Creates and manages the audio effects chain
 */
export class EffectsChain {
    constructor(context) {
        this.context = context;
        this.nodes = {};
        this.input = null;
        this.output = null;
        
        this.createEffects();
    }
    
    /**
     * Creates the effects chain
     */
    createEffects() {
        // Space filter - gentle high-frequency rolloff
        this.nodes.filter = this.context.createBiquadFilter();
        this.nodes.filter.type = 'lowpass';
        this.nodes.filter.frequency.setValueAtTime(8000, this.context.currentTime);
        this.nodes.filter.Q.setValueAtTime(0.5, this.context.currentTime);
        
        // Compressor for dynamic control
        this.nodes.compressor = this.context.createDynamicsCompressor();
        this.nodes.compressor.threshold.setValueAtTime(-24, this.context.currentTime);
        this.nodes.compressor.knee.setValueAtTime(30, this.context.currentTime);
        this.nodes.compressor.ratio.setValueAtTime(12, this.context.currentTime);
        this.nodes.compressor.attack.setValueAtTime(0.003, this.context.currentTime);
        this.nodes.compressor.release.setValueAtTime(0.25, this.context.currentTime);
        
        // Stereo widener
        this.nodes.widener = createStereoWidener(this.context);
        
        // Delay for space echo
        this.nodes.delay = this.context.createDelay(5.0);
        this.nodes.delay.delayTime.setValueAtTime(0.3, this.context.currentTime);
        
        const delayFeedback = this.context.createGain();
        delayFeedback.gain.setValueAtTime(0.4, this.context.currentTime);
        
        const delayFilter = this.context.createBiquadFilter();
        delayFilter.type = 'lowpass';
        delayFilter.frequency.setValueAtTime(4000, this.context.currentTime);
        
        const delayWetGain = this.context.createGain();
        delayWetGain.gain.setValueAtTime(0.25, this.context.currentTime);
        
        // Connect delay feedback loop
        this.nodes.delay.connect(delayFilter);
        delayFilter.connect(delayFeedback);
        delayFeedback.connect(this.nodes.delay);
        this.nodes.delay.connect(delayWetGain);
        
        // Create reverb
        this.nodes.reverb = this.context.createConvolver();
        this.nodes.reverb.buffer = createAdvancedReverbImpulse(this.context, 5, 3, false);
        
        // Dry/wet mix for reverb
        const reverbWetGain = this.context.createGain();
        reverbWetGain.gain.setValueAtTime(0.35, this.context.currentTime);
        this.nodes.reverb.connect(reverbWetGain);
        
        // Create mixer for dry and wet signals
        this.nodes.wetMixer = this.context.createGain();
        this.nodes.dryMixer = this.context.createGain();
        this.nodes.dryMixer.gain.setValueAtTime(0.7, this.context.currentTime);
        this.nodes.wetMixer.gain.setValueAtTime(0.3, this.context.currentTime);
        
        // Final output gain
        this.nodes.outputGain = this.context.createGain();
        
        // Connect the chain
        this.connectChain([
            this.nodes.filter,
            this.nodes.compressor,
            this.nodes.widener.input
        ]);
        
        // Dry path
        this.nodes.widener.output.connect(this.nodes.dryMixer);
        
        // Wet paths
        this.nodes.widener.output.connect(this.nodes.delay);
        this.nodes.widener.output.connect(this.nodes.reverb);
        delayWetGain.connect(this.nodes.wetMixer);
        reverbWetGain.connect(this.nodes.wetMixer);
        
        // Final mix
        this.nodes.dryMixer.connect(this.nodes.outputGain);
        this.nodes.wetMixer.connect(this.nodes.outputGain);
        
        // Set input and output references
        this.input = this.nodes.filter;
        this.output = this.nodes.outputGain;
    }
    
    /**
     * Connects a chain of audio nodes
     * @param {AudioNode[]} nodes - Array of nodes to connect in sequence
     */
    connectChain(nodes) {
        for (let i = 0; i < nodes.length - 1; i++) {
            if (nodes[i].output) {
                nodes[i].output.connect(nodes[i + 1].input || nodes[i + 1]);
            } else {
                nodes[i].connect(nodes[i + 1].input || nodes[i + 1]);
            }
        }
    }
    
    /**
     * Updates the filter frequency based on intensity
     * @param {number} intensity - Intensity value (0-1)
     */
    updateFilterIntensity(intensity) {
        const baseFreq = 8000;
        const targetFreq = baseFreq - (intensity * 6000);
        this.nodes.filter.frequency.exponentialRampToValueAtTime(
            targetFreq, 
            this.context.currentTime + 1
        );
    }
    
    /**
     * Sets the dry/wet mix
     * @param {number} wetAmount - Wet amount (0-1)
     */
    setWetMix(wetAmount) {
        const dryAmount = 1 - wetAmount;
        this.nodes.dryMixer.gain.linearRampToValueAtTime(
            dryAmount,
            this.context.currentTime + 0.1
        );
        this.nodes.wetMixer.gain.linearRampToValueAtTime(
            wetAmount,
            this.context.currentTime + 0.1
        );
    }
    
    /**
     * Sets the reverb amount
     * @param {number} amount - Reverb amount (0-1)
     */
    setReverbAmount(amount) {
        // This would need to be implemented with additional gain nodes
        // for individual wet signal control
    }
    
    /**
     * Sets the delay parameters
     * @param {number} time - Delay time in seconds
     * @param {number} feedback - Feedback amount (0-1)
     */
    setDelayParams(time, feedback) {
        this.nodes.delay.delayTime.linearRampToValueAtTime(
            time,
            this.context.currentTime + 0.1
        );
        // Feedback would need to be exposed in the effect creation
    }
}
