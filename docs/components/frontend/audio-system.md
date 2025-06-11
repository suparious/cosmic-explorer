---
title: Audio System
tags: [frontend, audio, sound-effects, procedural-generation]
created: 2025-06-11
updated: 2025-06-11
status: active
---

# Audio System

## Overview

The Cosmic Explorer audio system provides over 20 procedurally generated sound effects that bring the game to life. Using only the Web Audio API with no external sound files, it creates dynamic, contextual audio feedback for every player action.

**Key Features:**
- 20+ unique sound effects
- Real-time procedural generation
- Contextual variation based on game state
- Weapon-specific combat sounds
- Rarity-based item pickup sounds
- UI interaction feedback
- Warning and alert systems

Parent: [[components/frontend/index|Frontend Components]]

## Architecture

### Core Components

```
AudioManager
├── Shared AudioContext
├── Master Gain Control
├── Sound Generators
│   ├── Combat Sounds
│   ├── UI Sounds
│   ├── Item Sounds
│   ├── Warning Sounds
│   └── Environmental Sounds
├── Music Engine Integration
└── Volume Management
```

### Audio Context Management

```javascript
class AudioManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        // Single shared context for all audio
    }
}
```

## Sound Categories

### Combat Sounds

#### Weapon Types
```javascript
playWeaponSound(weaponType) {
    switch(weaponType) {
        case 'laser_cannon':    // Classic pew-pew
        case 'missile_launcher': // Rocket whoosh
        case 'precise_shot':    // Focused beam
        case 'barrage':         // Rapid fire
    }
}
```

#### Sound Characteristics
- **Laser**: 1200Hz → 200Hz sweep (150ms)
- **Missile**: Pink noise + 100Hz sine
- **Precise Shot**: 2000Hz → 3000Hz modulated
- **Barrage**: 5 rapid shots (50ms each)

### Item Pickup Sounds

#### Value-Based Variation
```javascript
playItemPickup(itemValue) {
    if (itemValue < 100) {       // Common - simple beep
    } else if (itemValue < 300) { // Uncommon - harmonic chime
    } else {                      // Rare - magical sparkle
    }
}
```

#### Implementation Details
- **Common**: 440Hz triangle wave (100ms)
- **Uncommon**: 523Hz + 659Hz dual tone
- **Rare**: 3 oscillators with rising arpeggio

### UI Interaction Sounds

#### Click Feedback
```javascript
playUIClick() {
    // Subtle 2500Hz sine (30ms)
    // Non-intrusive confirmation
}
```

#### Auto-Applied To
- Action buttons
- Menu buttons
- Choice modals
- Any dynamically created buttons

### Warning Systems

#### Severity Levels
```javascript
playWarning(severity) {
    switch(severity) {
        case 'low':      // 600Hz triangle
        case 'high':     // 800Hz sawtooth
        case 'critical': // 440/880Hz alternating
    }
}
```

#### Specific Warnings
- **Low Fuel**: Triggers at <20% fuel
- **Low Health**: Triggers at <30% health
- **System Alerts**: General warnings

### Trading Sounds

#### Commerce Feedback
- **Purchase**: Cash register (880Hz + 1760Hz)
- **Sell**: Coin drop (1000Hz → 400Hz)
- **Trade Complete**: Success chime

### Quest & Achievement

#### Progression Sounds
- **Quest Accept**: 4-note ascending arpeggio
- **Quest Complete**: Triumphant fanfare
- **Achievement Unlock**: Extended success sound

### Environmental Sounds

#### Contextual Audio
- **Docking**: Mechanical clunk (80Hz thud + metallic ring)
- **Mining**: Industrial drilling (planned)
- **Scanning**: Sweep effect (planned)

## Sound Generation Techniques

### Oscillator Types

```javascript
// Basic waveforms
osc.type = 'sine';     // Pure tone
osc.type = 'square';   // Retro/digital
osc.type = 'sawtooth'; // Harsh/warning
osc.type = 'triangle'; // Soft/mellow
```

### Envelope Shaping

```javascript
// ADSR envelope
gain.setValueAtTime(0, time);           // Start
gain.linearRampToValueAtTime(1, time + 0.01); // Attack
gain.exponentialRampToValueAtTime(0.3, time + 0.1); // Decay/Sustain
gain.exponentialRampToValueAtTime(0.01, time + duration); // Release
```

### Noise Generation

```javascript
createWhiteNoise() {
    const buffer = this.context.createBuffer(1, sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleRate; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
}
```

### Filtering

```javascript
// Lowpass for warmth
filter.type = 'lowpass';
filter.frequency.value = 2000;

// Highpass for clarity
filter.type = 'highpass';
filter.frequency.value = 200;
```

## Integration Guide

### Event System Integration

```javascript
// In EffectsManager
handleEventEffects(event) {
    switch(event.type) {
        case 'combat':
            this.playWeaponSound(event.weaponType);
            break;
        case 'item_received':
            this.playItemPickup(event.value);
            break;
        case 'docking_complete':
            this.playDockingSound();
            break;
    }
}
```

### Volume Control

```javascript
// Master volume
audioManager.setMasterVolume(0.8);

// Category volumes
audioManager.setSFXVolume(1.0);
audioManager.setMusicVolume(0.6);
```

### Resource Monitoring

```javascript
// In HUD update
updateResourceWarnings() {
    if (fuel < 20 && !this.fuelWarned) {
        audioManager.playLowFuelWarning();
        this.fuelWarned = true;
    }
}
```

## Performance Optimization

### Best Practices
- Create nodes on-demand
- Disconnect after use
- Reuse buffers when possible
- Limit simultaneous sounds

### Memory Management
```javascript
// Auto-cleanup pattern
osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
};
```

## Testing & Debugging

### Console Testing

```javascript
// Test any sound directly
window.audioManager.playLaserSound();
window.audioManager.playItemPickup(500);
window.audioManager.playWarning('critical');

// Check audio context
window.audioManager.context.state; // Should be 'running'
```

### Common Issues

| Issue | Solution |
|-------|----------|
| No sound | Check context state, browser permissions |
| Crackling | Reduce simultaneous sounds |
| Too loud | Adjust master/category volumes |
| Missing sounds | Verify event integration |

## Future Enhancements

### Planned Sounds
- **Engine**: Continuous thrust while moving
- **Shield**: Energy field activation
- **Mining**: Drilling and extraction
- **Scanning**: Different results, different sounds
- **Enemies**: Type-specific sounds

### Advanced Features
- 3D spatial audio
- Dynamic range compression
- Reverb zones
- Doppler effects

## Related Systems

- [[music-system|Music System]] - Background music
- [[game-engine|Game Engine]] - Event triggers
- [[ui-components|UI Components]] - Button integration

## Implementation Files

- `/static/js/audio.js` - Main audio manager
- `/static/js/game.js` - Event integration
- `/static/js/ui.js` - UI sound hooks
- `/static/js/combat.js` - Combat audio

---

*The audio system enhances gameplay through immediate, contextual feedback, making every action feel impactful and responsive.*