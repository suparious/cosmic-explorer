# Cosmic Explorer Architecture

This document describes the architecture and design of Cosmic Explorer.

## Overview

Cosmic Explorer is a space exploration game with two interfaces:
1. Terminal-based ASCII interface (deprecated)
2. Web-based graphical interface (current)

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Web Browser   │────▶│   Flask Server  │
│  (JavaScript)   │◀────│    (Python)     │
└─────────────────┘     └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │   Game Engine   │
         │              │    (Python)     │
         │              └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Canvas Renderer│     │   Game State    │
│   Particle FX   │     │   Save System   │
└─────────────────┘     └─────────────────┘
```

## Component Architecture

### Backend (Python)

#### Core Game Engine
- **game.py**: Main game loop and state management
- **regions.py**: Region and location generation
- **events.py**: Random events and encounters
- **navigation.py**: Movement and pathfinding logic

#### API Layer
- **api/app.py**: Flask application with REST and WebSocket endpoints
- Handles:
  - Game state synchronization
  - Action processing
  - Save/load operations
  - Real-time updates via WebSocket

#### Data Models
- Player stats (health, fuel, wealth, etc.)
- Inventory system
- Quest tracking
- Pod augmentations
- Ship systems

### Frontend (JavaScript)

#### Rendering Engine
- **static/js/renderer.js**: Canvas-based rendering system
  - 60 FPS game loop
  - Sprite rendering
  - Background parallax
  - UI overlays

#### Visual Effects
- **static/js/particles.js**: Particle system
  - Explosions
  - Thrust effects
  - Healing effects
  - Environmental particles

#### Audio System
- **static/js/audio.js**: Sound management
  - Background music
  - Sound effects
  - Volume controls
  - Audio pooling

#### UI Components
- **static/js/ui.js**: User interface elements
  - HUD display
  - Modal dialogs
  - Inventory screens
  - Quest log

#### Game Client
- **static/js/game.js**: Main game client
  - WebSocket communication
  - State synchronization
  - Input handling
  - Event dispatching

## Data Flow

### Game Action Flow
1. User input (click/keyboard) → JavaScript event handler
2. JavaScript → WebSocket message to server
3. Flask → Process action in game engine
4. Game engine → Update game state
5. Flask → Broadcast state update via WebSocket
6. JavaScript → Update UI and render new state

### Save/Load Flow
1. Save request → Flask API endpoint
2. Game engine → Serialize state to JSON
3. Write to `saves/save_game.json`
4. Load request → Read JSON file
5. Deserialize → Update game engine state
6. Broadcast new state to client

## Communication Protocol

### WebSocket Events

#### Client → Server
```javascript
{
  "event": "game_action",
  "data": {
    "action": "navigate",
    "target": 0
  }
}
```

#### Server → Client
```javascript
{
  "event": "game_update",
  "data": {
    "player": {...},
    "current_region": {...},
    "inventory": [...],
    "quests": [...]
  }
}
```

### REST API Endpoints

- `GET /` - Serve game client
- `GET /api/game/state` - Get current game state
- `POST /api/game/action` - Perform game action
- `POST /api/game/save` - Save game
- `POST /api/game/load` - Load game
- `POST /api/game/reset` - Reset game

## Performance Considerations

### Frontend
- Canvas rendering optimized for 60 FPS
- Particle pooling to reduce garbage collection
- Efficient sprite batching
- RequestAnimationFrame for smooth animation

### Backend
- Lightweight Flask server with eventlet
- Efficient state serialization
- Minimal database operations (file-based saves)
- WebSocket for real-time updates

## Security Considerations

- Input validation on all API endpoints
- No direct file system access from client
- Environment variables for configuration
- Safe JSON serialization
- WebSocket origin validation

## Extensibility

### Adding New Features
1. **New Game Mechanics**: Add to game engine (Python)
2. **New Visual Effects**: Extend particle system (JavaScript)
3. **New UI Components**: Add to ui.js and game.css
4. **New Regions/Events**: Extend regions.py and events.py

### Plugin System (Future)
- Planned modular system for:
  - Custom regions
  - New ship types
  - Additional augmentations
  - Community events

## Development Workflow

1. **Local Development**
   - Run Flask server: `python api/app.py`
   - Hot reload for Python changes
   - Browser refresh for JavaScript changes

2. **Testing**
   - Unit tests for game logic
   - Integration tests for API
   - Manual testing for UI/UX

3. **Deployment**
   - Single Flask application
   - Static file serving
   - WebSocket support required

## Future Enhancements

- Multiplayer support via WebSocket rooms
- Persistent world state
- Procedural universe generation
- mod.io integration for community content
- Steam Workshop support
- Mobile touch controls
- Cloud save synchronization
