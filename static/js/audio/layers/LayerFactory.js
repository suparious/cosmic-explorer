// Layer factory for creating and managing audio layers

// Import all layer types
import { DroneLayer } from './base/DroneLayer.js';
import { PadLayer } from './base/PadLayer.js';
import { SubBassLayer } from './base/SubBassLayer.js';

// Import atmospheric layers
import { ShimmerLayer } from './atmospheric/ShimmerLayer.js';
// import { WhisperLayer } from './atmospheric/WhisperLayer.js';
// import { BreathLayer } from './atmospheric/BreathLayer.js';

// Import tension layers
import { PulseLayer } from './tension/PulseLayer.js';

// Import other layer types as they're created...

/**
 * Factory class for creating audio layers
 */
export class LayerFactory {
    constructor() {
        this.layerTypes = new Map();
        this.registerDefaultLayers();
    }
    
    /**
     * Registers all default layer types
     */
    registerDefaultLayers() {
        // Base layers
        this.register(DroneLayer);
        this.register(PadLayer);
        this.register(SubBassLayer);
        
        // Atmospheric layers
        this.register(ShimmerLayer);
        
        // Tension layers
        this.register(PulseLayer);
        
        // Register other layers as they're imported
        // this.register(WhisperLayer);
        // etc...
    }
    
    /**
     * Registers a layer type
     * @param {Class} LayerClass - The layer class to register
     */
    register(LayerClass) {
        if (!LayerClass.TYPE) {
            throw new Error(`Layer class ${LayerClass.name} must have a static TYPE property`);
        }
        this.layerTypes.set(LayerClass.TYPE, LayerClass);
    }
    
    /**
     * Creates a layer instance
     * @param {AudioContext} context - The audio context
     * @param {Object} config - Layer configuration
     * @param {string} mood - Current mood
     * @returns {BaseLayer} The created layer instance
     */
    create(context, config, mood) {
        const LayerClass = this.layerTypes.get(config.type);
        
        if (!LayerClass) {
            console.warn(`Unknown layer type: ${config.type}`);
            return null;
        }
        
        return new LayerClass(context, config, mood);
    }
    
    /**
     * Gets all registered layer types
     * @returns {string[]} Array of layer type names
     */
    getTypes() {
        return Array.from(this.layerTypes.keys());
    }
    
    /**
     * Checks if a layer type is registered
     * @param {string} type - The layer type
     * @returns {boolean} True if registered
     */
    hasType(type) {
        return this.layerTypes.has(type);
    }
}

// Create singleton instance
export const layerFactory = new LayerFactory();
