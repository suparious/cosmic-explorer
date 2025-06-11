// Base class for all audio layers

import { stopAudioNode } from '../utils/audioHelpers.js';

/**
 * Abstract base class for all audio layers
 */
export class BaseLayer {
    /**
     * @param {AudioContext} context - The audio context
     * @param {Object} config - Layer configuration
     * @param {string} mood - Current mood (peaceful, mysterious, tense, epic)
     */
    constructor(context, config, mood) {
        this.context = context;
        this.config = config;
        this.mood = mood;
        this.nodes = [];
        this.gainNode = context.createGain();
        this.isPlaying = false;
        
        // Set initial gain
        this.gainNode.gain.setValueAtTime(0, context.currentTime);
    }
    
    /**
     * Starts the layer with a fade in
     * @param {AudioNode} destination - The destination node to connect to
     */
    start(destination) {
        if (this.isPlaying) return;
        
        // Connect gain node to destination
        this.gainNode.connect(destination);
        
        // Fade in
        this.gainNode.gain.linearRampToValueAtTime(
            this.config.gain || 0.1, 
            this.context.currentTime + 2
        );
        
        // Create the audio nodes
        this.createNodes();
        
        this.isPlaying = true;
    }
    
    /**
     * Stops the layer with a fade out
     * @param {number} fadeTime - Fade out duration in seconds
     */
    stop(fadeTime = 2) {
        if (!this.isPlaying) return;
        
        // Fade out
        this.gainNode.gain.exponentialRampToValueAtTime(
            0.001, 
            this.context.currentTime + fadeTime
        );
        
        // Stop all nodes after fade
        setTimeout(() => {
            this.stopAllNodes();
            this.gainNode.disconnect();
            this.isPlaying = false;
        }, fadeTime * 1000);
    }
    
    /**
     * Immediately stops all nodes
     */
    stopAllNodes() {
        this.nodes.forEach(node => stopAudioNode(node));
        this.nodes = [];
    }
    
    /**
     * Creates the audio nodes for this layer
     * Must be implemented by subclasses
     */
    createNodes() {
        throw new Error('createNodes() must be implemented by subclass');
    }
    
    /**
     * Updates layer parameters (optional)
     * Can be overridden by subclasses for dynamic updates
     * @param {Object} params - Parameters to update
     */
    update(params) {
        // Default implementation does nothing
    }
    
    /**
     * Gets the static type identifier for this layer
     * Must be implemented by subclasses
     */
    static get TYPE() {
        throw new Error('TYPE must be implemented by subclass');
    }
    
    /**
     * Registers an audio node for cleanup
     * @param {AudioNode} node - The node to register
     */
    registerNode(node) {
        this.nodes.push(node);
    }
}
