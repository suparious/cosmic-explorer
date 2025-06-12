// Layer factory for creating and managing audio layers

// Import base layers
import { DroneLayer } from './base/DroneLayer.js';
import { PadLayer } from './base/PadLayer.js';
import { SubBassLayer } from './base/SubBassLayer.js';
import { HeartbeatLayer } from './base/HeartbeatLayer.js';
import { BreathingLayer } from './base/BreathingLayer.js';

// Import atmospheric layers
import { ShimmerLayer } from './atmospheric/ShimmerLayer.js';
import { WhisperLayer } from './atmospheric/WhisperLayer.js';
import { BreathLayer } from './atmospheric/BreathLayer.js';
import { AirFlowLayer } from './atmospheric/AirFlowLayer.js';
import { CommChatterLayer } from './atmospheric/CommChatterLayer.js';
import { StaticLayer } from './atmospheric/StaticLayer.js';
import { RadioStaticLayer } from './atmospheric/RadioStaticLayer.js';

// Import mechanical layers
import { MechanicalLayer } from './mechanical/MechanicalLayer.js';
import { HydraulicLayer } from './mechanical/HydraulicLayer.js';
import { MetalStressLayer } from './mechanical/MetalStressLayer.js';
import { SystemBeepLayer } from './mechanical/SystemBeepLayer.js';

// Import musical layers
import { HarmonicLayer } from './musical/HarmonicLayer.js';
import { ArpeggioLayer } from './musical/ArpeggioLayer.js';
import { BassLineLayer } from './musical/BassLineLayer.js';
import { ChimeLayer } from './musical/ChimeLayer.js';
import { LeadLayer } from './musical/LeadLayer.js';
import { RhythmLayer } from './musical/RhythmLayer.js';
import { PercussionLayer } from './musical/PercussionLayer.js';
import { PowerChordLayer } from './musical/PowerChordLayer.js';
import { BrassStabLayer } from './musical/BrassStabLayer.js';

// Import tension layers
import { PulseLayer } from './tension/PulseLayer.js';
import { DissonanceLayer } from './tension/DissonanceLayer.js';
import { WarningLayer } from './tension/WarningLayer.js';
import { AlarmLayer } from './tension/AlarmLayer.js';
import { ClusterLayer } from './tension/ClusterLayer.js';
import { RadarSweepLayer } from './tension/RadarSweepLayer.js';
import { TensionRiserLayer } from './tension/TensionRiserLayer.js';
import { AnxietyPulseLayer } from './tension/AnxietyPulseLayer.js';
import { SirenLayer } from './tension/SirenLayer.js';
import { ExplosionRumbleLayer } from './tension/ExplosionRumbleLayer.js';

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
        this.register(HeartbeatLayer);
        this.register(BreathingLayer);
        
        // Atmospheric layers
        this.register(ShimmerLayer);
        this.register(WhisperLayer);
        this.register(BreathLayer);
        this.register(AirFlowLayer);
        this.register(CommChatterLayer);
        this.register(StaticLayer);
        this.register(RadioStaticLayer);
        
        // Mechanical layers
        this.register(MechanicalLayer);
        this.register(HydraulicLayer);
        this.register(MetalStressLayer);
        this.register(SystemBeepLayer);
        
        // Musical layers
        this.register(HarmonicLayer);
        this.register(ArpeggioLayer);
        this.register(BassLineLayer);
        this.register(ChimeLayer);
        this.register(LeadLayer);
        this.register(RhythmLayer);
        this.register(PercussionLayer);
        this.register(PowerChordLayer);
        this.register(BrassStabLayer);
        
        // Tension layers
        this.register(PulseLayer);
        this.register(DissonanceLayer);
        this.register(WarningLayer);
        this.register(AlarmLayer);
        this.register(ClusterLayer);
        this.register(RadarSweepLayer);
        this.register(TensionRiserLayer);
        this.register(AnxietyPulseLayer);
        this.register(SirenLayer);
        this.register(ExplosionRumbleLayer);
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
