# Save/Load System Documentation

## Overview
The Cosmic Explorer save/load system provides multi-slot save functionality with metadata tracking and auto-save capabilities.

## Features

### Save Slots
- **5 total save slots** (0-4)
- **Slot 0** is reserved for auto-save
- **Slots 1-4** are manual save slots
- Each slot stores complete game state with metadata

### Save Metadata
Each save includes:
- Timestamp (ISO format)
- Current location name
- Turn count
- Wealth
- Health
- Game version

### Auto-Save
Auto-save triggers:
- After each turn in terminal mode (game.py)
- After turn-consuming actions in web mode (navigate, mine, salvage)
- Always saves to slot 0

### UI Features
- Modal dialog for save/load operations
- Visual save slot display with metadata
- Delete functionality for manual saves
- Keyboard shortcuts:
  - **F5** - Quick Save
  - **F9** - Quick Load
- Save/Load buttons in game UI

## File Structure

### Save Directory
```
saves/
├── save_slot_0.json  (auto-save)
├── save_slot_1.json  (manual save)
├── save_slot_2.json  (manual save)
├── save_slot_3.json  (manual save)
└── save_slot_4.json  (manual save)
```

### Save File Format
```json
{
  "metadata": {
    "timestamp": "2025-01-15T10:30:00",
    "turn_count": 25,
    "wealth": 1250,
    "health": 85,
    "location": "Trading Post Alpha (Nebula Sector)",
    "game_version": "0.1.0"
  },
  "game_state": {
    // Complete game state object
  }
}
```

## API Endpoints

### List All Saves
```
GET /api/saves
```
Returns all save slots with metadata

### Save to Slot
```
POST /api/saves/<slot>
Body: { "session_id": "default" }
```
Saves current game to specified slot

### Get Save Info
```
GET /api/saves/<slot>
```
Returns metadata for specific slot

### Delete Save
```
DELETE /api/saves/<slot>
```
Deletes save from specified slot (not allowed for slot 0)

### Load from Slot
```
POST /api/load/<slot>
Body: { "session_id": "default" }
```
Loads game from specified slot

## Migration
Old single-file saves (`save_game.json`) are automatically migrated to slot 1 on first load.

## Implementation Files

### Backend
- `save_manager.py` - Core save/load logic
- `config.py` - Save directory configuration
- `api/app.py` - REST endpoints
- `api/action_processor.py` - Auto-save integration

### Frontend
- `static/js/ui.js` - Save/Load modal and UI
- `static/js/main.js` - Keyboard shortcut initialization
- `templates/index.html` - UI buttons

## Usage

### Saving a Game
1. Press F5 or click Save button
2. Select a save slot (1-4)
3. Confirm overwrite if slot has existing save
4. Game is saved with current metadata

### Loading a Game
1. Press F9 or click Load button
2. Select a save slot with data
3. Confirm load action
4. Game state is restored

### Auto-Save
- Happens automatically after navigation
- No user interaction required
- Always uses slot 0
- Cannot be deleted

## Error Handling
- Invalid slot numbers return 400 error
- Missing saves return 404 error
- Corrupted saves fail gracefully
- Auto-save failures are silent (don't interrupt gameplay)

## Security Notes
- Save files are server-side only
- No client-side save manipulation
- Session-based access control
- Input validation on all endpoints
