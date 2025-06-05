// Audio Manager for Cosmic Explorer
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.musicEngine = null;
        this.musicVolume = GameConfig.audio.musicVolume;
        this.sfxVolume = GameConfig.audio.sfxVolume;
        this.masterVolume = GameConfig.audio.masterVolume;
        this.currentMusicTrack = 'exploration';
        
        this.init();
    }
    
    async init() {
        // Initialize the advanced music engine
        this.musicEngine = new MusicEngine();
        await this.musicEngine.init();
        
        // Set initial volumes
        this.updateVolumes();
    }
    
    updateVolumes() {
        // Update music engine volume
        if (this.musicEngine) {
            this.musicEngine.setVolume(this.musicVolume * this.masterVolume);
        }
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
    
    playMusic(trackName = 'exploration') {
        // Play specified track using the music engine
        if (this.musicEngine) {
            this.currentMusicTrack = trackName;
            this.musicEngine.play(trackName);
        }
    }
    
    pauseMusic() {
        // Stop music using the music engine
        if (this.musicEngine) {
            this.musicEngine.stop();
        }
    }
    
    // Update music based on game state
    updateMusicForGameState(gameState) {
        if (this.musicEngine && gameState) {
            this.musicEngine.updateGameState(gameState);
        }
    }
    
    // Change music when entering a new region
    changeRegionMusic(regionMusicTheme) {
        if (this.musicEngine && regionMusicTheme) {
            // Map region themes to music tracks
            const themeMap = {
                'station': 'station',
                'danger': 'danger',
                'exploration': 'exploration',
                'combat': 'combat'
            };
            
            const trackName = themeMap[regionMusicTheme] || 'exploration';
            
            // Only change if different from current track
            if (trackName !== this.currentMusicTrack) {
                this.currentMusicTrack = trackName;
                this.musicEngine.play(trackName);
            }
        }
    }
    
    // Get visualization data for UI
    getVisualizationData() {
        if (this.musicEngine) {
            return this.musicEngine.getVisualizationData();
        }
        return null;
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

}

// Export for use in other modules
window.AudioManager = AudioManager;
