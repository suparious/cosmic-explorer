#!/usr/bin/env python3
"""
Flask API backend for Cosmic Explorer
Provides REST endpoints and WebSocket support for the graphical frontend
"""

from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import json
import os
import sys
import threading
import time

# Add parent directory to path to import game modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import config
from events import offer_quest, random_event
from navigation import standard_navigation
import game

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
            "fuel": config.STARTING_FUEL,
            "food": config.STARTING_FOOD,
            "has_flight_pod": False
        }
        self.active_quest = None
        self.turn_count = 0
        self.at_repair_location = False
        self.game_over = False
        self.victory = False
        self.current_event = None
        self.available_choices = []
        
    def to_dict(self):
        return {
            "player_stats": self.player_stats,
            "active_quest": self.active_quest,
            "turn_count": self.turn_count,
            "at_repair_location": self.at_repair_location,
            "game_over": self.game_over,
            "victory": self.victory,
            "current_event": self.current_event,
            "available_choices": self.available_choices,
            "max_turns": config.MAX_TURNS
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
        
        result = process_action(session, action, choice)
        
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

def process_action(session, action, choice=None):
    """Process game actions and return results"""
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
    
    if session.player_stats['ship_condition'] <= 0:
        session.game_over = True
        result['event'] = "Game Over: Your ship is destroyed."
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
        session.at_repair_location = standard_navigation(session.player_stats)
        result['event'] = "Navigation complete"
        result['event_type'] = "navigation"
        
    elif action == "quest":
        if not session.active_quest:
            session.active_quest = offer_quest(session.player_stats, session.active_quest)
            if session.active_quest:
                result['event'] = f"New quest available: {session.active_quest['name']}"
                result['event_type'] = "quest"
                
    elif action == "event":
        event_result = random_event(session.player_stats)
        result['event'] = "A random event occurred!"
        result['event_type'] = "random_event"
        
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
            result['event'] = "Flight pod purchased!"
            result['event_type'] = "purchase"
        else:
            result['event'] = "Cannot purchase flight pod."
            result['event_type'] = "error"
            
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
