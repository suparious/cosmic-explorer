# Saves Directory

This directory stores game save files for Cosmic Explorer.

## File Format

Save files are stored in JSON format with the following naming convention:
- `save_game.json` - Default save file
- `save_game-TIMESTAMP.json` - Timestamped backup saves

## Save File Structure

Each save file contains:
- Player statistics (health, fuel, wealth, etc.)
- Current location and region
- Inventory items
- Active quests
- Game progress flags
- Pod augmentations
- Ship condition

## Notes

- Save files are automatically created when using the save feature in-game
- This directory is ignored by git (see .gitignore)
- You can manually backup saves by copying files from this directory
- Save files are compatible across different versions of the game

## Manual Save Management

To manually backup a save:
```bash
cp save_game.json save_game-backup-$(date +%Y%m%d).json
```

To restore a save:
```bash
cp save_game-backup.json save_game.json
```
