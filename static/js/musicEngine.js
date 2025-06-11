// Advanced Music Engine for Cosmic Explorer
// Creates Eve Online-style ambient space music with dynamic layers

class MusicEngine {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.analyser = null;
        this.visualDataArray = null;
        
        // Music state
        this.currentTrack = 'exploration';
        this.isPlaying = false;
        this.volume = 0.5;
        
        // Track systems
        this.tracks = {};
        this.activeLayers = new Map();
        
        // Effects
        this.reverb = null;
        this.delay = null;
        this.filter = null;
        
        // Enhanced chord progressions with more complexity
        this.chordProgressions = {
            peaceful: [
                [0, 4, 7, 11, 14],      // Cmaj9
                [5, 9, 12, 16, 19],     // Fmaj9
                [7, 11, 14, 17, 21],    // Gmaj9
                [2, 5, 9, 12, 17],      // Dm11
                [9, 12, 16, 19, 23],    // Am9
                [4, 7, 11, 14, 19],     // Em11
                [5, 9, 12, 16, 20],     // Fmaj7#11
                [0, 4, 7, 11, 14]       // Back to Cmaj9
            ],
            mysterious: [
                [0, 3, 7, 10, 14],      // Cm9
                [5, 8, 12, 15, 20],     // Fm(maj7)
                [7, 10, 14, 17, 22],    // Gm11
                [3, 7, 10, 14, 18],     // Ebmaj9
                [8, 11, 15, 18, 22],    // Abmaj7
                [1, 5, 8, 11, 15],      // Db maj9
                [10, 13, 17, 20, 24],   // Bbm9
                [0, 3, 7, 10, 15]       // Cm(maj7)
            ],
            tense: [
                [0, 3, 6, 9, 12],       // Cdim7 + octave
                [2, 5, 8, 11, 13],      // Ddim7 + b9
                [7, 10, 13, 16, 19],    // Gdim7 + tension
                [1, 4, 7, 10, 13],      // C#dim7 + b9
                [8, 11, 14, 17, 20],    // G#dim7
                [3, 6, 9, 12, 15],      // Ebdim7
                [5, 8, 11, 14, 17],     // Fdim7
                [0, 3, 6, 9, 11]        // Cdim7 + maj7
            ],
            epic: [
                [0, 7, 12, 16, 19],     // C5 add9
                [-2, 5, 10, 14, 17],    // Bb5 add9
                [5, 12, 17, 21, 24],    // F5 add9
                [3, 10, 15, 19, 22],    // Eb5 add9
                [7, 14, 19, 23, 26],    // G5 add9
                [2, 9, 14, 18, 21],     // D5 add9
                [-5, 2, 7, 11, 14],     // G5/B
                [0, 7, 12, 16, 19]      // C5 add9
            ]
        };
        
        // Additional musical elements
        this.bassPatterns = {
            peaceful: [0, 0, 5, 5, 7, 7, 5, 5],
            mysterious: [0, 0, -2, 0, 3, 3, 5, 3],
            tense: [0, 1, 0, -1, 0, 1, 3, 1],
            epic: [0, 0, 0, 0, -2, -2, 5, 5]
        };
        
        this.arpeggioPatterns = {
            peaceful: [0, 4, 7, 11, 14, 11, 7, 4],
            mysterious: [0, 3, 7, 10, 14, 10, 7, 3],
            tense: [0, 3, 6, 9, 6, 3, 0, -3],
            epic: [0, 7, 12, 16, 19, 16, 12, 7]
        };
        
        this.currentChordIndex = 0;
        this.chordChangeInterval = null;
    }
    
    async init() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master gain
        this.masterGain = this.context.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.context.currentTime);
        
        // Create analyser for visualization
        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = 256;
        this.visualDataArray = new Uint8Array(this.analyser.frequencyBinCount);
        
        // Create effects chain
        await this.createEffects();
        
        // Connect effects chain is now handled in createEffects()
        this.analyser.connect(this.context.destination);
        
        // Initialize tracks
        this.initializeTracks();
    }
    
    async createEffects() {
        // Space filter - gentle high-frequency rolloff
        this.filter = this.context.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.setValueAtTime(8000, this.context.currentTime);
        this.filter.Q.setValueAtTime(0.5, this.context.currentTime);
        
        // Compressor for dynamic control
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-24, this.context.currentTime);
        this.compressor.knee.setValueAtTime(30, this.context.currentTime);
        this.compressor.ratio.setValueAtTime(12, this.context.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.context.currentTime);
        this.compressor.release.setValueAtTime(0.25, this.context.currentTime);
        
        // Stereo widener
        this.widener = this.createStereoWidener();
        
        // Delay for space echo
        this.delay = this.context.createDelay(5.0);
        this.delay.delayTime.setValueAtTime(0.3, this.context.currentTime);
        
        const delayFeedback = this.context.createGain();
        delayFeedback.gain.setValueAtTime(0.4, this.context.currentTime);
        
        const delayFilter = this.context.createBiquadFilter();
        delayFilter.type = 'lowpass';
        delayFilter.frequency.setValueAtTime(4000, this.context.currentTime);
        
        const delayWetGain = this.context.createGain();
        delayWetGain.gain.setValueAtTime(0.25, this.context.currentTime);
        
        this.delay.connect(delayFilter);
        delayFilter.connect(delayFeedback);
        delayFeedback.connect(this.delay);
        this.delay.connect(delayWetGain);
        
        // Create better reverb using multiple impulses
        this.reverb = this.context.createConvolver();
        this.reverb.buffer = this.createAdvancedReverbImpulse(5, 3, false);
        
        // Dry/wet mix for reverb
        const reverbWetGain = this.context.createGain();
        reverbWetGain.gain.setValueAtTime(0.35, this.context.currentTime);
        this.reverb.connect(reverbWetGain);
        
        // Connect new effects chain
        this.masterGain.connect(this.filter);
        this.filter.connect(this.compressor);
        this.compressor.connect(this.widener.input);
        this.widener.output.connect(this.delay);
        this.widener.output.connect(this.reverb);
        
        // Create mixer for dry and wet signals
        this.wetMixer = this.context.createGain();
        this.dryMixer = this.context.createGain();
        this.dryMixer.gain.setValueAtTime(0.7, this.context.currentTime);
        this.wetMixer.gain.setValueAtTime(0.3, this.context.currentTime);
        
        // Dry path
        this.widener.output.connect(this.dryMixer);
        
        // Wet path
        delayWetGain.connect(this.wetMixer);
        reverbWetGain.connect(this.wetMixer);
        
        // Final output
        this.dryMixer.connect(this.analyser);
        this.wetMixer.connect(this.analyser);
    }
    
    createStereoWidener() {
        const splitter = this.context.createChannelSplitter(2);
        const merger = this.context.createChannelMerger(2);
        
        // Delay one channel slightly for width
        const delayL = this.context.createDelay(0.03);
        const delayR = this.context.createDelay(0.03);
        delayL.delayTime.setValueAtTime(0.01, this.context.currentTime);
        delayR.delayTime.setValueAtTime(0.015, this.context.currentTime);
        
        // Connect
        splitter.connect(delayL, 0);
        splitter.connect(delayR, 1);
        delayL.connect(merger, 0, 0);
        delayR.connect(merger, 0, 1);
        
        return {
            input: splitter,
            output: merger
        };
    }
    
    createAdvancedReverbImpulse(duration, decay, reverse) {
        const sampleRate = this.context.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.context.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                // More complex impulse with early reflections
                let sample;
                
                if (i < sampleRate * 0.1) {
                    // Early reflections
                    sample = (Math.random() * 2 - 1) * Math.pow(1 - i / (sampleRate * 0.1), 0.5);
                } else {
                    // Diffuse reverb tail
                    sample = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
                }
                
                // Add slight stereo difference
                if (channel === 1) {
                    sample *= 0.95;
                }
                
                if (reverse) sample *= i / length;
                channelData[i] = sample;
            }
        }
        
        return impulse;
    }
    
    createReverbImpulse(duration, decay, reverse) {
        const sampleRate = this.context.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.context.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                let sample = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
                if (reverse) sample *= i / length;
                channelData[i] = sample;
            }
        }
        
        return impulse;
    }
    
    initializeTracks() {
        // Enhanced track configurations with richer layers
        this.tracks = {
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
        };
    }
    
    play(trackName = 'exploration') {
        if (this.isPlaying && this.currentTrack === trackName) return;
        
        // Resume context if suspended
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        
        // Crossfade to new track
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
            }, 8000); // Change every 8 seconds
        }
    }
    
    stop() {
        if (!this.isPlaying) return;
        
        // Fade out all active layers
        this.activeLayers.forEach((layer, id) => {
            if (layer.gainNode) {
                layer.gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 2);
                setTimeout(() => this.stopLayer(id), 2000);
            }
        });
        
        // Stop chord progression
        if (this.chordChangeInterval) {
            clearInterval(this.chordChangeInterval);
            this.chordChangeInterval = null;
        }
        
        this.isPlaying = false;
    }
    
    startTrack(trackName) {
        const track = this.tracks[trackName];
        if (!track) return;
        
        track.layers.forEach((layerConfig, index) => {
            const layerId = `${trackName}_${index}`;
            this.startLayer(layerId, layerConfig, track.mood);
        });
    }
    
    startLayer(id, config, mood) {
        // Stop existing layer if any
        this.stopLayer(id);
        
        const layer = {
            config,
            nodes: [],
            gainNode: this.context.createGain()
        };
        
        // Set initial gain
        layer.gainNode.gain.setValueAtTime(0, this.context.currentTime);
        layer.gainNode.gain.linearRampToValueAtTime(config.gain, this.context.currentTime + 2);
        layer.gainNode.connect(this.masterGain);
        
        // Create layer based on type
        switch (config.type) {
            case 'drone':
                this.createDroneLayer(layer, config);
                break;
            case 'pad':
                this.createPadLayer(layer, config, mood);
                break;
            case 'shimmer':
                this.createShimmerLayer(layer, config);
                break;
            case 'sub':
                this.createSubBassLayer(layer, config);
                break;
            case 'pulse':
                this.createPulseLayer(layer, config);
                break;
            case 'mechanical':
                this.createMechanicalLayer(layer, config);
                break;
            case 'chime':
                this.createChimeLayer(layer, config);
                break;
            case 'dissonance':
                this.createDissonanceLayer(layer, config);
                break;
            case 'warning':
                this.createWarningLayer(layer, config);
                break;
            case 'rhythm':
                this.createRhythmLayer(layer, config);
                break;
            case 'lead':
                this.createLeadLayer(layer, config, mood);
                break;
            case 'alarm':
                this.createAlarmLayer(layer, config);
                break;
            case 'heartbeat':
                this.createHeartbeatLayer(layer, config);
                break;
            case 'static':
                this.createStaticLayer(layer, config);
                break;
            case 'harmonic':
                this.createHarmonicLayer(layer, config);
                break;
            case 'arpeggio':
                this.createArpeggioLayer(layer, config, mood);
                break;
            case 'bass_line':
                this.createBassLineLayer(layer, config, mood);
                break;
            case 'whisper':
                this.createWhisperLayer(layer, config);
                break;
            case 'breath':
                this.createBreathLayer(layer, config);
                break;
            case 'hydraulic':
                this.createHydraulicLayer(layer, config);
                break;
            case 'comm_chatter':
                this.createCommChatterLayer(layer, config);
                break;
            case 'air_flow':
                this.createAirFlowLayer(layer, config);
                break;
            case 'cluster':
                this.createClusterLayer(layer, config);
                break;
            case 'radar_sweep':
                this.createRadarSweepLayer(layer, config);
                break;
            case 'tension_riser':
                this.createTensionRiserLayer(layer, config);
                break;
            case 'percussion':
                this.createPercussionLayer(layer, config, mood);
                break;
            case 'power_chord':
                this.createPowerChordLayer(layer, config);
                break;
            case 'brass_stab':
                this.createBrassStabLayer(layer, config);
                break;
            case 'explosion_rumble':
                this.createExplosionRumbleLayer(layer, config);
                break;
            case 'siren':
                this.createSirenLayer(layer, config);
                break;
            case 'breathing':
                this.createBreathingLayer(layer, config);
                break;
            case 'system_beep':
                this.createSystemBeepLayer(layer, config);
                break;
            case 'radio_static':
                this.createRadioStaticLayer(layer, config);
                break;
            case 'metal_stress':
                this.createMetalStressLayer(layer, config);
                break;
            case 'anxiety_pulse':
                this.createAnxietyPulseLayer(layer, config);
                break;
        }
        
        this.activeLayers.set(id, layer);
    }
    
    createDroneLayer(layer, config) {
        const osc = this.context.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(config.frequency, this.context.currentTime);
        if (config.detune) osc.detune.setValueAtTime(config.detune, this.context.currentTime);
        
        // Add subtle frequency modulation
        const lfo = this.context.createOscillator();
        const lfoGain = this.context.createGain();
        lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.05, this.context.currentTime);
        lfoGain.gain.setValueAtTime(config.frequency * 0.01, this.context.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        osc.connect(layer.gainNode);
        
        osc.start();
        lfo.start();
        
        layer.nodes.push(osc, lfo);
    }
    
    createPadLayer(layer, config, mood) {
        config.frequencies.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            osc.type = 'sawtooth';
            
            // Use chord progression
            const chordOffset = this.getCurrentChordOffset(mood, i);
            osc.frequency.setValueAtTime(freq * Math.pow(2, chordOffset / 12), this.context.currentTime);
            
            // Individual oscillator gain
            const oscGain = this.context.createGain();
            oscGain.gain.setValueAtTime(0.3, this.context.currentTime);
            
            // Filter for warmth
            const filter = this.context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000 + i * 200, this.context.currentTime);
            filter.Q.setValueAtTime(2, this.context.currentTime);
            
            // LFO for filter movement
            const filterLfo = this.context.createOscillator();
            const filterLfoGain = this.context.createGain();
            filterLfo.frequency.setValueAtTime(0.2 + i * 0.1, this.context.currentTime);
            filterLfoGain.gain.setValueAtTime(300, this.context.currentTime);
            
            filterLfo.connect(filterLfoGain);
            filterLfoGain.connect(filter.frequency);
            
            osc.connect(filter);
            filter.connect(oscGain);
            oscGain.connect(layer.gainNode);
            
            osc.start();
            filterLfo.start();
            
            layer.nodes.push(osc, filterLfo);
        });
    }
    
    createShimmerLayer(layer, config) {
        // Create multiple high-frequency oscillators with slow random panning
        for (let i = 0; i < 4; i++) {
            const osc = this.context.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(config.baseFreq + Math.random() * 1000, this.context.currentTime);
            
            // Amplitude envelope
            const envelope = this.context.createGain();
            envelope.gain.setValueAtTime(0, this.context.currentTime);
            
            // Random fade in/out pattern
            const fadeIn = () => {
                const now = this.context.currentTime;
                envelope.gain.linearRampToValueAtTime(0.5, now + 2);
                envelope.gain.linearRampToValueAtTime(0, now + 5);
                setTimeout(fadeIn, (8 + Math.random() * 4) * 1000);
            };
            
            setTimeout(fadeIn, i * 2000);
            
            // Panning
            const panner = this.context.createStereoPanner();
            const panLfo = this.context.createOscillator();
            panLfo.frequency.setValueAtTime(0.05 + Math.random() * 0.1, this.context.currentTime);
            panLfo.connect(panner.pan);
            
            osc.connect(envelope);
            envelope.connect(panner);
            panner.connect(layer.gainNode);
            
            osc.start();
            panLfo.start();
            
            layer.nodes.push(osc, panLfo);
        }
    }
    
    createSubBassLayer(layer, config) {
        const osc = this.context.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(config.frequency, this.context.currentTime);
        
        // Subtle pitch bend
        const pitchLfo = this.context.createOscillator();
        const pitchLfoGain = this.context.createGain();
        pitchLfo.frequency.setValueAtTime(0.03, this.context.currentTime);
        pitchLfoGain.gain.setValueAtTime(config.frequency * 0.005, this.context.currentTime);
        
        pitchLfo.connect(pitchLfoGain);
        pitchLfoGain.connect(osc.frequency);
        
        osc.connect(layer.gainNode);
        
        osc.start();
        pitchLfo.start();
        
        layer.nodes.push(osc, pitchLfo);
    }
    
    createPulseLayer(layer, config) {
        const osc = this.context.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(config.frequency, this.context.currentTime);
        
        // Rhythmic gate
        const gate = this.context.createGain();
        gate.gain.setValueAtTime(0, this.context.currentTime);
        
        const pulseRate = 2; // Hz
        const pulse = () => {
            const now = this.context.currentTime;
            gate.gain.setValueAtTime(0, now);
            gate.gain.linearRampToValueAtTime(0.5, now + 0.05);
            gate.gain.linearRampToValueAtTime(0, now + 0.1);
            setTimeout(pulse, 1000 / pulseRate);
        };
        pulse();
        
        osc.connect(gate);
        gate.connect(layer.gainNode);
        
        osc.start();
        layer.nodes.push(osc);
    }
    
    createMechanicalLayer(layer, config) {
        // Industrial humming sound
        const osc = this.context.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(config.frequency, this.context.currentTime);
        
        // Comb filter for metallic sound
        const delay = this.context.createDelay();
        delay.delayTime.setValueAtTime(1 / config.frequency, this.context.currentTime);
        
        const feedback = this.context.createGain();
        feedback.gain.setValueAtTime(0.8, this.context.currentTime);
        
        const filter = this.context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(config.frequency * 4, this.context.currentTime);
        filter.Q.setValueAtTime(10, this.context.currentTime);
        
        osc.connect(filter);
        filter.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(layer.gainNode);
        
        osc.start();
        layer.nodes.push(osc);
    }
    
    createChimeLayer(layer, config) {
        config.frequencies.forEach((freq, i) => {
            const playChime = () => {
                const osc = this.context.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.context.currentTime);
                
                const envelope = this.context.createGain();
                const now = this.context.currentTime;
                envelope.gain.setValueAtTime(0, now);
                envelope.gain.linearRampToValueAtTime(0.3, now + 0.01);
                envelope.gain.exponentialRampToValueAtTime(0.001, now + 3);
                
                osc.connect(envelope);
                envelope.connect(layer.gainNode);
                
                osc.start(now);
                osc.stop(now + 3);
                
                // Schedule next chime
                setTimeout(playChime, (10 + Math.random() * 20) * 1000);
            };
            
            // Start each chime at different times
            setTimeout(playChime, i * 3000 + Math.random() * 5000);
        });
    }
    
    createDissonanceLayer(layer, config) {
        config.frequencies.forEach(freq => {
            const osc = this.context.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, this.context.currentTime);
            
            // Detune for dissonance
            osc.detune.setValueAtTime(Math.random() * 30 - 15, this.context.currentTime);
            
            // Ring modulator effect
            const modulator = this.context.createOscillator();
            modulator.frequency.setValueAtTime(freq * 1.01, this.context.currentTime);
            
            const ringMod = this.context.createGain();
            ringMod.gain.setValueAtTime(0, this.context.currentTime);
            
            modulator.connect(ringMod.gain);
            osc.connect(ringMod);
            ringMod.connect(layer.gainNode);
            
            osc.start();
            modulator.start();
            
            layer.nodes.push(osc, modulator);
        });
    }
    
    createWarningLayer(layer, config) {
        const osc = this.context.createOscillator();
        osc.type = 'square';
        
        // Siren effect
        const freqLfo = this.context.createOscillator();
        const freqLfoGain = this.context.createGain();
        freqLfo.frequency.setValueAtTime(2, this.context.currentTime);
        freqLfoGain.gain.setValueAtTime(config.frequency * 0.5, this.context.currentTime);
        
        freqLfo.connect(freqLfoGain);
        freqLfoGain.connect(osc.frequency);
        osc.frequency.setValueAtTime(config.frequency, this.context.currentTime);
        
        // Intermittent beeping
        const gate = this.context.createGain();
        const beep = () => {
            const now = this.context.currentTime;
            gate.gain.setValueAtTime(0.3, now);
            gate.gain.setValueAtTime(0, now + 0.2);
            setTimeout(beep, 1000);
        };
        beep();
        
        osc.connect(gate);
        gate.connect(layer.gainNode);
        
        osc.start();
        freqLfo.start();
        
        layer.nodes.push(osc, freqLfo);
    }
    
    createRhythmLayer(layer, config) {
        // Kick drum synthesis
        const createKick = () => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            const now = this.context.currentTime;
            osc.frequency.setValueAtTime(config.frequency, now);
            osc.frequency.exponentialRampToValueAtTime(config.frequency * 0.5, now + 0.1);
            
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            
            osc.connect(gain);
            gain.connect(layer.gainNode);
            
            osc.start(now);
            osc.stop(now + 0.5);
        };
        
        // Basic 4/4 pattern
        const pattern = () => {
            createKick();
            setTimeout(pattern, 60000 / 60); // 60 BPM
        };
        pattern();
    }
    
    createLeadLayer(layer, config, mood) {
        // Melodic sequence
        const scale = this.getScale(mood);
        let noteIndex = 0;
        
        const playNote = () => {
            const osc = this.context.createOscillator();
            osc.type = 'sine';
            
            const note = scale[noteIndex % scale.length];
            const octave = Math.floor(noteIndex / scale.length);
            const freq = config.frequencies[0] * Math.pow(2, (note + octave * 12) / 12);
            
            osc.frequency.setValueAtTime(freq, this.context.currentTime);
            
            const envelope = this.context.createGain();
            const now = this.context.currentTime;
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(0.2, now + 0.1);
            envelope.gain.exponentialRampToValueAtTime(0.001, now + 1);
            
            osc.connect(envelope);
            envelope.connect(layer.gainNode);
            
            osc.start(now);
            osc.stop(now + 1);
            
            noteIndex = (noteIndex + 1 + Math.floor(Math.random() * 3)) % (scale.length * 2);
            setTimeout(playNote, 2000 + Math.random() * 2000);
        };
        
        setTimeout(playNote, Math.random() * 4000);
    }
    
    createAlarmLayer(layer, config) {
        const osc = this.context.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(config.frequency, this.context.currentTime);
        
        // Rapid beeping
        const gate = this.context.createGain();
        const beep = () => {
            const now = this.context.currentTime;
            gate.gain.setValueAtTime(0.1, now);
            gate.gain.setValueAtTime(0, now + 0.05);
            setTimeout(beep, 100);
        };
        beep();
        
        osc.connect(gate);
        gate.connect(layer.gainNode);
        
        osc.start();
        layer.nodes.push(osc);
    }
    
    createHeartbeatLayer(layer, config) {
        const createBeat = () => {
            // Low frequency thump
            const osc = this.context.createOscillator();
            osc.type = 'sine';
            
            const now = this.context.currentTime;
            osc.frequency.setValueAtTime(config.frequency, now);
            osc.frequency.exponentialRampToValueAtTime(config.frequency * 0.5, now + 0.2);
            
            const envelope = this.context.createGain();
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(0.3, now + 0.05);
            envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            
            osc.connect(envelope);
            envelope.connect(layer.gainNode);
            
            osc.start(now);
            osc.stop(now + 0.3);
        };
        
        // Double beat pattern
        const pattern = () => {
            createBeat();
            setTimeout(createBeat, 200);
            setTimeout(pattern, 1200);
        };
        pattern();
    }
    
    createStaticLayer(layer, config) {
        // White noise generator
        const bufferSize = this.context.sampleRate * 2;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.context.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        // Filter for radio static effect
        const filter = this.context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, this.context.currentTime);
        filter.Q.setValueAtTime(1, this.context.currentTime);
        
        // Random volume fluctuations
        const staticGain = this.context.createGain();
        staticGain.gain.setValueAtTime(config.gain, this.context.currentTime);
        
        const fluctuate = () => {
            const now = this.context.currentTime;
            staticGain.gain.linearRampToValueAtTime(
                config.gain * (0.5 + Math.random() * 0.5), 
                now + 0.1
            );
            setTimeout(fluctuate, 100 + Math.random() * 200);
        };
        fluctuate();
        
        noise.connect(filter);
        filter.connect(staticGain);
        staticGain.connect(layer.gainNode);
        
        noise.start();
        layer.nodes.push(noise);
    }
    
    // New layer types for enhanced musical richness
    createHarmonicLayer(layer, config) {
        // Create rich harmonic series
        const fundamental = this.context.createOscillator();
        fundamental.type = 'sine';
        fundamental.frequency.setValueAtTime(config.baseFreq, this.context.currentTime);
        
        const harmonicGains = this.context.createGain();
        harmonicGains.gain.setValueAtTime(0.5, this.context.currentTime);
        fundamental.connect(harmonicGains);
        
        // Add harmonics
        config.harmonics.forEach((harmonic, i) => {
            if (i === 0) return; // Skip fundamental
            
            const osc = this.context.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(config.baseFreq * harmonic, this.context.currentTime);
            
            const gain = this.context.createGain();
            gain.gain.setValueAtTime(0.3 / harmonic, this.context.currentTime); // Decreasing amplitude
            
            osc.connect(gain);
            gain.connect(harmonicGains);
            osc.start();
            layer.nodes.push(osc);
        });
        
        harmonicGains.connect(layer.gainNode);
        fundamental.start();
        layer.nodes.push(fundamental);
    }
    
    createArpeggioLayer(layer, config, mood) {
        const pattern = this.arpeggioPatterns[config.pattern] || this.arpeggioPatterns.peaceful;
        let noteIndex = 0;
        let octave = 0;
        
        const playNote = () => {
            const osc = this.context.createOscillator();
            osc.type = 'sine';
            
            const semitone = pattern[noteIndex % pattern.length];
            const freq = config.baseFreq * Math.pow(2, (semitone + octave * 12) / 12);
            osc.frequency.setValueAtTime(freq, this.context.currentTime);
            
            const envelope = this.context.createGain();
            const now = this.context.currentTime;
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(0.3, now + 0.02);
            envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            
            // Add gentle filter sweep
            const filter = this.context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, now);
            filter.frequency.exponentialRampToValueAtTime(500, now + 0.3);
            
            osc.connect(filter);
            filter.connect(envelope);
            envelope.connect(layer.gainNode);
            
            osc.start(now);
            osc.stop(now + 0.3);
            
            noteIndex++;
            if (noteIndex % pattern.length === 0) {
                octave = (octave + 1) % 2;
            }
            
            setTimeout(playNote, 250 + Math.random() * 100);
        };
        
        setTimeout(playNote, Math.random() * 1000);
    }
    
    createBassLineLayer(layer, config, mood) {
        const pattern = this.bassPatterns[config.pattern] || this.bassPatterns.peaceful;
        let noteIndex = 0;
        
        const playBassNote = () => {
            const osc = this.context.createOscillator();
            osc.type = 'sawtooth';
            
            const semitone = pattern[noteIndex % pattern.length];
            const freq = config.baseFreq * Math.pow(2, semitone / 12);
            osc.frequency.setValueAtTime(freq, this.context.currentTime);
            
            // Add sub oscillator for thickness
            const subOsc = this.context.createOscillator();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(freq / 2, this.context.currentTime);
            
            const filter = this.context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, this.context.currentTime);
            filter.Q.setValueAtTime(5, this.context.currentTime);
            
            const envelope = this.context.createGain();
            const now = this.context.currentTime;
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(0.4, now + 0.05);
            envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            
            osc.connect(filter);
            subOsc.connect(filter);
            filter.connect(envelope);
            envelope.connect(layer.gainNode);
            
            osc.start(now);
            subOsc.start(now);
            osc.stop(now + 0.8);
            subOsc.stop(now + 0.8);
            
            noteIndex++;
            setTimeout(playBassNote, 1000);
        };
        
        playBassNote();
    }
    
    createWhisperLayer(layer, config) {
        // Ethereal whisper-like sounds
        config.frequencies.forEach((freq, i) => {
            const noise = this.createFilteredNoise('bandpass', freq, 50);
            const envelope = this.context.createGain();
            
            const whisper = () => {
                const now = this.context.currentTime;
                envelope.gain.setValueAtTime(0, now);
                envelope.gain.linearRampToValueAtTime(0.05, now + 1);
                envelope.gain.linearRampToValueAtTime(0, now + 3);
                setTimeout(whisper, 5000 + Math.random() * 5000);
            };
            
            noise.connect(envelope);
            envelope.connect(layer.gainNode);
            
            setTimeout(whisper, i * 2000);
        });
    }
    
    createBreathLayer(layer, config) {
        const breathe = () => {
            const noise = this.createFilteredNoise('lowpass', 500, 2);
            const envelope = this.context.createGain();
            
            const now = this.context.currentTime;
            // Inhale
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(0.1, now + 2);
            // Exhale
            envelope.gain.linearRampToValueAtTime(0, now + 4);
            
            noise.connect(envelope);
            envelope.connect(layer.gainNode);
            
            setTimeout(() => noise.stop(), 4000);
            setTimeout(breathe, 5000);
        };
        
        breathe();
    }
    
    createFilteredNoise(filterType, frequency, Q) {
        const bufferSize = this.context.sampleRate * 2;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.context.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        const filter = this.context.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.setValueAtTime(frequency, this.context.currentTime);
        filter.Q.setValueAtTime(Q, this.context.currentTime);
        
        noise.connect(filter);
        noise.start();
        
        return filter;
    }
    
    createHydraulicLayer(layer, config) {
        // Hydraulic hiss and clunk sounds
        const hiss = () => {
            const noise = this.createFilteredNoise('highpass', 2000, 1);
            const envelope = this.context.createGain();
            
            const now = this.context.currentTime;
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(0.08, now + 0.1);
            envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            
            // Add clunk
            const clunk = this.context.createOscillator();
            clunk.type = 'sawtooth';
            clunk.frequency.setValueAtTime(80, now);
            clunk.frequency.exponentialRampToValueAtTime(40, now + 0.1);
            
            const clunkGain = this.context.createGain();
            clunkGain.gain.setValueAtTime(0.2, now);
            clunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            
            noise.connect(envelope);
            clunk.connect(clunkGain);
            envelope.connect(layer.gainNode);
            clunkGain.connect(layer.gainNode);
            
            clunk.start(now);
            clunk.stop(now + 0.1);
            setTimeout(() => noise.stop(), 500);
            
            setTimeout(hiss, 3000 + Math.random() * 4000);
        };
        
        hiss();
    }
    
    createCommChatterLayer(layer, config) {
        // Radio communication chatter
        const chatter = () => {
            const noise = this.createFilteredNoise('bandpass', 1000 + Math.random() * 1000, 10);
            const envelope = this.context.createGain();
            
            // Create speech-like rhythm
            const now = this.context.currentTime;
            const duration = 2 + Math.random() * 2;
            let time = now;
            
            while (time < now + duration) {
                const burst = Math.random() * 0.1 + 0.05;
                envelope.gain.setValueAtTime(Math.random() * 0.03, time);
                time += burst;
                envelope.gain.setValueAtTime(0, time);
                time += Math.random() * 0.1;
            }
            
            noise.connect(envelope);
            envelope.connect(layer.gainNode);
            
            setTimeout(() => noise.stop(), duration * 1000);
            setTimeout(chatter, 8000 + Math.random() * 10000);
        };
        
        setTimeout(chatter, Math.random() * 5000);
    }
    
    createAirFlowLayer(layer, config) {
        const noise = this.createFilteredNoise('lowpass', 300, 0.5);
        const lfo = this.context.createOscillator();
        const lfoGain = this.context.createGain();
        
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.2, this.context.currentTime);
        lfoGain.gain.setValueAtTime(0.02, this.context.currentTime);
        
        const constantGain = this.context.createGain();
        constantGain.gain.setValueAtTime(config.gain, this.context.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(constantGain.gain);
        noise.connect(constantGain);
        constantGain.connect(layer.gainNode);
        
        lfo.start();
        layer.nodes.push(lfo);
    }
    
    createClusterLayer(layer, config) {
        // Dissonant note cluster
        for (let i = 0; i < 5; i++) {
            const osc = this.context.createOscillator();
            osc.type = 'sawtooth';
            
            const freq = config.baseFreq + (Math.random() - 0.5) * config.spread;
            osc.frequency.setValueAtTime(freq, this.context.currentTime);
            
            const gain = this.context.createGain();
            gain.gain.setValueAtTime(0.2, this.context.currentTime);
            
            osc.connect(gain);
            gain.connect(layer.gainNode);
            
            osc.start();
            layer.nodes.push(osc);
        }
    }
    
    createRadarSweepLayer(layer, config) {
        const sweep = () => {
            const osc = this.context.createOscillator();
            osc.type = 'sine';
            
            const now = this.context.currentTime;
            osc.frequency.setValueAtTime(2000, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.5);
            
            const envelope = this.context.createGain();
            envelope.gain.setValueAtTime(0.1, now);
            envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            
            // Add ping at the end
            const ping = this.context.createOscillator();
            ping.type = 'sine';
            ping.frequency.setValueAtTime(1000, now + 0.5);
            
            const pingEnv = this.context.createGain();
            pingEnv.gain.setValueAtTime(0, now + 0.5);
            pingEnv.gain.linearRampToValueAtTime(0.2, now + 0.51);
            pingEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            
            osc.connect(envelope);
            ping.connect(pingEnv);
            envelope.connect(layer.gainNode);
            pingEnv.connect(layer.gainNode);
            
            osc.start(now);
            osc.stop(now + 0.5);
            ping.start(now + 0.5);
            ping.stop(now + 0.8);
            
            setTimeout(sweep, 3000);
        };
        
        sweep();
    }
    
    createTensionRiserLayer(layer, config) {
        const riser = () => {
            const osc = this.context.createOscillator();
            osc.type = 'sawtooth';
            
            const filter = this.context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.Q.setValueAtTime(10, this.context.currentTime);
            
            const now = this.context.currentTime;
            const duration = 8;
            
            osc.frequency.setValueAtTime(55, now);
            osc.frequency.exponentialRampToValueAtTime(440, now + duration);
            
            filter.frequency.setValueAtTime(100, now);
            filter.frequency.exponentialRampToValueAtTime(5000, now + duration);
            
            const envelope = this.context.createGain();
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(config.gain, now + duration * 0.8);
            envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            osc.connect(filter);
            filter.connect(envelope);
            envelope.connect(layer.gainNode);
            
            osc.start(now);
            osc.stop(now + duration);
            
            setTimeout(riser, duration * 1000 + 5000);
        };
        
        setTimeout(riser, Math.random() * 10000);
    }
    
    createPercussionLayer(layer, config, mood) {
        let beatIndex = 0;
        const patterns = {
            combat: [1, 0, 0, 1, 0, 1, 0, 0],
            epic: [1, 0, 1, 0, 1, 0, 1, 0]
        };
        const pattern = patterns[config.pattern] || patterns.combat;
        
        const playBeat = () => {
            if (pattern[beatIndex % pattern.length] === 1) {
                // Kick
                const kick = this.context.createOscillator();
                kick.type = 'sine';
                
                const now = this.context.currentTime;
                kick.frequency.setValueAtTime(150, now);
                kick.frequency.exponentialRampToValueAtTime(50, now + 0.1);
                
                const kickEnv = this.context.createGain();
                kickEnv.gain.setValueAtTime(0.5, now);
                kickEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                
                kick.connect(kickEnv);
                kickEnv.connect(layer.gainNode);
                
                kick.start(now);
                kick.stop(now + 0.2);
                
                // Hi-hat
                const hihat = this.createFilteredNoise('highpass', 8000, 5);
                const hihatEnv = this.context.createGain();
                hihatEnv.gain.setValueAtTime(0.1, now);
                hihatEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                
                hihat.connect(hihatEnv);
                hihatEnv.connect(layer.gainNode);
                
                setTimeout(() => hihat.stop(), 50);
            }
            
            beatIndex++;
            setTimeout(playBeat, 250);
        };
        
        playBeat();
    }
    
    createPowerChordLayer(layer, config) {
        // Massive power chords
        config.frequencies.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, this.context.currentTime);
            
            // Add slight detuning for thickness
            const detune = (i - 1) * 3;
            osc.detune.setValueAtTime(detune, this.context.currentTime);
            
            const gain = this.context.createGain();
            gain.gain.setValueAtTime(0.3 / config.frequencies.length, this.context.currentTime);
            
            // Distortion-like effect
            const waveshaper = this.context.createWaveShaper();
            waveshaper.curve = this.makeDistortionCurve(20);
            
            osc.connect(waveshaper);
            waveshaper.connect(gain);
            gain.connect(layer.gainNode);
            
            osc.start();
            layer.nodes.push(osc);
        });
    }
    
    makeDistortionCurve(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        
        return curve;
    }
    
    createBrassStabLayer(layer, config) {
        const playStab = () => {
            config.frequencies.forEach((freq, i) => {
                const osc = this.context.createOscillator();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, this.context.currentTime);
                
                const filter = this.context.createBiquadFilter();
                filter.type = 'lowpass';
                filter.Q.setValueAtTime(5, this.context.currentTime);
                
                const now = this.context.currentTime;
                filter.frequency.setValueAtTime(100, now);
                filter.frequency.linearRampToValueAtTime(2000, now + 0.05);
                filter.frequency.exponentialRampToValueAtTime(500, now + 0.3);
                
                const envelope = this.context.createGain();
                envelope.gain.setValueAtTime(0, now);
                envelope.gain.linearRampToValueAtTime(0.3, now + 0.02);
                envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                
                osc.connect(filter);
                filter.connect(envelope);
                envelope.connect(layer.gainNode);
                
                osc.start(now);
                osc.stop(now + 0.3);
            });
            
            setTimeout(playStab, 2000 + Math.random() * 2000);
        };
        
        playStab();
    }
    
    createExplosionRumbleLayer(layer, config) {
        const rumble = () => {
            const noise = this.createFilteredNoise('lowpass', 60, 2);
            const envelope = this.context.createGain();
            
            const now = this.context.currentTime;
            envelope.gain.setValueAtTime(0.3, now);
            envelope.gain.exponentialRampToValueAtTime(0.001, now + 4);
            
            // Add sub frequency
            const sub = this.context.createOscillator();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(30 + Math.random() * 20, now);
            
            const subEnv = this.context.createGain();
            subEnv.gain.setValueAtTime(0.4, now);
            subEnv.gain.exponentialRampToValueAtTime(0.001, now + 4);
            
            noise.connect(envelope);
            sub.connect(subEnv);
            envelope.connect(layer.gainNode);
            subEnv.connect(layer.gainNode);
            
            sub.start(now);
            sub.stop(now + 4);
            setTimeout(() => noise.stop(), 4000);
            
            setTimeout(rumble, 10000 + Math.random() * 10000);
        };
        
        setTimeout(rumble, Math.random() * 5000);
    }
    
    createSirenLayer(layer, config) {
        const osc = this.context.createOscillator();
        osc.type = 'sawtooth';
        
        const lfo = this.context.createOscillator();
        const lfoGain = this.context.createGain();
        
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.5, this.context.currentTime);
        lfoGain.gain.setValueAtTime(config.frequency * 0.3, this.context.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.frequency.setValueAtTime(config.frequency, this.context.currentTime);
        
        const filter = this.context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(config.frequency, this.context.currentTime);
        filter.Q.setValueAtTime(10, this.context.currentTime);
        
        osc.connect(filter);
        filter.connect(layer.gainNode);
        
        osc.start();
        lfo.start();
        
        layer.nodes.push(osc, lfo);
    }
    
    createBreathingLayer(layer, config) {
        const breathe = () => {
            const noise = this.createFilteredNoise('lowpass', 400, 1);
            const envelope = this.context.createGain();
            
            const now = this.context.currentTime;
            // Inhale
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(0.15, now + 1.5);
            // Pause
            envelope.gain.setValueAtTime(0.15, now + 1.8);
            // Exhale
            envelope.gain.linearRampToValueAtTime(0, now + 3.5);
            
            noise.connect(envelope);
            envelope.connect(layer.gainNode);
            
            setTimeout(() => noise.stop(), 3500);
            setTimeout(breathe, 4000);
        };
        
        breathe();
    }
    
    createSystemBeepLayer(layer, config) {
        let freqIndex = 0;
        
        const beep = () => {
            const freq = config.frequencies[freqIndex % config.frequencies.length];
            const osc = this.context.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, this.context.currentTime);
            
            const envelope = this.context.createGain();
            const now = this.context.currentTime;
            envelope.gain.setValueAtTime(0.1, now);
            envelope.gain.setValueAtTime(0, now + 0.05);
            
            osc.connect(envelope);
            envelope.connect(layer.gainNode);
            
            osc.start(now);
            osc.stop(now + 0.05);
            
            freqIndex++;
            setTimeout(beep, 500 + Math.random() * 2000);
        };
        
        beep();
    }
    
    createRadioStaticLayer(layer, config) {
        const noise = this.createFilteredNoise('bandpass', 2500, 5);
        const envelope = this.context.createGain();
        
        // Random amplitude modulation
        const modulate = () => {
            const now = this.context.currentTime;
            envelope.gain.linearRampToValueAtTime(
                Math.random() * config.gain,
                now + 0.1
            );
            setTimeout(modulate, 50 + Math.random() * 150);
        };
        
        noise.connect(envelope);
        envelope.connect(layer.gainNode);
        
        modulate();
    }
    
    createMetalStressLayer(layer, config) {
        const creak = () => {
            const osc = this.context.createOscillator();
            osc.type = 'sawtooth';
            
            const now = this.context.currentTime;
            const startFreq = 100 + Math.random() * 100;
            osc.frequency.setValueAtTime(startFreq, now);
            osc.frequency.linearRampToValueAtTime(startFreq * 0.7, now + 0.5);
            
            const filter = this.context.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(startFreq * 2, now);
            filter.Q.setValueAtTime(20, now);
            
            const envelope = this.context.createGain();
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(0.1, now + 0.05);
            envelope.gain.linearRampToValueAtTime(0.05, now + 0.3);
            envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            
            osc.connect(filter);
            filter.connect(envelope);
            envelope.connect(layer.gainNode);
            
            osc.start(now);
            osc.stop(now + 0.5);
            
            setTimeout(creak, 3000 + Math.random() * 7000);
        };
        
        creak();
    }
    
    createAnxietyPulseLayer(layer, config) {
        const osc = this.context.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(0.5, this.context.currentTime); // Very slow
        
        const gainLfo = this.context.createGain();
        gainLfo.gain.setValueAtTime(config.gain, this.context.currentTime);
        
        const baseOsc = this.context.createOscillator();
        baseOsc.type = 'sine';
        baseOsc.frequency.setValueAtTime(60, this.context.currentTime);
        
        osc.connect(gainLfo.gain);
        baseOsc.connect(gainLfo);
        gainLfo.connect(layer.gainNode);
        
        osc.start();
        baseOsc.start();
        
        layer.nodes.push(osc, baseOsc);
    }
    
    stopLayer(id) {
        const layer = this.activeLayers.get(id);
        if (!layer) return;
        
        // Stop all nodes
        layer.nodes.forEach(node => {
            if (node.stop) {
                try {
                    node.stop();
                } catch (e) {
                    // Node might already be stopped
                }
            }
        });
        
        // Disconnect gain node
        if (layer.gainNode) {
            layer.gainNode.disconnect();
        }
        
        this.activeLayers.delete(id);
    }
    
    crossfadeTo(newTrack, duration = 3) {
        const oldTrack = this.currentTrack;
        
        // Fade out old layers
        this.activeLayers.forEach((layer, id) => {
            if (id.startsWith(oldTrack)) {
                layer.gainNode.gain.exponentialRampToValueAtTime(
                    0.001, 
                    this.context.currentTime + duration
                );
                setTimeout(() => this.stopLayer(id), duration * 1000);
            }
        });
        
        // Start new track
        setTimeout(() => this.startTrack(newTrack), duration * 500);
    }
    
    changeChord() {
        const track = this.tracks[this.currentTrack];
        if (!track) return;
        
        const progression = this.chordProgressions[track.mood];
        if (!progression) return;
        
        this.currentChordIndex = (this.currentChordIndex + 1) % progression.length;
        
        // Update pad layers with new chord
        this.activeLayers.forEach((layer, id) => {
            if (layer.config.type === 'pad' || layer.config.type === 'lead') {
                // Smooth transition to new frequencies
                // This would require storing oscillator references
                // For now, we'll let the existing notes play out
            }
        });
    }
    
    getCurrentChordOffset(mood, noteIndex) {
        const progression = this.chordProgressions[mood];
        if (!progression) return 0;
        
        const currentChord = progression[this.currentChordIndex];
        return currentChord[noteIndex % currentChord.length];
    }
    
    getScale(mood) {
        const scales = {
            peaceful: [0, 2, 4, 5, 7, 9, 11], // Major scale
            mysterious: [0, 2, 3, 5, 7, 8, 10], // Natural minor
            tense: [0, 1, 3, 4, 6, 7, 9, 10], // Diminished scale
            epic: [0, 2, 3, 5, 7, 8, 11] // Harmonic minor
        };
        
        return scales[mood] || scales.peaceful;
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.exponentialRampToValueAtTime(
                this.volume || 0.001, 
                this.context.currentTime + 0.1
            );
        }
    }
    
    getVisualizationData() {
        if (this.analyser && this.visualDataArray) {
            this.analyser.getByteFrequencyData(this.visualDataArray);
            return this.visualDataArray;
        }
        return null;
    }
    
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
        
        // Apply dynamic filter based on intensity
        if (this.filter) {
            const baseFreq = 8000;
            const targetFreq = baseFreq - (intensity * 6000);
            this.filter.frequency.exponentialRampToValueAtTime(
                targetFreq, 
                this.context.currentTime + 1
            );
        }
    }
}

// Export for use
window.MusicEngine = MusicEngine;
