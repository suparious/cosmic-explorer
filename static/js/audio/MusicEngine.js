// Main Music Engine for Cosmic Explorer
// Orchestrates audio layers and effects for dynamic space music

import { TRACK_DEFINITIONS } from './constants/trackDefinitions.js';
import { TIMING, CHORD_PROGRESSIONS } from './constants/musicalData.js';
import { EffectsChain } from './effects/EffectsChain.js';
import { layerFactory } from './layers/LayerFactory.js';

/**
 * Main music engine class that orchestrates all audio components
 */
export class MusicEngine {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.analyser = null;
        this.visualDataArray = null;
        this.effectsChain = null;
        
        // Music state
        this.currentTrack = 'exploration';
        this.isPlaying = false;
        this.volume = 0.5;
        
        // Track systems
        this.tracks = TRACK_DEFINITIONS;
        this.activeLayers = new Map();
        
        // Chord progression state
        this.currentChordIndex = 0;
        this.chordChangeInterval = null;
    }
    
    /**
     * Initializes the music engine
     */
    async init() {
        // Create audio context
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master gain
        this.masterGain = this.context.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.context.currentTime);
        
        // Create analyser for visualization
        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = 256;
        this.visualDataArray = new Uint8Array(this.analyser.frequencyBinCount);
        
        // Create effects chain
        this.effectsChain = new EffectsChain(this.context);
        
        // Connect audio graph
        this.masterGain.connect(this.effectsChain.input);
        this.effectsChain.output.connect(this.analyser);
        this.analyser.connect(this.context.destination);
    }
    
    /**
     * Plays a track
     * @param {string} trackName - Name of the track to play
     */
    play(trackName = 'exploration') {
        if (this.isPlaying && this.currentTrack === trackName) return;
        
        // Resume context if suspended
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        
        // Crossfade to new track if already playing
        if (this.isPlaying && this.currentTrack !== trackName) {
            this.crossfadeTo(trackName);
        } else {
            this.startTrack(trackName);
        }
        
        this.isPlaying = true;
        this.currentTrack = trackName;
        
        // Start chord progression changes
        if (!this.chordChangeInterval) {
            this.chordChangeInterval = setInterval(() => {
                this.changeChord();
            }, TIMING.CHORD_CHANGE_INTERVAL);
        }
    }
    
    /**
     * Stops playback
     */
    stop() {
        if (!this.isPlaying) return;
        
        // Fade out all active layers
        this.activeLayers.forEach((layer, id) => {
            layer.stop();
            setTimeout(() => this.activeLayers.delete(id), 2000);
        });
        
        // Stop chord progression
        if (this.chordChangeInterval) {
            clearInterval(this.chordChangeInterval);
            this.chordChangeInterval = null;
        }
        
        this.isPlaying = false;
    }
    
    /**
     * Starts a track
     * @param {string} trackName - Name of the track to start
     */
    startTrack(trackName) {
        const track = this.tracks[trackName];
        if (!track) return;
        
        track.layers.forEach((layerConfig, index) => {
            const layerId = `${trackName}_${index}`;
            this.startLayer(layerId, layerConfig, track.mood);
        });
    }
    
    /**
     * Starts a single layer
     * @param {string} id - Unique identifier for the layer
     * @param {Object} config - Layer configuration
     * @param {string} mood - Current mood
     */
    startLayer(id, config, mood) {
        // Stop existing layer if any
        this.stopLayer(id);
        
        // Create new layer using factory
        const layer = layerFactory.create(this.context, config, mood);
        
        if (layer) {
            layer.start(this.masterGain);
            this.activeLayers.set(id, layer);
        }
    }
    
    /**
     * Stops a single layer
     * @param {string} id - Layer identifier
     */
    stopLayer(id) {
        const layer = this.activeLayers.get(id);
        if (layer) {
            layer.stop();
            this.activeLayers.delete(id);
        }
    }
    
    /**
     * Crossfades to a new track
     * @param {string} newTrack - Name of the new track
     * @param {number} duration - Crossfade duration in seconds
     */
    crossfadeTo(newTrack, duration = TIMING.DEFAULT_CROSSFADE) {
        const oldTrack = this.currentTrack;
        
        // Fade out old layers
        this.activeLayers.forEach((layer, id) => {
            if (id.startsWith(oldTrack)) {
                layer.stop(duration);
                setTimeout(() => this.activeLayers.delete(id), duration * 1000);
            }
        });
        
        // Start new track halfway through crossfade
        setTimeout(() => this.startTrack(newTrack), duration * 500);
    }
    
    /**
     * Changes to the next chord in the progression
     */
    changeChord() {
        const track = this.tracks[this.currentTrack];
        if (!track) return;
        
        const progression = CHORD_PROGRESSIONS[track.mood];
        if (!progression) return;
        
        this.currentChordIndex = (this.currentChordIndex + 1) % progression.length;
        
        // Update layers that respond to chord changes
        this.activeLayers.forEach(layer => {
            layer.update({ chordIndex: this.currentChordIndex });
        });
    }
    
    /**
     * Sets the master volume
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.exponentialRampToValueAtTime(
                this.volume || 0.001, 
                this.context.currentTime + 0.1
            );
        }
    }
    
    /**
     * Gets visualization data from the analyser
     * @returns {Uint8Array|null} Frequency data array
     */
    getVisualizationData() {
        if (this.analyser && this.visualDataArray) {
            this.analyser.getByteFrequencyData(this.visualDataArray);
            return this.visualDataArray;
        }
        return null;
    }
    
    /**
     * Updates the music based on game state
     * @param {Object} gameState - Current game state
     */
    updateGameState(gameState) {
        if (!gameState) return;
        
        // Determine which track to play based on game state
        let targetTrack = 'exploration';
        
        if (gameState.player_stats.in_pod_mode) {
            targetTrack = 'pod';
        } else if (gameState.player_stats.health < 30) {
            targetTrack = 'danger';
        } else if (gameState.at_repair_location) {
            targetTrack = 'station';
        } else if (gameState.in_combat) {
            targetTrack = 'combat';
        }
        
        // Change track if needed
        if (this.currentTrack !== targetTrack) {
            this.play(targetTrack);
        }
        
        // Adjust intensity based on health
        const healthRatio = gameState.player_stats.health / 100;
        const intensity = 1 - healthRatio;
        
        // Update effects based on intensity
        if (this.effectsChain) {
            this.effectsChain.updateFilterIntensity(intensity);
        }
    }
    
    /**
     * Gets information about the current track
     * @returns {Object} Track info
     */
    getCurrentTrackInfo() {
        const track = this.tracks[this.currentTrack];
        return {
            name: track?.name || 'Unknown',
            mood: track?.mood || 'peaceful',
            isPlaying: this.isPlaying,
            activeLayers: this.activeLayers.size
        };
    }
    
    /**
     * Pauses playback (keeps state)
     */
    pause() {
        if (this.context && this.isPlaying) {
            this.context.suspend();
        }
    }
    
    /**
     * Resumes playback
     */
    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }
}
