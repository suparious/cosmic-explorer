// Audio Manager for Cosmic Explorer
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.musicVolume = GameConfig.audio.musicVolume;
        this.sfxVolume = GameConfig.audio.sfxVolume;
        this.masterVolume = GameConfig.audio.masterVolume;
        
        this.init();
    }
    
    init() {
        // Load sound effects
        this.sounds = {
            navigate: document.getElementById('sfx-navigate'),
            scan: document.getElementById('sfx-scan'),
            repair: document.getElementById('sfx-repair'),
            alert: document.getElementById('sfx-alert'),
            success: document.getElementById('sfx-success')
        };
        
        // Load background music
        this.music = document.getElementById('bg-music');
        
        // Set initial volumes
        this.updateVolumes();
    }
    
    updateVolumes() {
        // Update music volume
        if (this.music) {
            this.music.volume = this.musicVolume * this.masterVolume;
        }
        
        // Update sound effect volumes
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.volume = this.sfxVolume * this.masterVolume;
            }
        });
    }
    
    playSound(soundName) {
        // Use dynamic sound generation instead of files
        switch(soundName) {
            case 'navigate':
                this.playWarpSound();
                break;
            case 'scan':
                this.playScanSound();
                break;
            case 'repair':
                this.playRepairSound();
                break;
            case 'alert':
                this.playAlertSound();
                break;
            case 'success':
                this.playSuccessSound();
                break;
            default:
                console.log('Unknown sound:', soundName);
        }
    }
    
    playMusic() {
        // Generate ambient space music dynamically
        this.createAmbientMusic();
    }
    
    pauseMusic() {
        // Stop ambient music
        if (this.ambientContext) {
            this.ambientContext.close();
            this.ambientContext = null;
        }
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }
    
    // Create dynamic sound effects
    createDynamicSound(frequency, duration, type = 'sine') {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    // Specific dynamic sound effects
    playLaserSound() {
        this.createDynamicSound(440, 0.2, 'sawtooth');
    }
    
    playExplosionSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const bufferSize = audioContext.sampleRate * 0.5; // 0.5 second
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 5);
        }
        
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        source.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        source.start();
    }
    
    playWarpSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 1);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    }
    
    playAlertSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const duration = 0.3;
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator1.type = 'square';
        oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator2.type = 'square';
        oscillator2.frequency.setValueAtTime(600, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.3, audioContext.currentTime);
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime + duration / 2);
        oscillator1.stop(audioContext.currentTime + duration / 2);
        oscillator2.stop(audioContext.currentTime + duration);
    }
    
    playScanSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 0.3);
        oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.6);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);
    }
    
    playRepairSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 0.2);
        oscillator.frequency.linearRampToValueAtTime(300, audioContext.currentTime + 0.4);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
    }
    
    playSuccessSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
        
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime + 0.1);
        oscillator1.stop(audioContext.currentTime + 0.3);
        oscillator2.stop(audioContext.currentTime + 0.3);
    }
    
    createAmbientMusic() {
        // Create evolving ambient space music
        if (this.ambientContext) {
            this.ambientContext.close();
        }
        
        this.ambientContext = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = this.ambientContext;
        
        // Master gain for overall volume
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(this.musicVolume * this.masterVolume * 0.5, ctx.currentTime);
        masterGain.connect(ctx.destination);
        
        // Create layered ambient sounds
        this.ambientLayers = [];
        
        // Layer 1: Deep space drone with slow evolution
        const createDrone = (baseFreq, detune) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
            osc.detune.setValueAtTime(detune, ctx.currentTime);
            
            // Slow frequency evolution
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.frequency.setValueAtTime(0.05, ctx.currentTime);
            lfoGain.gain.setValueAtTime(baseFreq * 0.02, ctx.currentTime);
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start();
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, ctx.currentTime);
            filter.Q.setValueAtTime(5, ctx.currentTime);
            
            // Volume envelope
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 3);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            
            osc.start();
            this.ambientLayers.push({osc, gain, lfo});
        };
        
        // Create harmonic series
        createDrone(55, 0);      // Root
        createDrone(82.5, -5);   // Fifth
        createDrone(110, 5);     // Octave
        createDrone(137.5, -3);  // Major third
        
        // Layer 2: Shimmering high frequencies
        const createShimmer = () => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const panner = ctx.createStereoPanner();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(880 + Math.random() * 440, ctx.currentTime);
            
            // Random panning
            const panLfo = ctx.createOscillator();
            panLfo.frequency.setValueAtTime(0.2 + Math.random() * 0.3, ctx.currentTime);
            panLfo.connect(panner.pan);
            panLfo.start();
            
            // Amplitude modulation
            const ampLfo = ctx.createOscillator();
            const ampGain = ctx.createGain();
            ampLfo.frequency.setValueAtTime(0.1 + Math.random() * 0.2, ctx.currentTime);
            ampGain.gain.setValueAtTime(0.05, ctx.currentTime);
            ampLfo.connect(ampGain);
            ampGain.connect(gain.gain);
            ampLfo.start();
            
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            
            osc.connect(gain);
            gain.connect(panner);
            panner.connect(masterGain);
            
            osc.start();
            
            // Fade out and restart periodically
            setTimeout(() => {
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
                setTimeout(() => {
                    osc.stop();
                    if (this.ambientContext === ctx) {
                        createShimmer();
                    }
                }, 2000);
            }, 15000 + Math.random() * 10000);
        };
        
        // Create multiple shimmers
        for (let i = 0; i < 3; i++) {
            setTimeout(() => createShimmer(), i * 2000);
        }
        
        // Layer 3: Occasional cosmic "events"
        const createCosmicEvent = () => {
            if (this.ambientContext !== ctx) return;
            
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            osc.type = 'sawtooth';
            const baseFreq = 110 + Math.random() * 220;
            osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, ctx.currentTime + 4);
            
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, ctx.currentTime + 4);
            filter.Q.setValueAtTime(10, ctx.currentTime);
            
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.5);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 4);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            
            osc.start();
            osc.stop(ctx.currentTime + 4);
            
            // Schedule next event
            setTimeout(() => createCosmicEvent(), 20000 + Math.random() * 20000);
        };
        
        // Start cosmic events after a delay
        setTimeout(() => createCosmicEvent(), 10000);
    }
}

// Export for use in other modules
window.AudioManager = AudioManager;
