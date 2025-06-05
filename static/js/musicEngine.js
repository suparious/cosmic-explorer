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
        
        // Chord progressions for variety
        this.chordProgressions = {
            peaceful: [
                [0, 4, 7, 11],    // Cmaj7
                [5, 9, 12, 16],   // Fmaj7
                [7, 11, 14, 17],  // Gmaj7
                [2, 5, 9, 12]     // Dm7
            ],
            mysterious: [
                [0, 3, 7, 10],    // Cm7
                [5, 8, 12, 15],   // Fm7
                [7, 10, 14, 17],  // Gm7
                [3, 7, 10, 14]    // Ebmaj7
            ],
            tense: [
                [0, 3, 6, 9],     // Cdim7
                [2, 5, 8, 11],    // Ddim7
                [7, 10, 13, 16],  // Gdim7
                [1, 4, 7, 10]     // C#dim7
            ],
            epic: [
                [0, 7, 12, 16],   // C5 power chord with octave
                [5, 12, 17, 21],  // F5
                [7, 14, 19, 23],  // G5
                [3, 10, 15, 19]   // Eb5
            ]
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
        
        // Connect effects chain
        this.masterGain.connect(this.filter);
        this.filter.connect(this.delay);
        this.delay.connect(this.reverb);
        this.reverb.connect(this.analyser);
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
        
        // Delay for space echo
        this.delay = this.context.createDelay(5.0);
        this.delay.delayTime.setValueAtTime(0.3, this.context.currentTime);
        
        const delayFeedback = this.context.createGain();
        delayFeedback.gain.setValueAtTime(0.4, this.context.currentTime);
        
        const delayWetGain = this.context.createGain();
        delayWetGain.gain.setValueAtTime(0.3, this.context.currentTime);
        
        this.delay.connect(delayFeedback);
        delayFeedback.connect(this.delay);
        this.delay.connect(delayWetGain);
        
        // Create reverb using convolution
        this.reverb = this.context.createConvolver();
        this.reverb.buffer = this.createReverbImpulse(4, 2, false);
        
        // Dry/wet mix for reverb
        const reverbWetGain = this.context.createGain();
        reverbWetGain.gain.setValueAtTime(0.4, this.context.currentTime);
        this.reverb.connect(reverbWetGain);
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
        // Define track configurations
        this.tracks = {
            exploration: {
                name: 'Deep Space Exploration',
                mood: 'peaceful',
                layers: [
                    { type: 'drone', frequency: 55, detune: 0, gain: 0.15 },
                    { type: 'drone', frequency: 82.5, detune: -5, gain: 0.1 },
                    { type: 'pad', frequencies: [220, 330, 440], gain: 0.05 },
                    { type: 'shimmer', baseFreq: 880, gain: 0.03 },
                    { type: 'sub', frequency: 27.5, gain: 0.2 }
                ]
            },
            station: {
                name: 'Station Ambience',
                mood: 'peaceful',
                layers: [
                    { type: 'drone', frequency: 110, detune: 0, gain: 0.1 },
                    { type: 'pad', frequencies: [261.63, 329.63, 392], gain: 0.08 },
                    { type: 'mechanical', frequency: 60, gain: 0.05 },
                    { type: 'chime', frequencies: [523.25, 659.25, 783.99], gain: 0.02 }
                ]
            },
            danger: {
                name: 'Imminent Threat',
                mood: 'tense',
                layers: [
                    { type: 'drone', frequency: 55, detune: -10, gain: 0.2 },
                    { type: 'pulse', frequency: 110, gain: 0.1 },
                    { type: 'dissonance', frequencies: [220, 233.08, 246.94], gain: 0.05 },
                    { type: 'warning', frequency: 440, gain: 0.03 }
                ]
            },
            combat: {
                name: 'Battle Stations',
                mood: 'epic',
                layers: [
                    { type: 'drone', frequency: 55, detune: 0, gain: 0.25 },
                    { type: 'pulse', frequency: 110, gain: 0.15 },
                    { type: 'rhythm', frequency: 220, gain: 0.1 },
                    { type: 'lead', frequencies: [440, 550, 660], gain: 0.05 }
                ]
            },
            pod: {
                name: 'Emergency Pod',
                mood: 'tense',
                layers: [
                    { type: 'alarm', frequency: 880, gain: 0.02 },
                    { type: 'heartbeat', frequency: 60, gain: 0.15 },
                    { type: 'static', gain: 0.03 },
                    { type: 'drone', frequency: 110, detune: -20, gain: 0.1 }
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
