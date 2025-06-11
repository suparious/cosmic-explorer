// Track definitions for the Cosmic Explorer music engine

export const TRACK_DEFINITIONS = Object.freeze({
    exploration: {
        name: 'Deep Space Exploration',
        mood: 'peaceful',
        layers: [
            // Foundation
            { type: 'drone', frequency: 55, detune: 0, gain: 0.12 },
            { type: 'drone', frequency: 82.5, detune: -5, gain: 0.08 },
            { type: 'sub', frequency: 27.5, gain: 0.15 },
            
            // Harmonic content
            { type: 'pad', frequencies: [220, 330, 440, 550], gain: 0.04 },
            { type: 'pad', frequencies: [165, 247.5, 330], gain: 0.03 },
            { type: 'harmonic', baseFreq: 110, harmonics: [1, 2, 3, 5, 7], gain: 0.02 },
            
            // Movement
            { type: 'arpeggio', baseFreq: 440, pattern: 'peaceful', gain: 0.02 },
            { type: 'bass_line', baseFreq: 55, pattern: 'peaceful', gain: 0.08 },
            
            // Atmosphere
            { type: 'shimmer', baseFreq: 880, gain: 0.025 },
            { type: 'whisper', frequencies: [1100, 1650, 2200], gain: 0.015 },
            { type: 'breath', gain: 0.02 }
        ]
    },
    
    station: {
        name: 'Station Ambience',
        mood: 'peaceful',
        layers: [
            // Foundation
            { type: 'drone', frequency: 110, detune: 0, gain: 0.08 },
            { type: 'sub', frequency: 55, gain: 0.1 },
            
            // Harmonic content
            { type: 'pad', frequencies: [261.63, 329.63, 392, 523.25], gain: 0.06 },
            { type: 'harmonic', baseFreq: 220, harmonics: [1, 2, 3, 4], gain: 0.03 },
            
            // Mechanical elements
            { type: 'mechanical', frequency: 60, gain: 0.04 },
            { type: 'mechanical', frequency: 90, gain: 0.02 },
            { type: 'hydraulic', gain: 0.03 },
            
            // Musical elements
            { type: 'chime', frequencies: [523.25, 659.25, 783.99, 1046.5], gain: 0.02 },
            { type: 'arpeggio', baseFreq: 261.63, pattern: 'peaceful', gain: 0.015 },
            
            // Atmosphere
            { type: 'comm_chatter', gain: 0.01 },
            { type: 'air_flow', gain: 0.02 }
        ]
    },
    
    danger: {
        name: 'Imminent Threat',
        mood: 'tense',
        layers: [
            // Foundation
            { type: 'drone', frequency: 55, detune: -10, gain: 0.15 },
            { type: 'drone', frequency: 41.25, detune: 5, gain: 0.1 },
            { type: 'sub', frequency: 27.5, gain: 0.2 },
            
            // Tension elements
            { type: 'pulse', frequency: 110, gain: 0.08 },
            { type: 'pulse', frequency: 82.5, gain: 0.05 },
            { type: 'bass_line', baseFreq: 55, pattern: 'tense', gain: 0.1 },
            
            // Dissonance
            { type: 'dissonance', frequencies: [220, 233.08, 246.94], gain: 0.04 },
            { type: 'dissonance', frequencies: [110, 116.54, 123.47], gain: 0.03 },
            { type: 'cluster', baseFreq: 440, spread: 50, gain: 0.02 },
            
            // Warning elements
            { type: 'warning', frequency: 440, gain: 0.025 },
            { type: 'radar_sweep', gain: 0.02 },
            { type: 'tension_riser', gain: 0.03 }
        ]
    },
    
    combat: {
        name: 'Battle Stations',
        mood: 'epic',
        layers: [
            // Power foundation
            { type: 'drone', frequency: 55, detune: 0, gain: 0.2 },
            { type: 'drone', frequency: 82.5, detune: 0, gain: 0.15 },
            { type: 'sub', frequency: 27.5, gain: 0.25 },
            { type: 'sub', frequency: 41.25, gain: 0.15 },
            
            // Rhythmic drive
            { type: 'pulse', frequency: 110, gain: 0.12 },
            { type: 'rhythm', frequency: 220, gain: 0.08 },
            { type: 'percussion', pattern: 'combat', gain: 0.1 },
            { type: 'bass_line', baseFreq: 55, pattern: 'epic', gain: 0.15 },
            
            // Epic elements
            { type: 'power_chord', frequencies: [110, 165, 220], gain: 0.08 },
            { type: 'brass_stab', frequencies: [220, 330, 440], gain: 0.05 },
            { type: 'lead', frequencies: [440, 550, 660], gain: 0.04 },
            { type: 'arpeggio', baseFreq: 880, pattern: 'epic', gain: 0.03 },
            
            // Battle atmosphere
            { type: 'explosion_rumble', gain: 0.02 },
            { type: 'siren', frequency: 1000, gain: 0.015 }
        ]
    },
    
    pod: {
        name: 'Emergency Pod',
        mood: 'tense',
        layers: [
            // Emergency foundation
            { type: 'drone', frequency: 110, detune: -20, gain: 0.08 },
            { type: 'drone', frequency: 73.5, detune: 10, gain: 0.06 },
            
            // Life support
            { type: 'heartbeat', frequency: 60, gain: 0.12 },
            { type: 'breathing', gain: 0.05 },
            
            // Emergency systems
            { type: 'alarm', frequency: 880, gain: 0.02 },
            { type: 'alarm', frequency: 660, gain: 0.015 },
            { type: 'system_beep', frequencies: [440, 880, 1320], gain: 0.02 },
            
            // Atmosphere
            { type: 'static', gain: 0.025 },
            { type: 'radio_static', gain: 0.02 },
            { type: 'metal_stress', gain: 0.03 },
            
            // Tension
            { type: 'bass_line', baseFreq: 55, pattern: 'tense', gain: 0.05 },
            { type: 'anxiety_pulse', gain: 0.04 }
        ]
    }
});
