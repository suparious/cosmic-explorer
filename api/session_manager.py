"""
Session Manager Module for Cosmic Explorer
Handles game session state and persistence
"""

import json
import os
import sys
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import config
from regions import generate_new_star_map
from ship_system import SHIP_TYPES, ShipManager
from inventory_system import InventoryManager
from pod_system import POD_CONFIG, PodManager


class GameSession:
    """Represents a single game session with all player state"""
    
    def __init__(self, session_id):
        self.session_id = session_id
        self.created_at = datetime.now()
        self.last_activity = datetime.now()
        
        # Initialize player stats
        self.player_stats = {
            "health": config.STARTING_HEALTH,
            "wealth": config.STARTING_WEALTH,
            "ship_condition": config.STARTING_SHIP_CONDITION,
            "max_ship_condition": config.STARTING_SHIP_CONDITION,
            "base_max_ship_condition": config.STARTING_SHIP_CONDITION,
            "fuel": config.STARTING_FUEL,
            "food": config.STARTING_FOOD,
            "has_flight_pod": False,
            "pod_hp": 0,
            "pod_max_hp": POD_CONFIG["base_hp"],
            "pod_augmentations": [],
            "in_pod_mode": False,
            "pod_animation_state": "idle",
            
            # Ship and inventory system
            "ship_type": "scout",
            "ship_mods": {
                "high": [],
                "mid": [],
                "low": [],
                "rig": []
            },
            "inventory": [],
            "cargo_capacity": SHIP_TYPES["scout"]["cargo_capacity"],
            "used_cargo_space": 0,
            
            # Temporary effects
            "temp_effects": []  # List of {effect_type, value, duration}
        }
        
        # Game progress
        self.active_quest = None
        self.completed_quests = []
        self.turn_count = 0
        self.at_repair_location = False
        self.game_over = False
        self.victory = False
        self.current_event = None
        self.available_choices = []
        
        # Star map and navigation
        self.star_map = generate_new_star_map()
        self.current_region_id = self.star_map["current_region"]
        self.current_node_id = self.star_map["current_node"]
        
        # Statistics tracking
        self.statistics = {
            "total_distance_traveled": 0,
            "systems_visited": 0,
            "items_collected": 0,
            "credits_earned": 0,
            "credits_spent": 0,
            "ships_destroyed": 0,
            "pod_uses": 0
        }
    
    def update_activity(self):
        """Update last activity timestamp"""
        self.last_activity = datetime.now()
    
    def calculate_cargo_space(self):
        """Calculate used cargo space from inventory"""
        self.player_stats["used_cargo_space"] = InventoryManager.calculate_cargo_space(
            self.player_stats["inventory"]
        )
        return self.player_stats["used_cargo_space"]
    
    def get_effective_stats(self):
        """Calculate effective stats including all modifications"""
        # Get base stats from ship manager
        effective_stats = ShipManager.calculate_effective_stats(
            self.player_stats,
            self.player_stats["ship_type"],
            self.player_stats["ship_mods"]
        )
        
        # Apply pod augmentation effects if pod is equipped and not in use
        if self.player_stats["has_flight_pod"] and not self.player_stats["in_pod_mode"]:
            pod_effects = PodManager.get_pod_effects(self.player_stats["pod_augmentations"])
            
            # Apply pod effects
            if "max_ship_condition" in pod_effects:
                effective_stats["max_hp"] += pod_effects["max_ship_condition"]
            
            if "scan_multiplier" in pod_effects:
                effective_stats["scan_bonus"] *= pod_effects["scan_multiplier"]
            
            if "fuel_efficiency" in pod_effects:
                effective_stats["fuel_efficiency"] *= pod_effects["fuel_efficiency"]
        
        # Apply temporary effects
        for effect in self.player_stats.get("temp_effects", []):
            if effect["duration"] > 0:
                if effect["effect_type"] == "temp_hp":
                    effective_stats["max_hp"] += effect["value"]
        
        # Update calculated values
        effective_stats["max_ship_condition"] = effective_stats["max_hp"]
        effective_stats["cargo_capacity"] = self.player_stats["cargo_capacity"] + \
            effective_stats.get("cargo_capacity", 0) - SHIP_TYPES[self.player_stats["ship_type"]]["cargo_capacity"]
        effective_stats["used_cargo_space"] = self.calculate_cargo_space()
        
        # Merge with current stats
        result = self.player_stats.copy()
        result.update(effective_stats)
        
        return result
    
    def process_turn_effects(self):
        """Process effects that happen each turn"""
        # Reduce temporary effect durations
        for effect in self.player_stats.get("temp_effects", []):
            effect["duration"] -= 1
        
        # Remove expired effects
        self.player_stats["temp_effects"] = [
            e for e in self.player_stats.get("temp_effects", [])
            if e["duration"] > 0
        ]
        
        # Apply hull repair from mods
        effective_stats = self.get_effective_stats()
        if effective_stats.get("hull_repair", 0) > 0:
            max_hp = effective_stats["max_ship_condition"]
            old_hp = self.player_stats["ship_condition"]
            self.player_stats["ship_condition"] = min(
                self.player_stats["ship_condition"] + effective_stats["hull_repair"],
                max_hp
            )
            return f"Nanite repair system restored {self.player_stats['ship_condition'] - old_hp} HP."
        
        return None
    
    def get_current_location(self):
        """Get current location information"""
        if not self.star_map:
            return None
        
        current_region = self.star_map["regions"].get(self.current_region_id)
        if not current_region:
            return None
        
        current_node = None
        for node in current_region["nodes"]:
            if node["id"] == self.current_node_id:
                current_node = node
                break
        
        if not current_node:
            return None
        
        return {
            "region": current_region,
            "node": current_node,
            "region_id": self.current_region_id,
            "node_id": self.current_node_id
        }
    
    def to_dict(self):
        """Convert session to dictionary for serialization"""
        effective_stats = self.get_effective_stats()
        location = self.get_current_location()
        
        return {
            "session_id": self.session_id,
            "created_at": self.created_at.isoformat(),
            "last_activity": self.last_activity.isoformat(),
            "player_stats": effective_stats,
            "active_quest": self.active_quest,
            "completed_quests": self.completed_quests,
            "turn_count": self.turn_count,
            "at_repair_location": self.at_repair_location,
            "game_over": self.game_over,
            "victory": self.victory,
            "current_event": self.current_event,
            "available_choices": self.available_choices,
            "star_map": self.star_map,
            "current_region_id": self.current_region_id,
            "current_node_id": self.current_node_id,
            "current_location": location,
            "statistics": self.statistics,
            "max_turns": config.MAX_TURNS
        }
    
    def to_save_dict(self):
        """Convert session to minimal dictionary for save files"""
        return {
            "player_stats": self.player_stats,
            "active_quest": self.active_quest,
            "completed_quests": self.completed_quests,
            "turn_count": self.turn_count,
            "at_repair_location": self.at_repair_location,
            "star_map": self.star_map,
            "current_region_id": self.current_region_id,
            "current_node_id": self.current_node_id,
            "statistics": self.statistics
        }
    
    def load_from_dict(self, save_data):
        """Load session state from saved data"""
        if "player_stats" in save_data:
            self.player_stats.update(save_data["player_stats"])
        
        if "active_quest" in save_data:
            self.active_quest = save_data["active_quest"]
        
        if "completed_quests" in save_data:
            self.completed_quests = save_data["completed_quests"]
        
        if "turn_count" in save_data:
            self.turn_count = save_data["turn_count"]
        
        if "at_repair_location" in save_data:
            self.at_repair_location = save_data["at_repair_location"]
        
        if "star_map" in save_data:
            self.star_map = save_data["star_map"]
        
        if "current_region_id" in save_data:
            self.current_region_id = save_data["current_region_id"]
        
        if "current_node_id" in save_data:
            self.current_node_id = save_data["current_node_id"]
        
        if "statistics" in save_data:
            self.statistics.update(save_data["statistics"])
        
        # Update repair location status based on current node
        location = self.get_current_location()
        if location and location["node"]:
            self.at_repair_location = location["node"].get("has_repair", False)
    
    def save_to_file(self, filepath=None):
        """Save session to file"""
        if not filepath:
            filepath = f"saves/session_{self.session_id}.json"
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, "w") as f:
            json.dump(self.to_save_dict(), f, indent=2)
        
        return filepath
    
    @classmethod
    def load_from_file(cls, session_id, filepath=None):
        """Load session from file"""
        if not filepath:
            filepath = f"saves/session_{session_id}.json"
        
        if not os.path.exists(filepath):
            return None
        
        try:
            with open(filepath, "r") as f:
                save_data = json.load(f)
            
            session = cls(session_id)
            session.load_from_dict(save_data)
            return session
        except Exception as e:
            print(f"Error loading session: {e}")
            return None


class SessionManager:
    """Manages multiple game sessions"""
    
    def __init__(self):
        self.sessions = {}
        self.max_sessions = 100  # Prevent memory issues
        self.session_timeout = 3600  # 1 hour in seconds
    
    def create_session(self, session_id, force_new=False):
        """Create a new game session"""
        if not force_new and session_id in self.sessions:
            return self.sessions[session_id]
        
        # Check session limit
        if len(self.sessions) >= self.max_sessions:
            self.cleanup_old_sessions()
        
        session = GameSession(session_id)
        self.sessions[session_id] = session
        return session
    
    def get_session(self, session_id):
        """Get an existing session"""
        return self.sessions.get(session_id)
    
    def remove_session(self, session_id):
        """Remove a session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
    
    def cleanup_old_sessions(self):
        """Remove inactive sessions"""
        current_time = datetime.now()
        to_remove = []
        
        for session_id, session in self.sessions.items():
            time_diff = (current_time - session.last_activity).total_seconds()
            if time_diff > self.session_timeout:
                to_remove.append(session_id)
        
        for session_id in to_remove:
            self.remove_session(session_id)
    
    def save_all_sessions(self):
        """Save all active sessions to disk"""
        for session in self.sessions.values():
            try:
                session.save_to_file()
            except Exception as e:
                print(f"Error saving session {session.session_id}: {e}")
    
    def get_session_stats(self):
        """Get statistics about active sessions"""
        return {
            "active_sessions": len(self.sessions),
            "total_players": len(self.sessions),
            "sessions": {
                sid: {
                    "turn_count": session.turn_count,
                    "wealth": session.player_stats["wealth"],
                    "game_over": session.game_over,
                    "victory": session.victory
                }
                for sid, session in self.sessions.items()
            }
        }
