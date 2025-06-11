---
title: Save/Load System
tags: [game-systems, persistence, save-system]
created: 2025-06-10
updated: 2025-06-10
status: active
---

# Save/Load System

Multi-slot save system with metadata tracking, auto-save functionality, and migration support.

## 💾 Overview

The save system provides:
- 5 save slots (0-4)
- Slot 0 reserved for auto-save
- Rich metadata for each save
- Keyboard shortcuts (F5/F9)
- UI modal interface
- Legacy save migration

## 🗂️ Save Slot Structure

| Slot | Type | Description |
|------|------|-------------|
| 0 | Auto-save | Automatic after turns |
| 1-4 | Manual | Player-controlled |

### File Organization
```
saves/
├── save_slot_0.json  # Auto-save (protected)
├── save_slot_1.json  # Manual save
├── save_slot_2.json  # Manual save
├── save_slot_3.json  # Manual save
└── save_slot_4.json  # Manual save
```

## 📋 Save File Format

### Modern Format (v0.1.0+)
```json
{
  "metadata": {
    "timestamp": "2025-06-10T10:30:00",
    "turn_count": 25,
    "wealth": 1250,
    "health": 85,
    "location": "Trading Post Alpha (Nebula Sector)",
    "game_version": "0.1.0"
  },
  "game_state": {
    "player_stats": {
      "health": 85,
      "wealth": 1250,
      "ship_condition": 90,
      "fuel": 75,
      "food": 40,
      "has_flight_pod": true,
      "pod_hp": 30,
      "pod_augmentations": ["shield_matrix"],
      "ship_type": "trader",
      "ship_mods": {...},
      "inventory": [...]
    },
    "turn_count": 25,
    "at_repair_location": true,
    "star_map": {...},
    "current_region_id": "region_1",
    "current_node_id": "node_5",
    "statistics": {...}
  }
}
```

### Legacy Format Support
Older saves without metadata wrapper are automatically:
- Detected on load
- Migrated to slot 1
- Backed up as `.bak`

## 🎮 User Interface

### Save Modal
```
┌─────────────────────────────┐
│        Save Game            │
├─────────────────────────────┤
│ Slot 0: Auto-save (Protected)│
│   Turn 42 | 2500 wealth     │
│   Trading Post Alpha        │
│                             │
│ Slot 1: Manual Save         │
│   Turn 25 | 1250 wealth     │
│   Asteroid Field Beta       │
│   [Save] [Delete]           │
│                             │
│ Slot 2: Empty               │
│   [Save]                    │
├─────────────────────────────┤
│        [Cancel]             │
└─────────────────────────────┘
```

### Keyboard Shortcuts
- **F5** - Quick Save (opens modal)
- **F9** - Quick Load (opens modal)
- **ESC** - Close modal

## 🔄 Auto-Save System

### Trigger Events
Auto-save occurs after:
- Navigation actions
- Mining operations
- Salvage operations
- Any turn-consuming action

### Implementation
```python
# In action_processor.py
if action in ["navigate", "mine", "salvage"]:
    try:
        location_name = get_current_location_name(...)
        save_game_to_slot(session.to_save_dict(), 0, location_name)
    except Exception:
        pass  # Silent failure
```

### Features
- Non-blocking operation
- Silent error handling
- Always uses slot 0
- Cannot be deleted
- Preserves last stable state

## 🌐 API Endpoints

### List All Saves
```http
GET /api/saves
```
Returns:
```json
{
  "success": true,
  "saves": [
    {
      "slot": 0,
      "metadata": {...},
      "is_autosave": true
    }
  ],
  "max_slots": 5
}
```

### Save to Slot
```http
POST /api/saves/<slot>
Content-Type: application/json

{
  "session_id": "default"
}
```

### Load from Slot
```http
POST /api/load/<slot>
Content-Type: application/json

{
  "session_id": "default"
}
```

### Delete Save
```http
DELETE /api/saves/<slot>
```
Note: Cannot delete slot 0 (auto-save)

### Get Save Info
```http
GET /api/saves/<slot>
```
Returns metadata without loading full state

## 🔄 Migration System

### Old Save Detection
On startup, checks for `save_game.json`

### Migration Process
1. Load old save file
2. Convert to new format
3. Save to slot 1
4. Rename original to `.bak`
5. Notify user

### Backwards Compatibility
- Legacy endpoint maintained
- Old format auto-detected
- Seamless upgrade path

## 💡 Usage Patterns

### Manual Save Flow
1. Player presses F5 or clicks Save
2. Modal shows all slots with metadata
3. Player selects slot
4. Confirms overwrite if exists
5. Save completes with feedback

### Load Flow
1. Player presses F9 or clicks Load
2. Modal shows occupied slots
3. Player selects save
4. Confirms load action
5. Game state restored
6. WebSocket notifies UI

### Auto-Save Strategy
- Frequent but non-intrusive
- Preserves progress
- Fallback for crashes
- No user intervention

## 🚨 Error Handling

### Common Errors
- **Invalid slot**: 400 Bad Request
- **Missing save**: 404 Not Found
- **Corrupt file**: Graceful fallback
- **Disk full**: Silent failure for auto-save

### Recovery Methods
1. Try different slot
2. Use auto-save
3. Check file permissions
4. Verify disk space

## 🔧 Implementation Details

### Frontend (ui.js)
```javascript
// Save/Load button handlers
document.getElementById('saveButton').onclick = () => {
    showSaveLoadModal('save');
};

// Keyboard shortcuts
if (event.key === 'F5') {
    event.preventDefault();
    showSaveLoadModal('save');
}
```

### Backend (save_manager.py)
- Atomic file operations
- Metadata generation
- Location name extraction
- Format detection

### Session Integration
```python
# Convert session to saveable format
save_data = session.to_save_dict()

# Minimal data for file size
{
    "player_stats": {...},
    "turn_count": 42,
    "star_map": {...},
    "statistics": {...}
}
```

## 📊 Metadata Fields

| Field | Purpose | Example |
|-------|---------|---------|
| timestamp | When saved | "2025-06-10T10:30:00" |
| turn_count | Game progress | 42 |
| wealth | Current credits | 2500 |
| health | Current HP | 85 |
| location | Where saved | "Trading Post Alpha" |
| game_version | Compatibility | "0.1.0" |

## 🎯 Best Practices

### For Players
- Use multiple slots for different strategies
- Don't rely only on auto-save
- Save before risky actions
- Name saves mentally by location

### For Developers
- Always include location in saves
- Handle missing fields gracefully
- Version saves for compatibility
- Test migration paths

---

Parent: [[game-systems/index|Game Systems]] | [[components/index|Components]]
Related: [[save-manager|Save Manager]] | [[session-manager|Session Manager]] | [[ui-system|UI System]]
Source: [[archive/feature-docs/save-load-system.md|Original Implementation]]
