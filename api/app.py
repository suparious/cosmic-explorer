#!/usr/bin/env python3
"""
Flask API backend for Cosmic Explorer
Provides REST endpoints and WebSocket support for the graphical frontend
"""

from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room
import json
import os
import sys
import threading
import time

# Add parent directory to path to import game modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import config
import game

# Pod augmentation definitions
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
def web_navigation(player_stats, choice=None, augmentations=None):
    """Navigation function for web interface that doesn't use terminal input"""
    import random
    at_repair_location = False
    
    # Random choice if not specified
    if choice is None:
        choice = random.choice(['planet', 'route'])
    
    # Calculate fuel consumption with augmentation effects
    fuel_consumption = config.FUEL_CONSUMPTION_RATE
    if augmentations and 'emergency_thrusters' in augmentations:
        fuel_consumption = int(fuel_consumption * 0.8)  # 20% reduction
    
    if choice == 'planet':
        player_stats['ship_condition'] -= 5
        player_stats['fuel'] -= fuel_consumption
        at_repair_location = True
        message = "You approach a planet and dock at an outpost. Repairs available!"
    else:
        player_stats['fuel'] -= fuel_consumption
        message = "You proceed smoothly through space."
    
    return at_repair_location, message

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
            "base_max_ship_condition": config.STARTING_SHIP_CONDITION,  # Track base without augmentations
            "fuel": config.STARTING_FUEL,
            "food": config.STARTING_FOOD,
            "has_flight_pod": False,
            "pod_hp": 0,
            "pod_max_hp": 30,  # Maximum pod HP
            "pod_augmentations": [],  # List of installed augmentations
            "in_pod_mode": False,  # True when ship destroyed, using pod
            "pod_animation_state": "idle"  # idle, ejecting, active, damaged
        }
        self.active_quest = None
        self.turn_count = 0
        self.at_repair_location = False
        self.game_over = False
        self.victory = False
        self.current_event = None
        self.available_choices = []
        
    def get_effective_stats(self):
        """Calculate effective stats including pod augmentation bonuses"""
        stats = self.player_stats.copy()
        
        # Apply augmentation effects
        if self.player_stats['has_flight_pod'] and not self.player_stats['in_pod_mode']:
            for aug_id in self.player_stats['pod_augmentations']:
                if aug_id in POD_AUGMENTATIONS:
                    effects = POD_AUGMENTATIONS[aug_id]['effect']
                    
                    # Shield boost
                    if 'max_ship_condition' in effects:
                        stats['max_ship_condition'] += effects['max_ship_condition']
                        # Also boost current condition proportionally
                        if stats['ship_condition'] == self.player_stats['max_ship_condition']:
                            stats['ship_condition'] = stats['max_ship_condition']
        
        return stats
    
    def to_dict(self):
        effective_stats = self.get_effective_stats()
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
            "pod_augmentations_info": {aug_id: POD_AUGMENTATIONS[aug_id] for aug_id in self.player_stats.get('pod_augmentations', [])}
        }

@app.route('/')
def index():
    """Serve the main game page"""
    return render_template('index.html')

@app.route('/api/game/new', methods=['POST'])
def new_game():
    """Start a new game session"""
    data = request.json
    session_id = data.get('session_id', 'default')
    
    with game_lock:
        game_sessions[session_id] = GameSession(session_id)
        session = game_sessions[session_id]
    
    # Emit initial game state via WebSocket
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
            result['event'] = "Ship destroyed! Emergency pod activated. You have 30 HP to reach safety!"
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
        
        # Pod mode navigation is dangerous
        if session.player_stats['in_pod_mode']:
            session.at_repair_location, nav_message = web_navigation(session.player_stats)
            
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
                result['event_type'] = "navigation"
                
            # Check if reached safety
            if session.at_repair_location:
                result['choices'] = ["Buy new ship (400 wealth)", "Wait and conserve resources"]
        else:
            # Pass augmentations for fuel efficiency
            session.at_repair_location, nav_message = web_navigation(
                session.player_stats, 
                augmentations=session.player_stats.get('pod_augmentations', [])
            )
            result['event'] = nav_message
            result['event_type'] = "navigation"
        
    elif action == "quest":
        if not session.active_quest:
            # Web-compatible quest offering
            quests = [
                {"name": "Rescue Mission", "reward": 300, "risk": "health", "status": "Locate stranded crew", "reward_type": "wealth"},
                {"name": "Artifact Hunt", "reward": 500, "risk": "ship_condition", "status": "Find ancient relic", "reward_type": "wealth"},
                {"name": "Fuel Expedition", "reward": 50, "risk": "fuel", "status": "Secure fuel reserves", "reward_type": "fuel"},
                {"name": "Diplomatic Encounter", "reward": 200, "risk": "health", "status": "Negotiate with alien leaders", "reward_type": "wealth"}
            ]
            quest = random.choice(quests)
            session.active_quest = quest
            result['event'] = f"New quest available: {quest['name']} - {quest['status']}. Reward: {quest['reward']} {quest['reward_type']}"
            result['event_type'] = "quest"
                
    elif action == "event":
        # Web-compatible random event
        events = [
            ("Encounter alien traders", "wealth", 100, "You trade successfully! Wealth increased."),
            ("Hit by cosmic anomaly", "ship_condition", -20, "Your ship takes damage! Ship condition decreased."),
            ("Discover abandoned ship", "wealth", 150, "You salvage resources! Wealth increased."),
            ("Navigate through asteroid field", "fuel", -10, "Maneuvering consumes extra fuel! Fuel decreased."),
            ("Find a fuel depot", "fuel", 30, "You refuel your ship! Fuel increased."),
            ("Face pirate ambush", "health", -25, "Pirates attack! Health decreased."),
            ("Discover cosmic phenomenon", "wealth", 80, "You document a rare event! Wealth increased."),
            ("Receive distress call", "ship_condition", -15, "Helping out strains your ship! Ship condition decreased."),
            ("Discover food supplies", "food", 20, "You find edible resources! Food supplies increased."),
            ("Stumble upon hidden fuel cache", "fuel", 15, "You uncover extra fuel reserves! Fuel increased.")
        ]
        event, stat, change, message = random.choice(events)
        
        # Apply scanner array bonus to positive wealth events
        if stat == "wealth" and change > 0 and 'scanner_array' in session.player_stats.get('pod_augmentations', []):
            change = int(change * 2)
            message += " (Scanner Array bonus!)"
        
        session.player_stats[stat] += change
        result['event'] = f"{event} - {message}"
        result['event_type'] = "random_event" if change < 0 else "success"
        
    elif action == "repair":
        if session.at_repair_location and session.player_stats['wealth'] >= 100:
            session.player_stats['wealth'] -= 100
            session.player_stats['ship_condition'] = session.player_stats['max_ship_condition']
            result['event'] = "Ship repaired!"
            result['event_type'] = "repair"
        else:
            result['event'] = "Cannot repair ship here or insufficient wealth."
            result['event_type'] = "error"
            
    elif action == "upgrade":
        if session.player_stats['wealth'] >= 300:
            session.player_stats['wealth'] -= 300
            session.player_stats['max_ship_condition'] += 20
            session.player_stats['ship_condition'] = session.player_stats['max_ship_condition']
            result['event'] = "Ship upgraded!"
            result['event_type'] = "upgrade"
        else:
            result['event'] = "Insufficient wealth for upgrade."
            result['event_type'] = "error"
            
    elif action == "buy_pod":
        if session.player_stats['wealth'] >= 500 and not session.player_stats['has_flight_pod']:
            session.player_stats['wealth'] -= 500
            session.player_stats['has_flight_pod'] = True
            session.player_stats['pod_hp'] = session.player_stats['pod_max_hp']  # Initialize pod HP to maximum
            session.player_stats['pod_augmentations'] = []  # Initialize empty augmentations
            session.player_stats['just_bought_pod'] = True  # Track to prevent immediate mod purchase
            result['event'] = "Emergency escape pod purchased! This life-saving device will activate if your ship is destroyed."
            result['event_type'] = "purchase"
        else:
            result['event'] = "Cannot purchase flight pod. Need 500 wealth and must not already own one."
            result['event_type'] = "error"
            
    elif action == "buy_ship":
        if session.player_stats['in_pod_mode'] and session.at_repair_location and session.player_stats['wealth'] >= 400:
            # Apply cargo module wealth preservation
            preserved_wealth = 0
            if 'cargo_module' in session.player_stats.get('pod_augmentations', []):
                preserved_wealth = int(session.player_stats['wealth'] * 0.5)
                result['event'] = f"New ship purchased! Cargo module preserved {preserved_wealth} wealth. You're back in action with a fully functional vessel."
            else:
                result['event'] = "New ship purchased! You're back in action with a fully functional vessel."
            
            session.player_stats['wealth'] -= 400
            session.player_stats['wealth'] += preserved_wealth
            session.player_stats['ship_condition'] = session.player_stats.get('base_max_ship_condition', session.player_stats['max_ship_condition'])
            session.player_stats['max_ship_condition'] = session.player_stats.get('base_max_ship_condition', session.player_stats['max_ship_condition'])
            session.player_stats['in_pod_mode'] = False
            session.player_stats['has_flight_pod'] = False  # Pod is used up
            session.player_stats['pod_hp'] = 0
            session.player_stats['pod_augmentations'] = []  # All augmentations lost
            session.player_stats['pod_animation_state'] = "idle"
            result['event_type'] = "purchase"
        else:
            result['event'] = "Cannot purchase ship. Must be in pod mode at a repair location with 400 wealth."
            result['event_type'] = "error"
            
    elif action == "distress_signal":
        if session.player_stats['in_pod_mode']:
            if random.random() < 0.2:  # 20% chance of rescue
                session.player_stats['wealth'] += 100
                result['event'] = "A passing trader responds to your distress signal! They give you 100 credits out of pity."
                result['event_type'] = "success"
            else:
                session.player_stats['pod_hp'] -= 5
                result['event'] = "No response to distress signal. Waiting drains pod power. Lost 5 HP."
                result['event_type'] = "danger"
        else:
            result['event'] = "Cannot send distress signal without being in pod mode."
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
        if session.player_stats['food'] >= 10:
            session.player_stats['food'] -= 10
            session.player_stats['health'] = min(
                session.player_stats['health'] + 20,
                config.STARTING_HEALTH
            )
            result['event'] = "Food consumed, health restored!"
            result['event_type'] = "consume"
        else:
            result['event'] = "Insufficient food supplies."
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
