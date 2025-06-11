// Cosmic Explorer Music System Debug Helper
// Paste this entire script into your browser console for easy music testing

window.musicDebug = {
    // Current status
    status: function() {
        const me = window.audioManager?.musicEngine;
        if (!me) {
            console.error('Music engine not found!');
            return;
        }
        
        console.log('%c=== 🎵 Music System Status ===', 'color: #00ffff; font-size: 16px');
        console.log('🎵 Playing:', me.isPlaying ? '✅ Yes' : '❌ No');
        console.log('🎵 Current Track:', me.currentTrack);
        console.log('🎵 Volume:', Math.round(me.volume * 100) + '%');
        console.log('🎵 Active Layers:', me.activeLayers.size);
        console.log('🎵 Audio Context:', me.context.state);
        console.log('🎵 Chord Index:', me.currentChordIndex);
        
        // Show layer breakdown
        const layers = {};
        me.activeLayers.forEach((layer, id) => {
            const type = layer.config.type;
            layers[type] = (layers[type] || 0) + 1;
        });
        console.log('%c🎵 Layer Types:', 'color: #ffff00');
        console.table(layers);
    },
    
    // Play specific track
    play: function(track) {
        const tracks = ['exploration', 'station', 'danger', 'combat', 'pod'];
        if (!track) {
            console.log('Available tracks:', tracks.join(', '));
            return;
        }
        if (!tracks.includes(track)) {
            console.error('Invalid track! Use:', tracks.join(', '));
            return;
        }
        console.log(`🎵 Playing ${track} music...`);
        window.audioManager.playMusic(track);
    },
    
    // Test all tracks
    testAll: async function(duration = 5000) {
        const tracks = ['exploration', 'station', 'danger', 'combat', 'pod'];
        console.log('%c🎵 Testing all music tracks...', 'color: #00ff00; font-size: 14px');
        
        for (const track of tracks) {
            console.log(`\n🎵 Now playing: ${track.toUpperCase()}`);
            window.audioManager.playMusic(track);
            
            // Show what makes this track unique
            setTimeout(() => {
                const trackInfo = window.audioManager.musicEngine.tracks[track];
                console.log(`   Mood: ${trackInfo.mood}`);
                console.log(`   Layers: ${trackInfo.layers.length}`);
                console.log(`   Special elements:`, 
                    trackInfo.layers
                        .filter(l => !['drone', 'pad', 'sub'].includes(l.type))
                        .map(l => l.type)
                        .join(', ')
                );
            }, 500);
            
            await new Promise(r => setTimeout(r, duration));
        }
        
        console.log('\n✅ Test complete! Returning to exploration music...');
        window.audioManager.playMusic('exploration');
    },
    
    // Volume controls
    volume: function(level) {
        if (level === undefined) {
            console.log('Current volume:', Math.round(window.audioManager.musicVolume * 100) + '%');
            return;
        }
        level = Math.max(0, Math.min(1, level));
        window.audioManager.setMusicVolume(level);
        console.log('🔊 Music volume set to:', Math.round(level * 100) + '%');
    },
    
    // Mute/unmute
    mute: function() {
        this._savedVolume = window.audioManager.musicVolume;
        window.audioManager.setMusicVolume(0);
        console.log('🔇 Music muted');
    },
    
    unmute: function() {
        window.audioManager.setMusicVolume(this._savedVolume || 0.5);
        console.log('🔊 Music unmuted');
    },
    
    // Simulate game states
    simulate: {
        exploration: function() {
            console.log('🚀 Simulating deep space exploration...');
            const state = window.gameEngine.gameState;
            state.player_stats.health = 100;
            state.player_stats.in_pod_mode = false;
            state.at_repair_location = false;
            state.in_combat = false;
            window.audioManager.updateMusicForGameState(state);
        },
        
        station: function() {
            console.log('🏭 Simulating station docking...');
            const state = window.gameEngine.gameState;
            state.at_repair_location = true;
            state.in_combat = false;
            window.audioManager.updateMusicForGameState(state);
        },
        
        danger: function() {
            console.log('⚠️ Simulating danger (low health)...');
            const state = window.gameEngine.gameState;
            state.player_stats.health = 25;
            state.at_repair_location = false;
            window.audioManager.updateMusicForGameState(state);
        },
        
        combat: function() {
            console.log('⚔️ Simulating combat...');
            const state = window.gameEngine.gameState;
            state.in_combat = true;
            state.player_stats.health = 75;
            window.audioManager.updateMusicForGameState(state);
        },
        
        pod: function() {
            console.log('🆘 Simulating emergency pod...');
            const state = window.gameEngine.gameState;
            state.player_stats.in_pod_mode = true;
            state.in_combat = false;
            window.audioManager.updateMusicForGameState(state);
        }
    },
    
    // Visualizer check
    visualizer: function() {
        console.log('📊 Checking audio visualizer...');
        let frames = 0;
        const interval = setInterval(() => {
            const data = window.audioManager.getVisualizationData();
            if (data) {
                const bass = data.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
                const mid = data.slice(50, 80).reduce((a, b) => a + b, 0) / 30;
                const high = data.slice(100, 128).reduce((a, b) => a + b, 0) / 28;
                
                console.log(`Frame ${frames}: Bass: ${Math.round(bass)}, Mid: ${Math.round(mid)}, High: ${Math.round(high)}`);
            }
            
            frames++;
            if (frames >= 5) {
                clearInterval(interval);
                console.log('✅ Visualizer data flowing correctly');
            }
        }, 200);
    },
    
    // Help
    help: function() {
        console.log('%c🎵 Cosmic Explorer Music Debug Helper', 'color: #00ffff; font-size: 18px; font-weight: bold');
        console.log('%cCommands:', 'color: #ffff00; font-size: 14px');
        console.log('  musicDebug.status()         - Show current music status');
        console.log('  musicDebug.play("combat")   - Play specific track');
        console.log('  musicDebug.testAll()        - Test all tracks (5 sec each)');
        console.log('  musicDebug.volume(0.8)      - Set volume (0-1)');
        console.log('  musicDebug.mute()           - Mute music');
        console.log('  musicDebug.unmute()         - Unmute music');
        console.log('  musicDebug.simulate.combat()- Simulate combat state');
        console.log('  musicDebug.simulate.danger()- Simulate low health');
        console.log('  musicDebug.simulate.pod()   - Simulate pod mode');
        console.log('  musicDebug.visualizer()     - Check visualizer data');
        console.log('\n%cExample:', 'color: #00ff00');
        console.log('  musicDebug.play("combat")   // Play combat music');
        console.log('  musicDebug.status()         // Check what\'s playing');
    }
};

// Show available commands
console.log('%c🎵 Music Debug Helper Loaded!', 'color: #00ffff; font-size: 16px; font-weight: bold');
console.log('Type: musicDebug.help() for commands');
console.log('Quick test: musicDebug.testAll()');

// Auto-show status
musicDebug.status();
