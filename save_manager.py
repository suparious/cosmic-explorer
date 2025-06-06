"""
Save game management module for Cosmic Explorer
Handles multiple save slots with metadata
"""

import json
import os
from datetime import datetime
from config import config

def ensure_save_directory():
    """Ensure the save directory exists"""
    os.makedirs(config.SAVE_DIR_PATH, exist_ok=True)

def get_save_filename(slot):
    """Get the filename for a specific save slot"""
    return os.path.join(config.SAVE_DIR_PATH, f"save_slot_{slot}.json")

def get_save_metadata(state, location_name="Unknown Space"):
    """Create metadata for a save file"""
    return {
        "timestamp": datetime.now().isoformat(),
        "turn_count": state.get("turn_count", 0),
        "wealth": state.get("wealth", 0),
        "health": state.get("health", 0),
        "location": location_name,
        "game_version": config.GAME_VERSION
    }

def save_game_to_slot(state, slot, location_name="Unknown Space"):
    """Save game state to a specific slot with metadata"""
    ensure_save_directory()
    
    save_data = {
        "metadata": get_save_metadata(state, location_name),
        "game_state": state
    }
    
    filename = get_save_filename(slot)
    with open(filename, "w") as f:
        json.dump(save_data, f, indent=2)
    
    return save_data["metadata"]

def load_game_from_slot(slot):
    """Load game state from a specific slot"""
    filename = get_save_filename(slot)
    
    try:
        with open(filename, "r") as f:
            save_data = json.load(f)
            
        # Handle old save format (direct state without metadata)
        if "game_state" in save_data:
            return save_data["game_state"]
        else:
            # Old format - return as is
            return save_data
    except FileNotFoundError:
        return None

def get_save_info(slot):
    """Get metadata for a specific save slot without loading the full state"""
    filename = get_save_filename(slot)
    
    try:
        with open(filename, "r") as f:
            save_data = json.load(f)
            
        if "metadata" in save_data:
            return save_data["metadata"]
        else:
            # Old format - create basic metadata
            return {
                "timestamp": "Unknown",
                "turn_count": save_data.get("turn_count", 0),
                "wealth": save_data.get("wealth", 0),
                "health": save_data.get("health", 0),
                "location": "Unknown",
                "game_version": "Pre-1.0"
            }
    except FileNotFoundError:
        return None

def list_all_saves():
    """List all save files with their metadata"""
    ensure_save_directory()
    saves = []
    
    for slot in range(config.MAX_SAVE_SLOTS):
        save_info = get_save_info(slot)
        if save_info:
            saves.append({
                "slot": slot,
                "metadata": save_info,
                "is_autosave": slot == config.AUTO_SAVE_SLOT
            })
    
    return saves

def delete_save_slot(slot):
    """Delete a save file from a specific slot"""
    filename = get_save_filename(slot)
    
    try:
        os.remove(filename)
        return True
    except FileNotFoundError:
        return False

def migrate_old_save():
    """Migrate old single save file to new slot system"""
    old_save_path = "save_game.json"
    
    if os.path.exists(old_save_path):
        try:
            with open(old_save_path, "r") as f:
                old_state = json.load(f)
            
            # Save to slot 1 as imported save
            save_game_to_slot(old_state, 1, "Imported Save")
            
            # Rename old file instead of deleting
            os.rename(old_save_path, old_save_path + ".bak")
            
            return True
        except Exception:
            return False
    
    return False

def get_current_location_name(star_map, current_region_id, current_node_id):
    """Get the human-readable name of the current location"""
    if not star_map or not current_region_id or not current_node_id:
        return "Deep Space"
    
    try:
        region = star_map["regions"].get(current_region_id)
        if region:
            node = next((n for n in region["nodes"] if n["id"] == current_node_id), None)
            if node:
                return f"{node['name']} ({region['name']})"
            return region['name']
    except Exception:
        pass
    
    return "Unknown Space"
