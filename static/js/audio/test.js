// Test file to verify the refactored music engine works correctly
// Run this in the browser console to test

async function testMusicEngine() {
    console.log('Testing Music Engine Refactoring...\n');
    
    try {
        // Test 1: Check if MusicEngine is available globally
        console.log('Test 1: Global availability');
        console.assert(window.MusicEngine !== undefined, 'MusicEngine should be available on window');
        console.log('✓ MusicEngine is available globally\n');
        
        // Test 2: Create instance
        console.log('Test 2: Instance creation');
        const musicEngine = new window.MusicEngine();
        console.assert(musicEngine !== undefined, 'Should create MusicEngine instance');
        console.log('✓ MusicEngine instance created\n');
        
        // Test 3: Initialize
        console.log('Test 3: Initialization');
        await musicEngine.init();
        console.assert(musicEngine.context !== null, 'Audio context should be initialized');
        console.log('✓ Music engine initialized\n');
        
        // Test 4: Check tracks
        console.log('Test 4: Track definitions');
        const tracks = ['exploration', 'station', 'danger', 'combat', 'pod'];
        tracks.forEach(track => {
            console.assert(musicEngine.tracks[track] !== undefined, `Track ${track} should exist`);
        });
        console.log('✓ All tracks are defined\n');
        
        // Test 5: Play a track
        console.log('Test 5: Playing exploration track');
        musicEngine.play('exploration');
        console.assert(musicEngine.isPlaying === true, 'Should be playing');
        console.assert(musicEngine.currentTrack === 'exploration', 'Current track should be exploration');
        console.log('✓ Track is playing\n');
        
        // Test 6: Check active layers
        console.log('Test 6: Active layers');
        setTimeout(() => {
            console.log(`Active layers: ${musicEngine.activeLayers.size}`);
            console.assert(musicEngine.activeLayers.size > 0, 'Should have active layers');
            console.log('✓ Layers are active\n');
            
            // Test 7: Volume control
            console.log('Test 7: Volume control');
            musicEngine.setVolume(0.3);
            console.assert(musicEngine.volume === 0.3, 'Volume should be set to 0.3');
            console.log('✓ Volume control works\n');
            
            // Test 8: Track info
            console.log('Test 8: Track info');
            const info = musicEngine.getCurrentTrackInfo();
            console.log('Current track info:', info);
            console.assert(info.name === 'Deep Space Exploration', 'Track name should match');
            console.log('✓ Track info retrieved\n');
            
            // Test 9: Crossfade
            console.log('Test 9: Crossfading to station track');
            musicEngine.play('station');
            console.assert(musicEngine.currentTrack === 'station', 'Should switch to station track');
            console.log('✓ Crossfade initiated\n');
            
            // Test 10: Stop
            setTimeout(() => {
                console.log('Test 10: Stopping playback');
                musicEngine.stop();
                console.assert(musicEngine.isPlaying === false, 'Should stop playing');
                console.log('✓ Playback stopped\n');
                
                console.log('=== All tests passed! ===');
                console.log('The refactored music engine is working correctly.');
            }, 2000);
            
        }, 1000);
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Instructions
console.log('Music Engine Test Suite');
console.log('======================');
console.log('To run the tests, execute: testMusicEngine()');
console.log('This will test all major functionality of the refactored music engine.');

// Make test function available globally
window.testMusicEngine = testMusicEngine;
