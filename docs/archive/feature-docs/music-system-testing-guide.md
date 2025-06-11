# Cosmic Explorer Music System Testing Guide

## Overview

The enhanced music system features 5 dynamic tracks with 12-15 layers each, creating rich, evolving soundscapes that respond to gameplay. This guide helps you test and verify the music system is working correctly.

## Quick Test Commands

Open the browser console (F12) and run these commands:

### 1. Test Music Tracks

```javascript
// Play each track directly
window.audioManager.playMusic('exploration');  // Deep space, peaceful
window.audioManager.playMusic('station');      // Docked, safe
window.audioManager.playMusic('danger');       // Low health, threats
window.audioManager.playMusic('combat');       // In battle
window.audioManager.playMusic('pod');          // Emergency pod mode

// Check current track
console.log(window.audioManager.musicEngine.currentTrack);
```

### 2. Test Music Volume

```javascript
// Adjust music volume (0.0 to 1.0)
window.audioManager.setMusicVolume(0.8);
window.audioManager.setMasterVolume(1.0);

// Mute/unmute
window.audioManager.setMusicVolume(0);  // Mute
window.audioManager.setMusicVolume(0.5); // Restore
```

### 3. Test Dynamic Music Changes

```javascript
// Simulate game state changes
const testState = window.gameEngine.gameState;

// Test low health danger music
testState.player_stats.health = 25;
window.audioManager.updateMusicForGameState(testState);

// Test pod mode music
testState.player_stats.in_pod_mode = true;
window.audioManager.updateMusicForGameState(testState);

// Test station music
testState.player_stats.in_pod_mode = false;
testState.player_stats.health = 100;
testState.at_repair_location = true;
window.audioManager.updateMusicForGameState(testState);
```

### 4. Inspect Active Layers

```javascript
// See all active music layers
window.audioManager.musicEngine.activeLayers.forEach((layer, id) => {
    console.log(`Layer ${id}: ${layer.config.type} - gain: ${layer.config.gain}`);
});

// Count active layers
console.log(`Active layers: ${window.audioManager.musicEngine.activeLayers.size}`);
```

### 5. Test Visualization

```javascript
// Get visualization data
const vizData = window.audioManager.getVisualizationData();
console.log('Frequency data:', vizData);

// Check if visualizer is updating (should see changing values)
setInterval(() => {
    const data = window.audioManager.getVisualizationData();
    console.log('Bass:', data[0], 'Mid:', data[64], 'High:', data[100]);
}, 1000);
```

## Music Track Details

### 1. **Exploration Track** (12 layers)
- Deep drones at 55Hz and 82.5Hz
- Sub bass at 27.5Hz
- Layered pads with maj9 chords
- Harmonic series layers
- Arpeggios following peaceful patterns
- Dynamic bass line
- Shimmering high frequencies
- Whisper and breath effects

### 2. **Station Track** (11 layers)
- Station hum at 110Hz
- Mechanical/hydraulic sounds
- Musical chimes
- Communication chatter
- Air flow ambience
- Peaceful chord progressions

### 3. **Danger Track** (12 layers)
- Ominous drones with detuning
- Multiple pulse layers
- Dissonant harmonies
- Warning signals
- Radar sweep effects
- Tension riser sounds
- Cluster chords

### 4. **Combat Track** (14 layers)
- Powerful drones and sub bass
- Rhythmic pulses
- Percussion patterns
- Power chords with distortion
- Brass stab effects
- Epic lead melodies
- Explosion rumbles
- Siren warnings

### 5. **Pod Track** (12 layers)
- Emergency alarms
- Heartbeat rhythm
- Breathing sounds
- System beeps
- Radio static
- Metal stress creaking
- Anxiety pulse effects

## Troubleshooting

### Music Not Playing?

1. Check audio context state:
```javascript
console.log(window.audioManager.musicEngine.context.state);
// Should be "running", not "suspended"
```

2. Resume if suspended:
```javascript
window.audioManager.musicEngine.context.resume();
```

3. Check if music engine initialized:
```javascript
console.log(window.audioManager.musicEngine);
// Should show the MusicEngine object
```

### Music Not Changing?

1. Check current track:
```javascript
console.log(window.audioManager.musicEngine.currentTrack);
```

2. Force track change:
```javascript
window.audioManager.musicEngine.stop();
window.audioManager.musicEngine.play('combat');
```

3. Check game state detection:
```javascript
// During combat
console.log(window.gameEngine.gameState.in_combat);
// At station
console.log(window.gameEngine.gameState.at_repair_location);
```

### Performance Issues?

1. Check layer count:
```javascript
console.log(`Layers: ${window.audioManager.musicEngine.activeLayers.size}`);
// Should be 11-15 depending on track
```

2. Check CPU usage in Chrome DevTools Performance tab

3. Reduce layers if needed:
```javascript
// Stop specific layer types
window.audioManager.musicEngine.activeLayers.forEach((layer, id) => {
    if (layer.config.type === 'shimmer') {
        window.audioManager.musicEngine.stopLayer(id);
    }
});
```

## Advanced Testing

### Test Chord Progressions

```javascript
// See current chord progression
const track = window.audioManager.musicEngine.tracks[window.audioManager.musicEngine.currentTrack];
console.log('Mood:', track.mood);
console.log('Progression:', window.audioManager.musicEngine.chordProgressions[track.mood]);

// Force chord change
window.audioManager.musicEngine.changeChord();
```

### Test Individual Layer Types

```javascript
// Test specific layer creation
const testLayer = {
    config: { type: 'power_chord', frequencies: [110, 165, 220], gain: 0.1 },
    nodes: [],
    gainNode: window.audioManager.musicEngine.context.createGain()
};
testLayer.gainNode.connect(window.audioManager.musicEngine.masterGain);
testLayer.gainNode.gain.value = 0.1;

window.audioManager.musicEngine.createPowerChordLayer(testLayer, testLayer.config);
```

## Expected Behavior

1. **On Game Start**: Exploration music begins
2. **At Station**: Crossfades to station ambience
3. **Low Health (<30)**: Switches to danger track
4. **Combat Start**: Immediately plays combat music
5. **Pod Activation**: Emergency pod music with alarms
6. **Region Changes**: Music adapts to region theme

## Music Features to Listen For

1. **Smooth Crossfades**: 3-second transitions between tracks
2. **Chord Changes**: Every 8 seconds, harmonies shift
3. **Dynamic Layers**: Elements fade in/out over time
4. **Stereo Effects**: Sounds pan across stereo field
5. **Reverb & Delay**: Spacious echo effects
6. **Frequency Filtering**: Responds to game intensity

## Console Helpers

```javascript
// Music system status
function musicStatus() {
    const me = window.audioManager.musicEngine;
    console.log('=== Music Status ===');
    console.log('Playing:', me.isPlaying);
    console.log('Track:', me.currentTrack);
    console.log('Volume:', me.volume);
    console.log('Layers:', me.activeLayers.size);
    console.log('Context:', me.context.state);
}

// Test all tracks
async function testAllTracks() {
    const tracks = ['exploration', 'station', 'danger', 'combat', 'pod'];
    for (const track of tracks) {
        console.log(`Playing ${track}...`);
        window.audioManager.playMusic(track);
        await new Promise(r => setTimeout(r, 5000));
    }
}

// Layer breakdown
function layerBreakdown() {
    const layers = {};
    window.audioManager.musicEngine.activeLayers.forEach((layer, id) => {
        const type = layer.config.type;
        layers[type] = (layers[type] || 0) + 1;
    });
    console.table(layers);
}
```

Run `musicStatus()`, `testAllTracks()`, or `layerBreakdown()` to quickly check the system!

## Success Indicators

✅ Music plays immediately on game start  
✅ Smooth transitions between tracks  
✅ Rich, layered sound with multiple elements  
✅ Music responds to game events  
✅ Visualizer shows frequency data  
✅ No audio glitches or clicks  
✅ Performance remains smooth  

The enhanced music system transforms Cosmic Explorer into an immersive audio experience!
