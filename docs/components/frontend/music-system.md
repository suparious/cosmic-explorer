---
title: Music System
tags: [frontend, audio, music, procedural-generation]
created: 2025-06-11
updated: 2025-06-11
status: active
---

# Music System

## Overview

The Cosmic Explorer music system is a sophisticated procedural audio engine that generates dynamic, multi-layered soundscapes in real-time. Using only the Web Audio API with no external sound files, it creates immersive Eve Online-style ambient music that responds to game state changes.

**Key Features:**
- 5 dynamic music tracks (exploration, station, danger, combat, pod)
- 12-15 simultaneous layers per track
- Real-time procedural generation
- Smooth crossfades between tracks
- Advanced effects processing
- Game state-responsive adaptation

Parent: [[components/frontend/index|Frontend Components]]

## Architecture

### System Components

```
MusicEngine
├── Track System (5 tracks)
├── Layer Generators (23 types)
├── Chord Progression Engine
├── Effects Chain
└── State Manager
```

### Signal Flow

```
Track Layers → Master Gain → Filter → Compressor → Stereo Widener →
├── Dry Signal (70%)
└── Wet Signal (30%)
    ├── Delay (with feedback filter)
    └── Advanced Reverb (early + diffuse)
```

## Music Tracks

### 1. Exploration Track
**Mood**: Peaceful, expansive  
**Layers**: 12  
**When**: Default space travel

Key elements:
- Deep space drones (55Hz, 82.5Hz)
- Sub bass foundation (27.5Hz)
- maj9 and maj11 chord progressions
- Shimmering high frequencies
- Organic breath and whisper effects

### 2. Station Track
**Mood**: Safe, industrial  
**Layers**: 11  
**When**: Docked at stations

Key elements:
- Station hum (110Hz)
- Mechanical hydraulic sounds
- Musical chimes
- Communication chatter
- Peaceful harmonic progressions

### 3. Danger Track
**Mood**: Tense, ominous  
**Layers**: 12  
**When**: Low health (<30)

Key elements:
- Detuned ominous drones
- Multiple warning pulses
- Dissonant cluster chords
- Radar sweep effects
- Tension riser sounds

### 4. Combat Track
**Mood**: Epic, intense  
**Layers**: 14  
**When**: Active combat

Key elements:
- Powerful sub bass
- Driving percussion
- Distorted power chords
- Brass stab effects
- Explosion rumbles
- Epic lead melodies

### 5. Pod Track
**Mood**: Emergency, claustrophobic  
**Layers**: 12  
**When**: Ship destroyed, in escape pod

Key elements:
- Emergency alarms
- Heartbeat rhythm
- Life support breathing
- System error beeps
- Radio static
- Metal stress sounds

## Layer Types

The music engine supports 23 unique layer generators:

### Foundation Layers
- `drone` - Sustained bass tones
- `sub_bass` - Deep frequency foundation
- `pad` - Harmonic chord pads
- `harmonic` - Rich harmonic series

### Melodic Layers
- `arpeggio` - Dynamic note patterns
- `bass_line` - Rhythmic bass sequences
- `lead` - Melodic top lines

### Atmospheric Layers
- `shimmer` - High frequency sparkle
- `whisper` - Ethereal atmosphere
- `breath` - Organic ambience
- `air_flow` - Environmental sound

### Mechanical Layers
- `hydraulic` - Station machinery
- `comm_chatter` - Radio communications
- `pulse` - Rhythmic warnings
- `radar_sweep` - Scanning effects

### Combat Layers
- `percussion` - Drum patterns
- `power_chord` - Distorted chords
- `brass_stab` - Orchestral hits
- `explosion_rumble` - Deep impacts
- `siren` - Warning sounds

### Emergency Layers
- `alarm` - Alert sounds
- `breathing` - Life support
- `system_beep` - Computer sounds
- `radio_static` - Communication noise
- `metal_stress` - Hull creaking
- `anxiety_pulse` - Psychological tension

## Chord Progression System

### Progression Types

```javascript
chordProgressions = {
    peaceful: [
        ['C', 'maj9'], ['Em', 'm9'], ['Am', 'm11'], ['F', 'maj7#11'],
        ['G', 'maj13'], ['Dm', 'm9'], ['Bb', 'maj9'], ['C', 'maj']
    ],
    mysterious: [
        ['Am', 'm9'], ['F', 'maj7'], ['C', 'maj7'], ['E', 'maj'],
        ['Am', 'm'], ['Dm', 'm9'], ['G#dim', 'dim7'], ['Am', 'm']
    ],
    tense: [
        ['Am', 'm'], ['Bb', 'maj'], ['Ddim', 'dim'], ['E', 'maj'],
        ['F', 'maj7'], ['C#dim', 'dim7'], ['Dm', 'm7'], ['E7', '7']
    ],
    epic: [
        ['Am', 'm'], ['F', 'maj'], ['C', 'maj'], ['G', 'maj'],
        ['Dm', 'm'], ['Bb', 'maj'], ['F', 'maj'], ['E', 'maj']
    ]
}
```

### Chord Extensions
- 9ths, 11ths, 13ths for richness
- #11 for lydian brightness
- dim7 for tension
- Power chords (root + 5th) for combat

## Effects Processing

### Master Effects Chain

1. **Dynamic Compressor**
   - Threshold: -24dB
   - Ratio: 4:1
   - Controls dynamic range

2. **Stereo Widener**
   - Haas effect (20ms delay)
   - Creates spacious stereo field

3. **Space Reverb**
   - Early reflections (5-50ms)
   - Diffuse tail (300ms+)
   - 30% wet mix

4. **Filtered Delay**
   - 375ms delay time
   - Lowpass at 2000Hz
   - 0.4 feedback

## Integration

### Game State Response

```javascript
updateMusicForGameState(gameState) {
    let targetTrack = 'exploration';
    
    if (gameState.player_stats.in_pod_mode) {
        targetTrack = 'pod';
    } else if (gameState.in_combat) {
        targetTrack = 'combat';
    } else if (gameState.player_stats.health < 30) {
        targetTrack = 'danger';
    } else if (gameState.at_repair_location) {
        targetTrack = 'station';
    } else if (gameState.region) {
        targetTrack = this.getTrackForRegion(gameState.region);
    }
    
    this.playMusic(targetTrack);
}
```

### Volume Control

```javascript
// Master volume affects all audio
setMasterVolume(0.8);

// Music-specific volume
setMusicVolume(0.6);

// Individual layer volumes set in track config
```

## Performance Optimization

### Resource Management
- Single shared AudioContext
- Efficient node cleanup
- Limited simultaneous oscillators
- Optimized filter usage

### CPU Considerations
- ~15 active audio nodes per track
- Minimal memory footprint
- No audio file loading
- Real-time synthesis

## Testing & Debugging

### Console Commands

```javascript
// Check music status
window.audioManager.musicEngine.currentTrack
window.audioManager.musicEngine.activeLayers.size

// Force track changes
window.audioManager.playMusic('combat')

// Volume control
window.audioManager.setMusicVolume(0.8)

// Layer inspection
window.audioManager.musicEngine.activeLayers.forEach((l,id) => 
    console.log(id, l.config.type))
```

### Common Issues

| Issue | Solution |
|-------|----------|
| No music | Check AudioContext state, call resume() |
| Music not changing | Verify game state updates |
| Performance lag | Reduce layer count |
| Volume issues | Check master and music volumes |

## Technical Implementation

### Key Files
- `/static/js/musicEngine.js` - Core music engine
- `/static/js/audio.js` - Audio manager integration

### Dependencies
- Web Audio API
- No external libraries
- No sound files

### Browser Support
- Chrome: Full support
- Firefox: Full support
- Safari: May need user interaction
- Edge: Full support

## Future Enhancements

### Planned Features
- Location-specific themes
- Dynamic mixing based on multiple factors
- Musical stingers for events
- Adaptive layer activation

### Possible Additions
- Biome-specific variations
- Combat intensity levels
- Emotional state tracking
- Player choice music

## Related Systems

- [[audio-system|Sound Effects System]] - Procedural sound effects
- [[game-engine|Game Engine]] - State management
- [[renderer|Renderer]] - Audio visualization

---

*The music system represents one of Cosmic Explorer's most sophisticated features, providing AAA-quality procedural music generation entirely in the browser.*