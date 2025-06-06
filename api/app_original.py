#!/usr/bin/env python3
"""
Flask API backend for Cosmic Explorer
Provides REST endpoints and WebSocket support for the graphical frontend
Enhanced with inventory system and ship customization
"""

from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room
import json
import os
import sys
import threading
import time
import random

# Add parent directory to path to import game modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import config
import game
from regions import generate_new_star_map, get_region_visual_config

# Ship type definitions
SHIP_TYPES = {
    "scout": {
        "name": "Scout Vessel",
        "description": "Fast and agile, perfect for exploration",
        "cost": 400,
        "max_hp": 80,
        "cargo_capacity": 50,
        "fuel_efficiency": 0.8,  # 20% better fuel efficiency
        "speed": 1.2,  # 20% faster
        "slots": {
            "high": 2,
            "mid": 3,
            "low": 1,
            "rig": 1
        },
        "icon": "🛸"
    },
    "trader": {
        "name": "Merchant Cruiser",
        "description": "Massive cargo hold for profitable trade runs",
        "cost": 800,
        "max_hp": 100,
        "cargo_capacity": 200,
        "fuel_efficiency": 1.2,  # 20% worse fuel efficiency
        "speed": 0.8,  # 20% slower
        "slots": {
            "high": 1,
            "mid": 2,
            "low": 4,
            "rig": 2
        },
        "icon": "🚢"
    },
    "combat": {
        "name": "Combat Frigate",
        "description": "Armed and armored for dangerous encounters",
        "cost": 1200,
        "max_hp": 150,
        "cargo_capacity": 100,
        "fuel_efficiency": 1.0,
        "speed": 1.0,
        "slots": {
            "high": 4,
            "mid": 2,
            "low": 2,
            "rig": 1
        },
        "icon": "⚔️"
    },
    "explorer": {
        "name": "Explorer Class",
        "description": "Versatile vessel for long-range expeditions",
        "cost": 2000,
        "max_hp": 120,
        "cargo_capacity": 150,
        "fuel_efficiency": 0.9,
        "speed": 1.1,
        "slots": {
            "high": 3,
            "mid": 3,
            "low": 3,
            "rig": 2
        },
        "icon": "🚀"
    }
}

# Ship modification definitions
SHIP_MODS = {
    # High slot mods (weapons, mining, utilities)
    "laser_cannon": {
        "name": "Pulse Laser Cannon",
        "description": "Basic energy weapon for defense",
        "slot": "high",
        "cost": 200,
        "effects": {
            "combat_power": 10
        },
        "icon": "⚡"
    },
    "missile_launcher": {
        "name": "Missile Launcher",
        "description": "Long-range explosive weapon",
        "slot": "high",
        "cost": 300,
        "effects": {
            "combat_power": 15
        },
        "icon": "🚀"
    },
    "mining_laser": {
        "name": "Mining Laser",
        "description": "Extract valuable resources from asteroids",
        "slot": "high",
        "cost": 250,
        "effects": {
            "mining_yield": 1.5
        },
        "icon": "⛏️"
    },
    "salvager": {
        "name": "Salvage Scanner",
        "description": "Recover valuable components from wrecks",
        "slot": "high",
        "cost": 350,
        "effects": {
            "salvage_chance": 0.3
        },
        "icon": "🔧"
    },
    
    # Mid slot mods (shields, scanners, utilities)
    "shield_booster": {
        "name": "Shield Booster",
        "description": "Increases maximum shields",
        "slot": "mid",
        "cost": 300,
        "effects": {
            "max_hp": 20
        },
        "icon": "🛡️"
    },
    "scanner_upgrade": {
        "name": "Advanced Scanner",
        "description": "Improved detection and analysis",
        "slot": "mid",
        "cost": 400,
        "effects": {
            "scan_bonus": 2.0
        },
        "icon": "📡"
    },
    "targeting_computer": {
        "name": "Targeting Computer",
        "description": "Improves weapon accuracy",
        "slot": "mid",
        "cost": 250,
        "effects": {
            "accuracy": 0.2
        },
        "icon": "🎯"
    },
    "afterburner": {
        "name": "Afterburner Module",
        "description": "Boost speed temporarily",
        "slot": "mid",
        "cost": 350,
        "effects": {
            "speed": 0.3
        },
        "icon": "🔥"
    },
    
    # Low slot mods (armor, cargo, engineering)
    "armor_plates": {
        "name": "Reinforced Armor Plates",
        "description": "Increases hull strength",
        "slot": "low",
        "cost": 250,
        "effects": {
            "max_hp": 30
        },
        "icon": "🪨"
    },
    "cargo_expander": {
        "name": "Cargo Bay Extension",
        "description": "Increases cargo capacity",
        "slot": "low",
        "cost": 200,
        "effects": {
            "cargo_capacity": 50
        },
        "icon": "📦"
    },
    "fuel_optimizer": {
        "name": "Fuel Efficiency Module",
        "description": "Reduces fuel consumption",
        "slot": "low",
        "cost": 300,
        "effects": {
            "fuel_efficiency": 0.8
        },
        "icon": "⚙️"
    },
    "repair_drones": {
        "name": "Nanite Repair System",
        "description": "Slowly repairs hull damage",
        "slot": "low",
        "cost": 500,
        "effects": {
            "hull_repair": 1
        },
        "icon": "🤖"
    },
    
    # Rig slot mods (permanent modifications)
    "cargo_rig": {
        "name": "Cargo Optimization Rig",
        "description": "Permanent cargo capacity increase",
        "slot": "rig",
        "cost": 600,
        "effects": {
            "cargo_capacity": 75
        },
        "permanent": True,
        "icon": "🏗️"
    },
    "speed_rig": {
        "name": "Engine Tuning Rig",
        "description": "Permanent speed increase",
        "slot": "rig",
        "cost": 700,
        "effects": {
            "speed": 0.2,
            "fuel_efficiency": 0.9
        },
        "permanent": True,
        "icon": "⚡"
    },
    "shield_rig": {
        "name": "Shield Matrix Rig",
        "description": "Permanent shield enhancement",
        "slot": "rig",
        "cost": 800,
        "effects": {
            "max_hp": 40
        },
        "permanent": True,
        "icon": "💠"
    }
}

# Item type definitions
ITEM_TYPES = {
    # Trade goods
    "rare_minerals": {
        "name": "Rare Minerals",
        "description": "Valuable ore samples",
        "weight": 5,
        "base_value": 50,
        "category": "trade",
        "icon": "💎"
    },
    "alien_artifacts": {
        "name": "Alien Artifacts",
        "description": "Mysterious ancient technology",
        "weight": 2,
        "base_value": 200,
        "category": "trade",
        "icon": "🗿"
    },
    "data_cores": {
        "name": "Data Cores",
        "description": "Encrypted information storage",
        "weight": 1,
        "base_value": 100,
        "category": "trade",
        "icon": "💾"
    },
    "luxury_goods": {
        "name": "Luxury Goods",
        "description": "High-end consumer products",
        "weight": 3,
        "base_value": 150,
        "category": "trade",
        "icon": "👑"
    },
    
    # Consumables
    "repair_nanobots": {
        "name": "Repair Nanobots",
        "description": "Restores 20 ship HP",
        "weight": 3,
        "base_value": 100,
        "category": "consumable",
        "effect": {"ship_condition": 20},
        "icon": "🔧"
    },
    "fuel_cells": {
        "name": "Emergency Fuel Cells",
        "description": "Restores 30 fuel",
        "weight": 10,
        "base_value": 80,
        "category": "consumable",
        "effect": {"fuel": 30},
        "icon": "🔋"
    },
    "shield_booster_charge": {
        "name": "Shield Booster Charge",
        "description": "Temporary +50 HP for 5 turns",
        "weight": 5,
        "base_value": 150,
        "category": "consumable",
        "effect": {"temp_hp": 50, "duration": 5},
        "icon": "⚡"
    },
    
    # Components
    "quantum_processor": {
        "name": "Quantum Processor",
        "description": "Advanced computing component",
        "weight": 1,
        "base_value": 300,
        "category": "component",
        "icon": "🖥️"
    },
    "exotic_matter": {
        "name": "Exotic Matter",
        "description": "Strange material with unique properties",
        "weight": 2,
        "base_value": 500,
        "category": "component",
        "icon": "🌀"
    },
    
    # Quest items (weightless)
    "ancient_key": {
        "name": "Ancient Key",
        "description": "Opens sealed vaults",
        "weight": 0,
        "base_value": 0,
        "category": "quest",
        "icon": "🗝️"
    }
}

# Pod augmentation definitions (kept from original)
POD_AUGMENTATIONS = {
    "shield_boost": {
        "name": "Shield Boost Matrix",
        "description": "Increases maximum ship HP by 20",
        "cost": 300,
        "effect": {"max_ship_condition": 20},
        "icon": "🛡️"
    },
    "scanner_array": {
        "name": "Advanced Scanner Array",
        "description": "Doubles rewards from scan events",
        "cost": 400,
        "effect": {"scan_multiplier": 2},
        "icon": "📡"
    },
    "cargo_module": {
        "name": "Emergency Cargo Module",
        "description": "Preserves 50% of wealth when pod is used",
        "cost": 500,
        "effect": {"wealth_preservation": 0.5},
        "icon": "📦"
    },
    "emergency_thrusters": {
        "name": "Emergency Thrusters",
        "description": "Reduces fuel consumption by 20%",
        "cost": 250,
        "effect": {"fuel_efficiency": 0.8},
        "icon": "🚀"
    }
}

# Web-compatible navigation function
def web_navigation(session, target_node_id=None, target_region_id=None):
    """Navigation function for web interface that uses the region system"""
    import random
    
    if not session.star_map:
        # Fallback if no star map
        at_repair_location = random.choice([True, False])
        message = "Navigation system offline. Moving through unknown space."
        return at_repair_location, message, None
    
    current_region = session.star_map['regions'][session.current_region_id]
    current_node = None
    for node in current_region['nodes']:
        if node['id'] == session.current_node_id:
            current_node = node
            break
    
    if not current_node:
        return False, "Navigation error: Current location unknown.", None
    
    # Get ship stats for fuel calculation
    ship_info = SHIP_TYPES.get(session.player_stats.get('ship_type', 'scout'), SHIP_TYPES["scout"])
    base_fuel = config.FUEL_CONSUMPTION_RATE
    fuel_efficiency = ship_info["fuel_efficiency"]
    
    # Apply mod effects
    mods = session.player_stats.get('ship_mods', {})
    for slot_mods in mods.values():
        for mod_id in slot_mods:
            if mod_id in SHIP_MODS:
                mod_effects = SHIP_MODS[mod_id].get("effects", {})
                if "fuel_efficiency" in mod_effects:
                    fuel_efficiency *= mod_effects["fuel_efficiency"]
    
    # Apply pod augmentation effects
    if 'emergency_thrusters' in session.player_stats.get('pod_augmentations', []):
        fuel_efficiency *= 0.8
    
    # Navigation within region
    if target_node_id and not target_region_id:
        # Find target node
        target_node = None
        for node in current_region['nodes']:
            if node['id'] == target_node_id:
                target_node = node
                break
        
        if not target_node or target_node_id not in current_node['connections']:
            return False, "Cannot navigate to that location.", None
        
        fuel_cost = int(base_fuel * fuel_efficiency)
        if session.player_stats['fuel'] < fuel_cost:
            return False, "Insufficient fuel.", None
        
        session.player_stats['fuel'] -= fuel_cost
        session.current_node_id = target_node_id
        
        # Random events during travel
        if random.random() < target_node['danger_level']:
            damage = random.randint(5, 15)
            session.player_stats['ship_condition'] -= damage
            message = f"Danger encountered! Ship damaged (-{damage} HP). Arrived at {target_node['name']}."
            event_type = "danger"
        else:
            message = f"Traveled safely to {target_node['name']}."
            event_type = "navigation"
        
        # Mark as visited
        target_node['discovered'] = True
        target_node['visited'] = True
        
        return target_node['has_repair'], message, event_type
    
    # Region jump
    elif target_region_id:
        if target_region_id not in current_region['connections']:
            return False, "Cannot jump to that region from here.", None
        
        fuel_cost = 20 if current_node['type'] == 'wormhole' else 50
        if session.player_stats['fuel'] < fuel_cost:
            return False, "Insufficient fuel for region jump.", None
        
        session.player_stats['fuel'] -= fuel_cost
        target_region = session.star_map['regions'][target_region_id]
        
        # Find entry node
        entry_node = None
        for node in target_region['nodes']:
            if node['discovered']:
                entry_node = node
                break
        
        if not entry_node:
            entry_node = random.choice(target_region['nodes'])
            entry_node['discovered'] = True
            session.player_stats['wealth'] += 100
            message = f"Discovered new region: {target_region['name']}! (+100 wealth) Arrived at {entry_node['name']}."
        else:
            message = f"Jumped to {target_region['name']}. Arrived at {entry_node['name']}."
        
        session.current_region_id = target_region_id
        session.current_node_id = entry_node['id']
        
        return entry_node['has_repair'], message, "navigation"
    
    # Auto-navigation (random choice)
    else:
        # Get available options
        connected_nodes = [n for n in current_region['nodes'] if n['id'] in current_node['connections']]
        
        if connected_nodes:
            target = random.choice(connected_nodes)
            return web_navigation(session, target_node_id=target['id'])
        else:
            return current_node['has_repair'], "No available destinations.", "info"

app = Flask(__name__, template_folder='../templates', static_folder='../static')
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Game state management
game_sessions = {}
game_lock = threading.Lock()

class GameSession:
    def __init__(self, session_id):
        self.session_id = session_id
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
            "pod_max_hp": 30,
            "pod_augmentations": [],
            "in_pod_mode": False,
            "pod_animation_state": "idle",
            
            # New ship and inventory system
            "ship_type": "scout",
            "ship_mods": {
                "high": [],
                "mid": [],
                "low": [],
                "rig": []
            },
            "inventory": [],  # List of {item_id, quantity}
            "cargo_capacity": SHIP_TYPES["scout"]["cargo_capacity"],
            "used_cargo_space": 0
        }
        self.active_quest = None
        self.turn_count = 0
        self.at_repair_location = False
        self.game_over = False
        self.victory = False
        self.current_event = None
        self.available_choices = []
        
        # Star map and region data
        self.star_map = generate_new_star_map()
        self.current_region_id = self.star_map["current_region"]
        self.current_node_id = self.star_map["current_node"]
        
    def calculate_cargo_space(self):
        """Calculate used cargo space from inventory"""
        used_space = 0
        for item in self.player_stats["inventory"]:
            if item["item_id"] in ITEM_TYPES:
                weight = ITEM_TYPES[item["item_id"]]["weight"]
                used_space += weight * item["quantity"]
        return used_space
    
    def get_effective_stats(self):
        """Calculate effective stats including all modifications"""
        stats = self.player_stats.copy()
        ship_info = SHIP_TYPES[self.player_stats["ship_type"]]
        
        # Base ship stats
        stats["max_ship_condition"] = ship_info["max_hp"]
        stats["cargo_capacity"] = ship_info["cargo_capacity"]
        
        # Apply ship mod effects
        for slot_type, mods in self.player_stats["ship_mods"].items():
            for mod_id in mods:
                if mod_id in SHIP_MODS:
                    effects = SHIP_MODS[mod_id].get("effects", {})
                    
                    if "max_hp" in effects:
                        stats["max_ship_condition"] += effects["max_hp"]
                    if "cargo_capacity" in effects:
                        stats["cargo_capacity"] += effects["cargo_capacity"]
        
        # Apply pod augmentation effects
        if self.player_stats['has_flight_pod'] and not self.player_stats['in_pod_mode']:
            for aug_id in self.player_stats['pod_augmentations']:
                if aug_id in POD_AUGMENTATIONS:
                    effects = POD_AUGMENTATIONS[aug_id]['effect']
                    
                    if 'max_ship_condition' in effects:
                        stats['max_ship_condition'] += effects['max_ship_condition']
        
        # Update cargo space
        stats["used_cargo_space"] = self.calculate_cargo_space()
        
        return stats
    
    def to_dict(self):
        effective_stats = self.get_effective_stats()
        
        # Get current location info
        current_region = None
        current_node = None
        if self.star_map and self.current_region_id and self.current_node_id:
            current_region = self.star_map['regions'].get(self.current_region_id)
            if current_region:
                for node in current_region['nodes']:
                    if node['id'] == self.current_node_id:
                        current_node = node
                        break
        
        return {
            "player_stats": effective_stats,
            "active_quest": self.active_quest,
            "turn_count": self.turn_count,
            "at_repair_location": self.at_repair_location,
            "game_over": self.game_over,
            "victory": self.victory,
            "current_event": self.current_event,
            "available_choices": self.available_choices,
            "max_turns": config.MAX_TURNS,
            "pod_augmentations_info": {aug_id: POD_AUGMENTATIONS[aug_id] for aug_id in self.player_stats.get('pod_augmentations', [])},
            "ship_types": SHIP_TYPES,
            "ship_mods": SHIP_MODS,
            "item_types": ITEM_TYPES,
            "star_map": self.star_map,
            "current_region_id": self.current_region_id,
            "current_node_id": self.current_node_id,
            "current_location": {
                "region": current_region,
                "node": current_node
            } if current_region and current_node else None
        }

@app.route('/')
def index():
    """Serve the main game page"""
    return render_template('index.html')

@app.route('/favicon.ico')
def favicon():
    """Serve the favicon"""
    return send_from_directory(os.path.join(app.root_path, '..', 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/api/game/new', methods=['POST'])
def new_game():
    """Start a new game session"""
    try:
        data = request.json
        session_id = data.get('session_id', 'default')
        force_new = data.get('force_new', False)
        
        with game_lock:
            # Always create new session if force_new is True (for "New Journey")
            if force_new or session_id not in game_sessions:
                game_sessions[session_id] = GameSession(session_id)
            session = game_sessions[session_id]
        
        # Emit initial game state via WebSocket
        socketio.emit('game_state', session.to_dict(), room=session_id)
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "game_state": session.to_dict()
        })
    except Exception as e:
        print(f"Error creating new game: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to create new game session",
            "details": str(e)
        }), 500

@app.route('/api/game/load', methods=['POST'])
def load_game():
    """Load a saved game session"""
    data = request.json
    session_id = data.get('session_id', 'default')
    saved_state = data.get('saved_state', {})
    
    with game_lock:
        # Create new session and restore saved state
        session = GameSession(session_id)
        
        # Restore saved data
        if saved_state:
            # Restore star map
            if 'star_map' in saved_state:
                session.star_map = saved_state['star_map']
            if 'current_region_id' in saved_state:
                session.current_region_id = saved_state['current_region_id']
            if 'current_node_id' in saved_state:
                session.current_node_id = saved_state['current_node_id']
            
            # Restore player stats
            if 'player_stats' in saved_state:
                session.player_stats.update(saved_state['player_stats'])
            
            # Restore game progress
            if 'turn_count' in saved_state:
                session.turn_count = saved_state['turn_count']
            if 'active_quest' in saved_state:
                session.active_quest = saved_state['active_quest']
            
            # Update location status
            if session.star_map and session.current_node_id:
                current_region = session.star_map['regions'].get(session.current_region_id)
                if current_region:
                    for node in current_region['nodes']:
                        if node['id'] == session.current_node_id:
                            session.at_repair_location = node.get('has_repair', False)
                            break
        
        game_sessions[session_id] = session
    
    # Emit loaded game state via WebSocket
    socketio.emit('game_state', session.to_dict(), room=session_id)
    
    return jsonify({
        "success": True,
        "session_id": session_id,
        "game_state": session.to_dict()
    })

@app.route('/api/game/state/<session_id>', methods=['GET'])
def get_game_state(session_id):
    """Get current game state"""
    with game_lock:
        if session_id not in game_sessions:
            return jsonify({"error": "Session not found"}), 404
        
        session = game_sessions[session_id]
        return jsonify(session.to_dict())

@app.route('/api/game/ship_info/<session_id>', methods=['GET'])
def get_ship_info(session_id):
    """Get detailed ship information"""
    with game_lock:
        if session_id not in game_sessions:
            return jsonify({"error": "Session not found"}), 404
        
        session = game_sessions[session_id]
        ship_type = session.player_stats["ship_type"]
        ship_info = SHIP_TYPES[ship_type].copy()
        
        # Add equipped mods info
        ship_info["equipped_mods"] = {}
        for slot_type, mods in session.player_stats["ship_mods"].items():
            ship_info["equipped_mods"][slot_type] = [
                SHIP_MODS[mod_id] for mod_id in mods if mod_id in SHIP_MODS
            ]
        
        # Add effective stats
        effective_stats = session.get_effective_stats()
        ship_info["effective_stats"] = {
            "max_hp": effective_stats["max_ship_condition"],
            "cargo_capacity": effective_stats["cargo_capacity"],
            "used_cargo_space": effective_stats["used_cargo_space"]
        }
        
        return jsonify(ship_info)

@app.route('/api/game/navigation_options/<session_id>', methods=['GET'])
def get_navigation_options(session_id):
    """Get available navigation options"""
    with game_lock:
        if session_id not in game_sessions:
            return jsonify({"error": "Session not found"}), 404
        
        session = game_sessions[session_id]
        
        if not session.star_map:
            return jsonify({"options": []})
        
        options = []
        current_region = session.star_map['regions'][session.current_region_id]
        current_node = None
        
        for node in current_region['nodes']:
            if node['id'] == session.current_node_id:
                current_node = node
                break
        
        if not current_node:
            return jsonify({"options": []})
        
        # Add connected nodes
        for node_id in current_node['connections']:
            for node in current_region['nodes']:
                if node['id'] == node_id:
                    options.append({
                        "type": "node",
                        "id": node['id'],
                        "name": node['name'],
                        "node_type": node['type'],
                        "visited": node['visited'],
                        "has_repair": node['has_repair'],
                        "has_trade": node['has_trade'],
                        "danger_level": node['danger_level'],
                        "fuel_cost": config.FUEL_CONSUMPTION_RATE
                    })
                    break
        
        # Add region jumps if available
        if current_node['type'] == 'wormhole' or session.player_stats['fuel'] >= 50:
            for region_id in current_region['connections']:
                if region_id in session.star_map['regions']:
                    other_region = session.star_map['regions'][region_id]
                    fuel_cost = 20 if current_node['type'] == 'wormhole' else 50
                    options.append({
                        "type": "region",
                        "id": region_id,
                        "name": other_region['name'],
                        "region_type": other_region['type'],
                        "fuel_cost": fuel_cost
                    })
        
        return jsonify({
            "options": options,
            "current_location": {
                "region": current_region['name'],
                "node": current_node['name'],
                "type": current_node['type']
            }
        })

@app.route('/api/game/action/<session_id>', methods=['POST'])
def perform_action(session_id, action_type=None):
    """Perform a game action"""
    with game_lock:
        if session_id not in game_sessions:
            return jsonify({"error": "Session not found"}), 404
        
        session = game_sessions[session_id]
        data = request.json
        action = data.get('action', action_type)
        choice = data.get('choice')
        
        result = process_action(session, action, choice, data)
        
        # Emit updated game state via WebSocket
        socketio.emit('game_state', session.to_dict(), room=session_id)
        
        if result.get('event'):
            socketio.emit('game_event', {
                'type': result['event_type'],
                'message': result['event'],
                'choices': result.get('choices', [])
            }, room=session_id)
        
        return jsonify({
            "success": True,
            "result": result,
            "game_state": session.to_dict()
        })

def process_action(session, action, choice=None, data=None):
    """Process game actions and return results"""
    import random
    
    result = {
        "event": None,
        "event_type": "info",
        "choices": []
    }
    
    # Check game over conditions
    if session.player_stats['health'] <= 0:
        session.game_over = True
        result['event'] = "Game Over: Your health has depleted."
        result['event_type'] = "game_over"
        return result
    
    if session.player_stats['ship_condition'] <= 0 and not session.player_stats['in_pod_mode']:
        if session.player_stats['has_flight_pod']:
            # Activate pod mode
            session.player_stats['in_pod_mode'] = True
            session.player_stats['pod_hp'] = session.player_stats['pod_max_hp']
            session.player_stats['pod_animation_state'] = "ejecting"
            
            # Lose most cargo
            cargo_saved = []
            if 'cargo_module' in session.player_stats.get('pod_augmentations', []):
                # Save some valuable items
                valuable_items = sorted(
                    session.player_stats["inventory"],
                    key=lambda x: ITEM_TYPES.get(x["item_id"], {}).get("base_value", 0) * x["quantity"],
                    reverse=True
                )
                
                pod_capacity = 10
                used_space = 0
                for item in valuable_items:
                    item_weight = ITEM_TYPES[item["item_id"]]["weight"] * item["quantity"]
                    if used_space + item_weight <= pod_capacity:
                        cargo_saved.append(item)
                        used_space += item_weight
            
            session.player_stats["inventory"] = cargo_saved
            
            result['event'] = "Ship destroyed! Emergency pod activated. You have 30 HP to reach safety!"
            if cargo_saved:
                result['event'] += f" Managed to save {len(cargo_saved)} items in the pod."
            result['event_type'] = "pod_activated"
            result['choices'] = ["Navigate to nearest planet/outpost", "Try to send distress signal"]
            return result
        else:
            session.game_over = True
            result['event'] = "Game Over: Your ship is destroyed and you have no escape pod."
            result['event_type'] = "game_over"
            return result
    
    # Check pod destruction
    if session.player_stats['in_pod_mode'] and session.player_stats['pod_hp'] <= 0:
        session.game_over = True
        result['event'] = "Game Over: Your escape pod has been destroyed."
        result['event_type'] = "game_over"
        return result
    
    if session.player_stats['fuel'] <= 0:
        session.game_over = True
        result['event'] = "Game Over: Out of fuel."
        result['event_type'] = "game_over"
        return result
    
    # Check victory condition
    if session.player_stats['wealth'] >= config.VICTORY_WEALTH_THRESHOLD:
        session.victory = True
        session.game_over = True
        result['event'] = "Victory! You've amassed great wealth!"
        result['event_type'] = "victory"
        return result
    
    # Process different actions
    if action == "navigate":
        session.turn_count += 1
        # Reset just bought pod flag
        if 'just_bought_pod' in session.player_stats:
            session.player_stats['just_bought_pod'] = False
        
        # Get navigation target from data
        target_node_id = data.get('target_node_id') if data else None
        target_region_id = data.get('target_region_id') if data else None
        
        # Pod mode navigation is dangerous
        if session.player_stats['in_pod_mode']:
            # Simplified navigation in pod mode
            session.at_repair_location, nav_message, event_type = web_navigation(session, target_node_id, target_region_id)
            
            # Pod takes damage during travel
            damage_chance = random.random()
            if damage_chance < 0.3:  # 30% chance of damage
                damage = 10
                session.player_stats['pod_hp'] -= damage
                session.player_stats['pod_animation_state'] = "damaged"
                result['event'] = f"{nav_message} WARNING: Pod hull damaged! Lost {damage} HP. Pod HP: {session.player_stats['pod_hp']}/{session.player_stats['pod_max_hp']}"
                result['event_type'] = "danger"
            else:
                session.player_stats['pod_animation_state'] = "active"
                result['event'] = f"{nav_message} Pod holding steady. Pod HP: {session.player_stats['pod_hp']}/{session.player_stats['pod_max_hp']}"
                result['event_type'] = event_type or "navigation"
                
            # Check if reached safety
            if session.at_repair_location:
                result['choices'] = ["Buy new ship (400+ wealth)", "Wait and conserve resources"]
        else:
            # Regular navigation with region system
            session.at_repair_location, nav_message, event_type = web_navigation(session, target_node_id, target_region_id)
            result['event'] = nav_message
            result['event_type'] = event_type or "navigation"
        
    elif action == "event":
        # Enhanced random events that can give items
        event_roll = random.random()
        
        if event_roll < 0.3:  # 30% chance of item event
            # Item-based events
            item_events = [
                ("Discover abandoned cargo", "rare_minerals", 3, "You find valuable minerals floating in space!"),
                ("Salvage operation", "data_cores", 2, "You recover encrypted data cores from a wreck!"),
                ("Trading opportunity", "luxury_goods", 1, "A merchant gifts you luxury goods as a sample!"),
                ("Ancient ruins", "alien_artifacts", 1, "You discover a mysterious alien artifact!"),
                ("Emergency supplies", "repair_nanobots", 2, "You find emergency repair supplies!")
            ]
            
            event, item_id, quantity, message = random.choice(item_events)
            
            # Check cargo space
            item_weight = ITEM_TYPES[item_id]["weight"] * quantity
            effective_stats = session.get_effective_stats()
            available_space = effective_stats["cargo_capacity"] - effective_stats["used_cargo_space"]
            
            if item_weight <= available_space:
                # Add item to inventory
                existing_item = next((item for item in session.player_stats["inventory"] if item["item_id"] == item_id), None)
                if existing_item:
                    existing_item["quantity"] += quantity
                else:
                    session.player_stats["inventory"].append({"item_id": item_id, "quantity": quantity})
                
                result['event'] = f"{event} - {message} (+{quantity} {ITEM_TYPES[item_id]['name']})"
                result['event_type'] = "success"
            else:
                result['event'] = f"{event} - But your cargo hold is too full! You had to leave it behind."
                result['event_type'] = "info"
        else:
            # Standard stat-based events
            events = [
                ("Encounter alien traders", "wealth", 100, "You trade successfully! Wealth increased."),
                ("Hit by cosmic anomaly", "ship_condition", -20, "Your ship takes damage! Ship condition decreased."),
                ("Navigate through asteroid field", "fuel", -10, "Maneuvering consumes extra fuel! Fuel decreased."),
                ("Find a fuel depot", "fuel", 30, "You refuel your ship! Fuel increased."),
                ("Face pirate ambush", "health", -25, "Pirates attack! Health decreased."),
                ("Discover food supplies", "food", 20, "You find edible resources! Food supplies increased.")
            ]
            event, stat, change, message = random.choice(events)
            
            # Apply scanner bonuses
            if stat == "wealth" and change > 0:
                # Check for scanner array pod augmentation
                if 'scanner_array' in session.player_stats.get('pod_augmentations', []):
                    change = int(change * 2)
                    message += " (Scanner Array bonus!)"
                
                # Check for scanner ship mod
                for mods in session.player_stats["ship_mods"].values():
                    if "scanner_upgrade" in mods:
                        change = int(change * 1.5)
                        message += " (Ship Scanner bonus!)"
            
            session.player_stats[stat] += change
            result['event'] = f"{event} - {message}"
            result['event_type'] = "random_event" if change < 0 else "success"
        
    elif action == "repair":
        if session.at_repair_location and session.player_stats['wealth'] >= 100:
            session.player_stats['wealth'] -= 100
            session.player_stats['ship_condition'] = session.get_effective_stats()['max_ship_condition']
            result['event'] = "Ship repaired!"
            result['event_type'] = "repair"
        else:
            result['event'] = "Cannot repair ship here or insufficient wealth."
            result['event_type'] = "error"
            
    elif action == "buy_ship":
        ship_type = data.get('ship_type', 'scout') if data else 'scout'
        
        if ship_type not in SHIP_TYPES:
            result['event'] = "Invalid ship type."
            result['event_type'] = "error"
        elif session.player_stats['wealth'] < SHIP_TYPES[ship_type]['cost']:
            result['event'] = f"Insufficient wealth. Need {SHIP_TYPES[ship_type]['cost']}."
            result['event_type'] = "error"
        elif not session.at_repair_location:
            result['event'] = "Must be at a repair location to buy a ship."
            result['event_type'] = "error"
        else:
            ship_info = SHIP_TYPES[ship_type]
            session.player_stats['wealth'] -= ship_info['cost']
            session.player_stats['ship_type'] = ship_type
            session.player_stats['ship_condition'] = ship_info['max_hp']
            session.player_stats['max_ship_condition'] = ship_info['max_hp']
            session.player_stats['base_max_ship_condition'] = ship_info['max_hp']
            session.player_stats['cargo_capacity'] = ship_info['cargo_capacity']
            
            # Reset mods for new ship
            session.player_stats['ship_mods'] = {
                "high": [],
                "mid": [],
                "low": [],
                "rig": []
            }
            
            # Exit pod mode if applicable
            if session.player_stats['in_pod_mode']:
                session.player_stats['in_pod_mode'] = False
                session.player_stats['has_flight_pod'] = False
                session.player_stats['pod_hp'] = 0
                session.player_stats['pod_augmentations'] = []
                session.player_stats['pod_animation_state'] = "idle"
            
            result['event'] = f"{ship_info['icon']} {ship_info['name']} purchased! {ship_info['description']}"
            result['event_type'] = "purchase"
            
    elif action == "buy_mod":
        mod_id = data.get('mod_id') if data else None
        
        if not mod_id or mod_id not in SHIP_MODS:
            result['event'] = "Invalid modification."
            result['event_type'] = "error"
        elif not session.at_repair_location:
            result['event'] = "Must be at a repair location to install modifications."
            result['event_type'] = "error"
        else:
            mod_info = SHIP_MODS[mod_id]
            slot_type = mod_info['slot']
            ship_info = SHIP_TYPES[session.player_stats['ship_type']]
            
            # Check if ship has available slot
            current_mods_in_slot = len(session.player_stats['ship_mods'][slot_type])
            max_slots = ship_info['slots'][slot_type]
            
            if current_mods_in_slot >= max_slots:
                result['event'] = f"No available {slot_type} slots on your {ship_info['name']}."
                result['event_type'] = "error"
            elif session.player_stats['wealth'] < mod_info['cost']:
                result['event'] = f"Insufficient wealth. Need {mod_info['cost']}."
                result['event_type'] = "error"
            else:
                # Purchase and install mod
                session.player_stats['wealth'] -= mod_info['cost']
                session.player_stats['ship_mods'][slot_type].append(mod_id)
                
                result['event'] = f"{mod_info['icon']} {mod_info['name']} installed! {mod_info['description']}"
                result['event_type'] = "purchase"
                
    elif action == "remove_mod":
        mod_id = data.get('mod_id') if data else None
        slot_type = data.get('slot_type') if data else None
        
        if not mod_id or not slot_type:
            result['event'] = "Invalid modification removal request."
            result['event_type'] = "error"
        elif not session.at_repair_location:
            result['event'] = "Must be at a repair location to remove modifications."
            result['event_type'] = "error"
        elif mod_id not in session.player_stats['ship_mods'][slot_type]:
            result['event'] = "Modification not installed."
            result['event_type'] = "error"
        else:
            mod_info = SHIP_MODS[mod_id]
            
            # Check if it's a permanent rig
            if mod_info.get('permanent', False):
                result['event'] = "Rig modifications are permanent and cannot be removed."
                result['event_type'] = "error"
            else:
                # Remove mod
                session.player_stats['ship_mods'][slot_type].remove(mod_id)
                
                # Refund 50% of cost
                refund = mod_info['cost'] // 2
                session.player_stats['wealth'] += refund
                
                result['event'] = f"{mod_info['name']} removed. Received {refund} credits as salvage value."
                result['event_type'] = "info"
                
    elif action == "use_item":
        item_id = data.get('item_id') if data else None
        
        if not item_id:
            result['event'] = "No item specified."
            result['event_type'] = "error"
        else:
            # Find item in inventory
            inventory_item = next((item for item in session.player_stats["inventory"] if item["item_id"] == item_id), None)
            
            if not inventory_item:
                result['event'] = "Item not in inventory."
                result['event_type'] = "error"
            elif item_id not in ITEM_TYPES:
                result['event'] = "Unknown item type."
                result['event_type'] = "error"
            else:
                item_info = ITEM_TYPES[item_id]
                
                if item_info['category'] != 'consumable':
                    result['event'] = "This item cannot be used directly."
                    result['event_type'] = "error"
                else:
                    # Apply item effect
                    effects = item_info.get('effect', {})
                    
                    if 'ship_condition' in effects:
                        old_hp = session.player_stats['ship_condition']
                        max_hp = session.get_effective_stats()['max_ship_condition']
                        session.player_stats['ship_condition'] = min(
                            session.player_stats['ship_condition'] + effects['ship_condition'],
                            max_hp
                        )
                        actual_heal = session.player_stats['ship_condition'] - old_hp
                        result['event'] = f"Used {item_info['name']}. Ship repaired by {actual_heal} HP!"
                        result['event_type'] = "heal"
                    
                    elif 'fuel' in effects:
                        old_fuel = session.player_stats['fuel']
                        session.player_stats['fuel'] = min(
                            session.player_stats['fuel'] + effects['fuel'],
                            100
                        )
                        actual_fuel = session.player_stats['fuel'] - old_fuel
                        result['event'] = f"Used {item_info['name']}. Gained {actual_fuel} fuel!"
                        result['event_type'] = "success"
                    
                    # Remove one item from inventory
                    inventory_item['quantity'] -= 1
                    if inventory_item['quantity'] <= 0:
                        session.player_stats["inventory"].remove(inventory_item)
                        
    elif action == "sell_item":
        item_id = data.get('item_id') if data else None
        quantity = data.get('quantity', 1) if data else 1
        
        if not session.at_repair_location:
            result['event'] = "Must be at a trading location to sell items."
            result['event_type'] = "error"
        elif not item_id:
            result['event'] = "No item specified."
            result['event_type'] = "error"
        else:
            # Find item in inventory
            inventory_item = next((item for item in session.player_stats["inventory"] if item["item_id"] == item_id), None)
            
            if not inventory_item:
                result['event'] = "Item not in inventory."
                result['event_type'] = "error"
            elif inventory_item['quantity'] < quantity:
                result['event'] = f"Insufficient quantity. You have {inventory_item['quantity']}."
                result['event_type'] = "error"
            else:
                item_info = ITEM_TYPES[item_id]
                
                # Calculate price with some variance
                base_price = item_info['base_value']
                price_variance = random.uniform(0.8, 1.2)
                sell_price = int(base_price * price_variance * quantity)
                
                # Complete sale
                session.player_stats['wealth'] += sell_price
                inventory_item['quantity'] -= quantity
                if inventory_item['quantity'] <= 0:
                    session.player_stats["inventory"].remove(inventory_item)
                
                result['event'] = f"Sold {quantity} {item_info['name']} for {sell_price} credits!"
                result['event_type'] = "success"
    
    # Keep original pod-related actions
    elif action == "buy_pod":
        if session.player_stats['wealth'] >= 500 and not session.player_stats['has_flight_pod']:
            session.player_stats['wealth'] -= 500
            session.player_stats['has_flight_pod'] = True
            session.player_stats['pod_hp'] = session.player_stats['pod_max_hp']
            session.player_stats['pod_augmentations'] = []
            session.player_stats['just_bought_pod'] = True
            result['event'] = "Emergency escape pod purchased! This life-saving device will activate if your ship is destroyed."
            result['event_type'] = "purchase"
        else:
            result['event'] = "Cannot purchase flight pod. Need 500 wealth and must not already own one."
            result['event_type'] = "error"
            
    elif action == "buy_augmentation":
        aug_id = data.get('augmentation_id') if data else None
        if not aug_id or aug_id not in POD_AUGMENTATIONS:
            result['event'] = "Invalid augmentation."
            result['event_type'] = "error"
        elif not session.player_stats['has_flight_pod']:
            result['event'] = "You need a pod to install augmentations."
            result['event_type'] = "error"
        elif session.player_stats['in_pod_mode']:
            result['event'] = "Cannot install augmentations while in pod mode."
            result['event_type'] = "error"
        elif not session.at_repair_location:
            result['event'] = "Must be at a repair location to install augmentations."
            result['event_type'] = "error"
        elif session.player_stats.get('just_bought_pod', False):
            result['event'] = "Must navigate at least once after buying pod before installing augmentations."
            result['event_type'] = "error"
        elif aug_id in session.player_stats.get('pod_augmentations', []):
            result['event'] = "Augmentation already installed."
            result['event_type'] = "error"
        elif session.player_stats['wealth'] < POD_AUGMENTATIONS[aug_id]['cost']:
            result['event'] = f"Insufficient wealth. Need {POD_AUGMENTATIONS[aug_id]['cost']}."
            result['event_type'] = "error"
        else:
            # Purchase augmentation
            session.player_stats['wealth'] -= POD_AUGMENTATIONS[aug_id]['cost']
            session.player_stats['pod_augmentations'].append(aug_id)
            aug_info = POD_AUGMENTATIONS[aug_id]
            result['event'] = f"{aug_info['icon']} {aug_info['name']} installed! {aug_info['description']}"
            result['event_type'] = "purchase"
            
    elif action == "consume_food":
        amount = data.get('amount', 10) if data else 10
        health_gain = amount * 2
        
        if session.player_stats['food'] >= amount:
            session.player_stats['food'] -= amount
            old_health = session.player_stats['health']
            session.player_stats['health'] = min(
                session.player_stats['health'] + health_gain,
                config.STARTING_HEALTH
            )
            actual_health_gained = session.player_stats['health'] - old_health
            result['event'] = f"Consumed {amount} food units. Health restored by {actual_health_gained} points!"
            result['event_type'] = "heal"
        else:
            result['event'] = f"Insufficient food supplies. Need {amount} but only have {session.player_stats['food']}."
            result['event_type'] = "error"
    
    return result

@socketio.on('connect')
def handle_connect():
    """Handle WebSocket connection"""
    print('Client connected')
    emit('connected', {'data': 'Connected to Cosmic Explorer server'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection"""
    print('Client disconnected')

@socketio.on('join_session')
def handle_join_session(data):
    """Join a game session for WebSocket updates"""
    session_id = data.get('session_id', 'default')
    join_room(session_id)
    emit('joined_session', {'session_id': session_id})

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
