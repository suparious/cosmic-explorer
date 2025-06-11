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
    
    // Play weapon sounds based on weapon type
    playWeaponSound(weaponType) {
        switch(weaponType) {
            case 'laser_cannon':
                this.playLaserSound();
                break;
            case 'missile_launcher':
                this.playMissileSound();
                break;
            case 'precise_shot':
                this.playPreciseShotSound();
                break;
            case 'barrage':
                this.playBarrageSound();
                break;
            default:
                this.playLaserSound(); // Default attack sound
        }
    }
    
    // Play item pickup sounds based on rarity/value
    playItemPickup(itemValue) {
        if (itemValue > 300) {
            this.playRareItemSound();
        } else if (itemValue > 100) {
            this.playUncommonItemSound();
        } else {
            this.playCommonItemSound();
        }
    }
    
    // UI click sounds
    playUIClick() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 0.03);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.03);
    }
    
    // Warning sounds with different severities
    playWarning(severity = 'low') {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        switch(severity) {
            case 'critical':
                // Urgent alarm
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.15);
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.3);
                gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.5, audioContext.currentTime);
                break;
            case 'high':
                // Strong warning
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(440, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.4, audioContext.currentTime);
                break;
            default:
                // Low priority alert
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.2, audioContext.currentTime);
        }
        
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
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
    
    // Missile launch sound
    playMissileSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.8, audioContext.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        
        // Generate pink noise
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / data.length * 2);
        }
        
        const noise = audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(300, audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.8);
        filter.Q.setValueAtTime(5, audioContext.currentTime);
        
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.6, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.8);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        noise.start();
    }
    
    // Precise shot sound - focused energy beam
    playPreciseShotSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.3);
        
        // Add subtle modulation
        const lfo = audioContext.createOscillator();
        const lfoGain = audioContext.createGain();
        lfo.frequency.setValueAtTime(30, audioContext.currentTime);
        lfoGain.gain.setValueAtTime(50, audioContext.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        lfo.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        lfo.stop(audioContext.currentTime + 0.3);
    }
    
    // Barrage sound - multiple rapid fire
    playBarrageSound() {
        const fireSound = () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(200 + Math.random() * 100, audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        };
        
        // Fire multiple shots
        fireSound();
        setTimeout(fireSound, 50);
        setTimeout(fireSound, 100);
        setTimeout(fireSound, 150);
        setTimeout(fireSound, 200);
    }
    
    // Item pickup sounds
    playCommonItemSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    playUncommonItemSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(783.99, audioContext.currentTime); // G5
        
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + 0.2);
        oscillator2.stop(audioContext.currentTime + 0.2);
    }
    
    playRareItemSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const oscillator3 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Magical sparkle effect
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator1.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.3);
        
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 0.3);
        
        oscillator3.type = 'sine';
        oscillator3.frequency.setValueAtTime(1200, audioContext.currentTime);
        oscillator3.frequency.exponentialRampToValueAtTime(2400, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        oscillator3.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime + 0.05);
        oscillator3.start(audioContext.currentTime + 0.1);
        oscillator1.stop(audioContext.currentTime + 0.5);
        oscillator2.stop(audioContext.currentTime + 0.5);
        oscillator3.stop(audioContext.currentTime + 0.5);
    }
    
    // Trading sounds
    playPurchaseSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Cash register cha-ching
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1046.5, audioContext.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.2, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.05);
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.2, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
    
    playSellSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Coin drop sound
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    }
    
    // Quest sounds
    playQuestAcceptSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [261.63, 329.63, 392, 523.25]; // C4, E4, G4, C5
        
        notes.forEach((freq, i) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            
            const startTime = audioContext.currentTime + i * 0.1;
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(this.sfxVolume * this.masterVolume * 0.2, startTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.2);
        });
    }
    
    playQuestCompleteSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 - triumphant
        
        notes.forEach((freq, i) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            
            const startTime = audioContext.currentTime + i * 0.08;
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(this.sfxVolume * this.masterVolume * 0.3, startTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.5);
        });
        
        // Add a final flourish
        setTimeout(() => {
            const finalOsc = audioContext.createOscillator();
            const finalGain = audioContext.createGain();
            
            finalOsc.type = 'triangle';
            finalOsc.frequency.setValueAtTime(1046.5, audioContext.currentTime);
            
            finalGain.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.4, audioContext.currentTime);
            finalGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
            
            finalOsc.connect(finalGain);
            finalGain.connect(audioContext.destination);
            
            finalOsc.start(audioContext.currentTime);
            finalOsc.stop(audioContext.currentTime + 0.8);
        }, 400);
    }
    
    // Achievement sound
    playAchievementSound() {
        this.playQuestCompleteSound(); // Similar to quest complete but we could make it unique
    }
    
    // Low resource warnings
    playLowFuelWarning() {
        this.playWarning('high');
    }
    
    playLowHealthWarning() {
        this.playWarning('critical');
    }
    
    // Docking sound
    playDockingSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Mechanical clunk
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(40, audioContext.currentTime + 0.2);
        
        // Add metallic resonance
        const resonance = audioContext.createOscillator();
        resonance.type = 'triangle';
        resonance.frequency.setValueAtTime(240, audioContext.currentTime);
        
        const resonanceGain = audioContext.createGain();
        resonanceGain.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.1, audioContext.currentTime);
        resonanceGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.4, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        resonance.connect(resonanceGain);
        gainNode.connect(audioContext.destination);
        resonanceGain.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        resonance.start(audioContext.currentTime + 0.1);
        oscillator.stop(audioContext.currentTime + 0.2);
        resonance.stop(audioContext.currentTime + 0.4);
    }

}

// Export for use in other modules
window.AudioManager = AudioManager;
