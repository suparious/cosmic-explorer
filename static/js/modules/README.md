# Cosmic Explorer UI Module Architecture

## Overview

The UI system has been refactored from a monolithic 5000+ line file into a modular architecture with focused, maintainable components. Each module handles a specific aspect of the UI functionality.

## Module Structure

```
/static/js/
├── ui.js                    # Main UIManager (coordinator)
├── ui-loader.js            # Module loader for backward compatibility
└── modules/
    ├── screens/
    │   └── screen-manager.js    # Screen transitions and state
    ├── hud/
    │   └── hud-manager.js       # HUD updates (health, fuel, resources)
    ├── modals/
    │   ├── modal-manager.js     # Base modal functionality
    │   ├── save-load-modal.js   # Save/load game interface
    │   ├── pod-mods-modal.js    # Pod augmentation interface
    │   ├── ship-modal.js        # Ship management interface
    │   ├── food-modal.js        # Food consumption interface
    │   └── star-map-modal.js    # Star map and navigation
    ├── notifications/
    │   └── notification-manager.js  # Toast notifications and event log
    ├── audio/
    │   └── audio-visualizer.js     # Music visualization
    ├── components/
    │   └── action-buttons.js       # Dynamic action button management
    └── utils/
        ├── keyboard-shortcuts.js   # Keyboard shortcut handling
        └── ui-sounds.js           # UI sound effects
```

## Module Descriptions

### Core Modules

**UIManager** (`ui.js`)
- Main coordinator that instantiates and manages all other modules
- Provides backward-compatible API for existing game code
- Delegates functionality to specialized modules

**ScreenManager** (`screens/screen-manager.js`)
- Manages screen transitions (loading, main menu, game, settings)
- Updates continue button visibility
- Validates screen elements on initialization

**HUDManager** (`hud/hud-manager.js`)
- Updates all HUD elements (health, fuel, ship condition, resources)
- Manages critical state warnings and audio alerts
- Updates action button states based on game state

### Modal Modules

**ModalManager** (`modals/modal-manager.js`)
- Base class for modal functionality
- Manages modal z-index stacking
- Provides choice modal functionality
- Handles closing all modals

**SaveLoadModal** (`modals/save-load-modal.js`)
- Save and load game functionality
- Displays save slots with metadata
- Handles save deletion and overwrite confirmation

**PodModsModal** (`modals/pod-mods-modal.js`)
- Pod augmentation purchase interface
- Displays available augmentations with costs
- Shows owned augmentations

**ShipModal** (`modals/ship-modal.js`)
- Ship management with three tabs:
  - Overview: Ship stats and available ships
  - Modifications: Module slots and available mods
  - Inventory: Cargo hold management

**FoodModal** (`modals/food-modal.js`)
- Food consumption interface
- Shows health and food status
- Provides consumption options with health gain preview

**StarMapModal** (`modals/star-map-modal.js`)
- Renders interactive star map visualization
- Shows navigation options with fuel costs
- Displays current location and destination preview

### Utility Modules

**NotificationManager** (`notifications/notification-manager.js`)
- Toast notifications with auto-dismiss
- Event log messages with timestamps
- Manages notification styles and animations

**AudioVisualizer** (`audio/audio-visualizer.js`)
- Real-time music visualization
- Updates track name display
- Controls music play/pause button state

**KeyboardShortcuts** (`utils/keyboard-shortcuts.js`)
- F5: Quick save
- F9: Quick load
- ESC: Close modals or return to menu

**UISounds** (`utils/ui-sounds.js`)
- Adds click sounds to all interactive elements
- Monitors DOM for new buttons
- Integrates with audio manager

**ActionButtons** (`components/action-buttons.js`)
- Manages dynamic action buttons
- Shows/hides context-sensitive buttons
- Handles button state and click handlers

## Usage

The modular system maintains full backward compatibility. All existing code that references `window.gameUI` continues to work without modification.

### Accessing Modules

```javascript
// From game code
window.gameUI.showNotification('Hello!', 'info');
window.gameUI.updateHUD(gameState);
window.gameUI.showSaveLoadModal('save');

// Direct module access (if needed)
window.uiManager.notificationManager.showNotification('Direct access', 'success');
window.uiManager.hudManager.updateMineButton(gameState);
```

### Adding New Features

1. **New Modal**: Create a new class extending patterns from existing modals
2. **New HUD Element**: Add method to HUDManager
3. **New Screen**: Add to ScreenManager's screens object
4. **New Notification Type**: Extend NotificationManager

## Benefits

1. **Maintainability**: Each module is focused on a single responsibility
2. **Testability**: Modules can be tested in isolation
3. **Reusability**: Modules can be reused in other projects
4. **Performance**: Modules can be lazy-loaded if needed
5. **Clarity**: Clear separation of concerns makes code easier to understand

## Future Enhancements

- Add TypeScript definitions for better IDE support
- Implement lazy loading for rarely-used modals
- Add unit tests for each module
- Create a build process to bundle modules for production
- Add module documentation with JSDoc

## Migration Notes

The refactoring maintains 100% backward compatibility. No changes are required to existing game code. The global `window.gameUI` object provides the same API as before, but now delegates to specialized modules internally.
