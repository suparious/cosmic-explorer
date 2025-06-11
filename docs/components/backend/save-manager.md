---
title: Save Manager
tags: [backend, persistence, save-system]
created: 2025-06-10
updated: 2025-06-10
status: active
---

# Save Manager

Handles game persistence with multi-slot save functionality, metadata tracking, and auto-save capabilities.

## 🎯 Overview

The Save Manager provides:
- 5 save slots (0-4) with slot 0 reserved for auto-save
- Metadata for each save (timestamp, location, stats)
- Save migration from old format
- Atomic save operations
- Location-aware save descriptions

## 🏗️ Architecture

### Save System Design

```
saves/
├── save_slot_0.json  # Auto-save (protected)
├── save_slot_1.json  # Manual save
├── save_slot_2.json  # Manual save
├── save_slot_3.json  # Manual save
└── save_slot_4.json  # Manual save
```

### Configuration
```python
# From config.py
SAVE_DIR_PATH = "saves"
MAX_SAVE_SLOTS = 5
AUTO_SAVE_SLOT = 0
GAME_VERSION = "0.1.0"
```

## 💾 Save File Format

### Modern Format (with metadata)
```json
{
  "metadata": {
    "timestamp": "2025-06-10T14:30:00.123456",
    "turn_count": 42,
    "wealth": 2500,
    "health": 85,
    "location": "Trading Post Alpha (Nebula Sector)",
    "game_version": "0.1.0"
  },
  "game_state": {
    "player_stats": {...},
    "star_map": {...},
    "turn_count": 42,
    // ... complete game state
  }
}
```

### Legacy Format Support
Older saves without metadata wrapper are automatically detected and handled.

## 🔧 Core Functions

### save_game_to_slot()
```python
def save_game_to_slot(state, slot, location_name="Unknown Space"):
    """Save game state to a specific slot"""
    # Returns: metadata dict
```
- Validates slot number
- Creates metadata
- Atomic write operation
- Returns saved metadata

### load_game_from_slot()
```python
def load_game_from_slot(slot):
    """Load game state from a specific slot"""
    # Returns: game state dict or None
```
- Handles both formats
- Returns None if not found
- Extracts game_state from wrapper

### get_save_info()
```python
def get_save_info(slot):
    """Get metadata without loading full state"""
    # Returns: metadata dict or None
```
- Lightweight metadata query
- Handles legacy saves
- No full state loading

### list_all_saves()
```python
def list_all_saves():
    """List all save files with metadata"""
    # Returns: list of save info dicts
```
Returns:
```python
[
    {
        "slot": 0,
        "metadata": {...},
        "is_autosave": True
    },
    {
        "slot": 1,
        "metadata": {...},
        "is_autosave": False
    }
]
```

### delete_save_slot()
```python
def delete_save_slot(slot):
    """Delete a save file"""
    # Returns: True if deleted, False if not found
```
- Cannot delete auto-save (slot 0)
- Safe file removal
- Returns success status

## 🗺️ Location Tracking

### get_current_location_name()
```python
def get_current_location_name(star_map, current_region_id, current_node_id):
    """Get human-readable location name"""
    # Returns: "Node Name (Region Name)"
```

Examples:
- "Trading Post Alpha (Nebula Sector)"
- "Asteroid Field Beta (Frontier Region)"
- "Deep Space" (if unknown)

## 🔄 Save Migration

### migrate_old_save()
Handles upgrade from single-file to multi-slot system:
1. Detects `save_game.json`
2. Imports to slot 1
3. Backs up original
4. Preserves data integrity

```python
# Old: save_game.json
# New: saves/save_slot_1.json
# Backup: save_game.json.bak
```

## 🎮 Usage Patterns

### Auto-Save Integration
```python
# In action_processor.py after turn actions
try:
    location_name = get_current_location_name(...)
    save_game_to_slot(session.to_save_dict(), 0, location_name)
except Exception:
    pass  # Silent failure
```

### Manual Save
```python
# API endpoint handler
metadata = save_game_to_slot(
    session.to_save_dict(),
    slot,
    location_name
)
return {"success": True, "metadata": metadata}
```

### Quick Save/Load
- F5 → Save to last used slot
- F9 → Load from last used slot
- Tracked client-side

## 📊 Metadata Fields

| Field | Type | Description |
|-------|------|-------------|
| timestamp | ISO string | When saved |
| turn_count | int | Game progress |
| wealth | int | Current credits |
| health | int | Current HP |
| location | string | Where saved |
| game_version | string | Game version |

## 🚨 Error Handling

### File Operations
- Directory auto-creation
- FileNotFoundError handling
- JSON parse error safety
- Write atomicity

### Validation
- Slot range checking (0-4)
- Auto-save protection
- Corrupt file handling
- Missing field defaults

## 🔒 Data Integrity

### Atomic Saves
1. Build complete save object
2. Serialize to JSON
3. Write to temp file
4. Atomic rename

### Backup Strategy
- Auto-save every turn
- Manual saves preserved
- Old format backed up
- No data loss

## 🎯 Best Practices

### When to Save
- After turn-consuming actions
- Before risky operations
- On explicit user request
- Not during combat

### Save Slot Usage
- Slot 0: Auto-save only
- Slot 1: Primary manual
- Slots 2-4: Alternate saves
- Rotate manual saves

### Performance
- Async save operations
- Minimal state serialization
- Metadata caching
- Lazy loading

## 🔍 Troubleshooting

### Common Issues

#### "No save found"
- Check slot number
- Verify file exists
- Check permissions

#### Corrupt save
- JSON parse errors
- Missing required fields
- Use backup saves

#### Auto-save not working
- Check disk space
- Verify permissions
- Check error logs

### Recovery Options
1. Load different slot
2. Use auto-save
3. Import backup
4. Start new game

---

Parent: [[backend/index|Backend Components]] | [[components/index|Components]]
Related: [[session-manager|Session Manager]] | [[api-server|API Server]]
