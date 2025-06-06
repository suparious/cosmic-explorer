# Cosmic Explorer - Graphical Edition

A stunning space exploration game transformed from ASCII terminal graphics to a beautiful web-based experience!

## Features

### Visual Enhancements

- **Dynamic Space Environment**: Animated stars, colorful nebulae, and parallax effects
- **Smooth Ship Animations**: Real-time movement with particle thrust effects
- **Procedurally Generated Universe**: Planets, space stations, and asteroid fields
- **Visual Damage System**: Ship appearance changes based on condition
- **Particle Effects**: Explosions, healing, warp drive, and more
- **Glass-morphism UI**: Modern, translucent interface panels

### Audio System

- Dynamic sound effects for all actions
- Atmospheric space ambience music
- Procedural audio for special effects
- Volume controls for music, SFX, and master

### Gameplay Features

- Real-time WebSocket updates
- Smooth 60fps rendering
- Keyboard shortcuts for quick actions
- Visual quest indicators
- Critical stat warnings
- Choice modals for decisions
- Event log with timestamps

## Running the Game

### Prerequisites

- Python 3.8+
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone the repository:

```bash
cd /home/shaun/repos/cosmic-explorer
```

2. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

### Starting the Game

1. Run the Flask server:

```bash
# Linux/Mac:
./start_game.sh

# Windows:
start_game.bat

# Or manually:
python api/app.py
```

2. Open your browser and navigate to:

```
http://localhost:5000
```

3. Enjoy the game!

## Controls

### Mouse

- Click buttons to perform actions
- Navigate menus

### Keyboard (In-Game)

- `1` - Navigate to new location
- `2` - Scan area
- `3` - Repair ship (when at station)
- `4` - Open inventory
- `5` - View quests
- `6` - Open star map
- `ESC` - Return to main menu

## Architecture

### Backend (Python/Flask)

- `api/app.py` - Flask server with REST API and WebSocket support
- Original game logic preserved in Python files
- Real-time game state synchronization

### Frontend (HTML5/Canvas)

- `static/js/renderer.js` - Canvas rendering engine
- `static/js/particles.js` - Particle effects system
- `static/js/audio.js` - Sound management
- `static/js/ui.js` - UI components and HUD
- `static/js/game.js` - Main game engine

### Visual Design

- Dark space theme with neon accents
- Glassmorphism UI elements
- Smooth animations and transitions
- Responsive design for all screen sizes

## Development

### Adding New Features

1. **New Visual Effects**: Add to `particles.js`
2. **New Sound Effects**: Add to `audio.js`
3. **New UI Elements**: Modify `ui.js` and `game.css`
4. **New Game Actions**: Update `api/app.py` and `game.js`

### Customization

- Modify `static/js/config.js` for game settings
- Edit `static/css/game.css` for visual styling
- Update color schemes in CSS variables

## Credits

- Original ASCII version created with x.ai Grok-3
- Graphical transformation by Claude Opus 4
- Built with Flask, Socket.IO, and HTML5 Canvas

## Future Enhancements

- [ ] Sprite-based graphics (PNG assets)
- [x] Save/Load game functionality (5 save slots)
- [ ] Interactive star map (partial implementation)
- [ ] Ship customization UI
- [ ] Multiplayer support
- [ ] Mobile touch controls
- [ ] Achievement system
- [ ] Leaderboards

## License

This project is open source and available under the MIT License.

---

Enjoy exploring the cosmos in stunning visual detail! 🚀✨
