#!/usr/bin/env python3
"""
Flask API backend for Cosmic Explorer
Provides REST endpoints and WebSocket support for the graphical frontend
Refactored to use modular system components
"""

from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room
import os
import sys
import threading

# Add parent directory to path to import game modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import config
from ship_system import SHIP_TYPES, SHIP_MODS, ShipManager
from inventory_system import ITEM_TYPES, InventoryManager
from pod_system import POD_AUGMENTATIONS, PodManager
from session_manager import SessionManager
from action_processor import ActionProcessor
from save_manager import (save_game_to_slot, load_game_from_slot, list_all_saves,
                         delete_save_slot, get_save_info, get_current_location_name)

# Initialize Flask app
app = Flask(__name__, template_folder='../templates', static_folder='../static')
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize managers
session_manager = SessionManager()
action_processor = ActionProcessor()
game_lock = threading.Lock()


# Navigation function for web interface
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
    effective_stats = session.get_effective_stats()
    base_fuel = config.FUEL_CONSUMPTION_RATE
    fuel_efficiency = effective_stats.get("fuel_efficiency", 1.0)
    
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
            session = session_manager.create_session(session_id, force_new)
        
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
        session = session_manager.create_session(session_id, force_new=True)
        
        if saved_state:
            session.load_from_dict(saved_state)
    
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
        session = session_manager.get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404
        
        return jsonify(session.to_dict())


@app.route('/api/game/ship_info/<session_id>', methods=['GET'])
def get_ship_info(session_id):
    """Get detailed ship information"""
    with game_lock:
        session = session_manager.get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404
        
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
            "used_cargo_space": effective_stats["used_cargo_space"],
            "fuel_efficiency": effective_stats.get("fuel_efficiency", 1.0),
            "speed": effective_stats.get("speed", 1.0),
            "combat_power": effective_stats.get("combat_power", 0)
        }
        
        return jsonify(ship_info)


@app.route('/api/game/inventory/<session_id>', methods=['GET'])
def get_inventory(session_id):
    """Get detailed inventory information"""
    with game_lock:
        session = session_manager.get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404
        
        # Get inventory with item details
        inventory_details = []
        for item in session.player_stats["inventory"]:
            if item["item_id"] in ITEM_TYPES:
                item_info = ITEM_TYPES[item["item_id"]].copy()
                item_info["quantity"] = item["quantity"]
                item_info["total_weight"] = item_info["weight"] * item["quantity"]
                item_info["total_value"] = item_info["base_value"] * item["quantity"]
                inventory_details.append(item_info)
        
        effective_stats = session.get_effective_stats()
        
        return jsonify({
            "inventory": inventory_details,
            "cargo_capacity": effective_stats["cargo_capacity"],
            "used_space": effective_stats["used_cargo_space"],
            "total_value": InventoryManager.get_inventory_value(session.player_stats["inventory"])
        })


@app.route('/api/game/navigation_options/<session_id>', methods=['GET'])
def get_navigation_options(session_id):
    """Get available navigation options"""
    with game_lock:
        session = session_manager.get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404
        
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


@app.route('/api/game/available_mods/<session_id>', methods=['GET'])
def get_available_mods(session_id):
    """Get available ship modifications"""
    with game_lock:
        session = session_manager.get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404
        
        ship_info = SHIP_TYPES[session.player_stats["ship_type"]]
        available_mods = {}
        
        for slot_type in ["high", "mid", "low", "rig"]:
            # Get mods for this slot type
            slot_mods = ShipManager.get_available_mods_for_slot(slot_type)
            
            # Filter out already installed mods
            installed = session.player_stats["ship_mods"].get(slot_type, [])
            available = {
                mod_id: mod_info
                for mod_id, mod_info in slot_mods.items()
                if mod_id not in installed
            }
            
            # Add slot availability info
            available_mods[slot_type] = {
                "max_slots": ship_info["slots"][slot_type],
                "used_slots": len(installed),
                "available_mods": available
            }
        
        return jsonify(available_mods)


@app.route('/api/game/action/<session_id>', methods=['POST'])
def perform_action(session_id):
    """Perform a game action"""
    with game_lock:
        session = session_manager.get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404
        
        data = request.json
        action = data.get('action')
        
        # Process action
        result = action_processor.process_action(session, action, data)
        
        # Update game state based on action type and pod augmentations
        # This ensures the UI updates properly
        game_state = session.to_dict()
        game_state["pod_augmentations_info"] = {
            aug_id: POD_AUGMENTATIONS[aug_id] 
            for aug_id in session.player_stats.get('pod_augmentations', [])
        }
        game_state["ship_types"] = SHIP_TYPES
        game_state["ship_mods"] = SHIP_MODS
        game_state["item_types"] = ITEM_TYPES
        
        # Emit updated game state via WebSocket
        socketio.emit('game_state', game_state, room=session_id)
        
        # Emit event if present
        if result.get('event'):
            event_data = {
                'type': result['event_type'],
                'message': result['event']
            }
            
            # Only include choices if they exist and are non-empty
            choices = result.get('choices', [])
            if choices and len(choices) > 0:
                event_data['choices'] = choices
            
            socketio.emit('game_event', event_data, room=session_id)
        
        return jsonify({
            "success": result.get("success", False),
            "result": result,
            "game_state": game_state
        })


@app.route('/api/game/statistics/<session_id>', methods=['GET'])
def get_statistics(session_id):
    """Get game statistics"""
    with game_lock:
        session = session_manager.get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404
        
        return jsonify(session.statistics)


@app.route('/api/saves', methods=['GET'])
def list_saves():
    """List all save files with metadata"""
    try:
        saves = list_all_saves()
        return jsonify({
            "success": True,
            "saves": saves,
            "max_slots": config.MAX_SAVE_SLOTS
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/saves/<int:slot>', methods=['POST'])
def save_to_slot(slot):
    """Save current game to a specific slot"""
    if slot < 0 or slot >= config.MAX_SAVE_SLOTS:
        return jsonify({
            "success": False,
            "error": f"Invalid slot number. Must be between 0 and {config.MAX_SAVE_SLOTS-1}"
        }), 400
    
    data = request.json
    session_id = data.get('session_id', 'default')
    
    with game_lock:
        session = session_manager.get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404
        
        try:
            # Get current location name
            location_name = get_current_location_name(
                session.star_map,
                session.current_region_id,
                session.current_node_id
            )
            
            # Save to slot
            metadata = save_game_to_slot(session.to_save_dict(), slot, location_name)
            
            return jsonify({
                "success": True,
                "slot": slot,
                "metadata": metadata
            })
        except Exception as e:
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500


@app.route('/api/saves/<int:slot>', methods=['GET'])
def get_save_slot_info(slot):
    """Get information about a specific save slot"""
    if slot < 0 or slot >= config.MAX_SAVE_SLOTS:
        return jsonify({
            "success": False,
            "error": f"Invalid slot number. Must be between 0 and {config.MAX_SAVE_SLOTS-1}"
        }), 400
    
    try:
        save_info = get_save_info(slot)
        if save_info:
            return jsonify({
                "success": True,
                "slot": slot,
                "metadata": save_info,
                "is_autosave": slot == config.AUTO_SAVE_SLOT
            })
        else:
            return jsonify({
                "success": False,
                "error": "No save found in this slot"
            }), 404
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/saves/<int:slot>', methods=['DELETE'])
def delete_save(slot):
    """Delete a save file from a specific slot"""
    if slot < 0 or slot >= config.MAX_SAVE_SLOTS:
        return jsonify({
            "success": False,
            "error": f"Invalid slot number. Must be between 0 and {config.MAX_SAVE_SLOTS-1}"
        }), 400
    
    # Prevent deleting auto-save while game is active
    if slot == config.AUTO_SAVE_SLOT:
        return jsonify({
            "success": False,
            "error": "Cannot delete auto-save slot"
        }), 400
    
    try:
        deleted = delete_save_slot(slot)
        if deleted:
            return jsonify({
                "success": True,
                "message": f"Save in slot {slot} deleted"
            })
        else:
            return jsonify({
                "success": False,
                "error": "No save found in this slot"
            }), 404
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/load/<int:slot>', methods=['POST'])
def load_from_slot(slot):
    """Load a game from a specific slot"""
    if slot < 0 or slot >= config.MAX_SAVE_SLOTS:
        return jsonify({
            "success": False,
            "error": f"Invalid slot number. Must be between 0 and {config.MAX_SAVE_SLOTS-1}"
        }), 400
    
    data = request.json
    session_id = data.get('session_id', 'default')
    
    with game_lock:
        try:
            # Load save data
            saved_state = load_game_from_slot(slot)
            if not saved_state:
                return jsonify({
                    "success": False,
                    "error": "No save found in this slot"
                }), 404
            
            # Create new session and load state
            session = session_manager.create_session(session_id, force_new=True)
            session.load_from_dict(saved_state)
            
            # Emit loaded game state via WebSocket
            socketio.emit('game_state', session.to_dict(), room=session_id)
            
            return jsonify({
                "success": True,
                "session_id": session_id,
                "game_state": session.to_dict()
            })
        except Exception as e:
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500


# Backwards compatibility - keep old save endpoint
@app.route('/api/game/save/<session_id>', methods=['POST'])
def save_game_legacy(session_id):
    """Legacy save endpoint - saves to auto-save slot"""
    with game_lock:
        session = session_manager.get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404
        
        try:
            # Get current location name
            location_name = get_current_location_name(
                session.star_map,
                session.current_region_id,
                session.current_node_id
            )
            
            # Save to auto-save slot
            metadata = save_game_to_slot(session.to_save_dict(), config.AUTO_SAVE_SLOT, location_name)
            
            return jsonify({
                "success": True,
                "slot": config.AUTO_SAVE_SLOT,
                "metadata": metadata
            })
        except Exception as e:
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500


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


@socketio.on('leave_session')
def handle_leave_session(data):
    """Leave a game session"""
    session_id = data.get('session_id', 'default')
    # Note: Flask-SocketIO automatically removes clients from rooms on disconnect
    emit('left_session', {'session_id': session_id})


# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


# Cleanup task
def cleanup_sessions():
    """Periodic cleanup of old sessions"""
    import time
    while True:
        time.sleep(300)  # Run every 5 minutes
        with game_lock:
            session_manager.cleanup_old_sessions()


# Start cleanup thread
import threading
cleanup_thread = threading.Thread(target=cleanup_sessions, daemon=True)
cleanup_thread.start()


if __name__ == '__main__':
    # Ensure save directory exists
    os.makedirs('saves', exist_ok=True)
    
    # Run the application
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
