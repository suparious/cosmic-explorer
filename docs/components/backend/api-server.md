---
title: API Server
tags: [backend, api, flask, websocket]
created: 2025-06-10
updated: 2025-06-10
status: active
---

# API Server (app.py)

The Flask-based API server that provides REST endpoints and WebSocket support for the Cosmic Explorer web client.

## 🏗️ Overview

The API server is the central communication hub between the web client and the game engine. It handles:
- REST API endpoints for game actions
- WebSocket connections for real-time updates
- Session management across multiple players
- Save/load operations
- Static file serving

## 🔌 Architecture

### Core Components

```python
# Flask application setup
app = Flask(__name__, template_folder='../templates', static_folder='../static')
socketio = SocketIO(app, cors_allowed_origins="*")

# Manager instances
session_manager = SessionManager()
action_processor = ActionProcessor()
game_lock = threading.Lock()  # Thread safety
```

### Threading Model
- Main Flask thread handles HTTP requests
- SocketIO manages WebSocket connections
- Background cleanup thread removes old sessions
- Global lock ensures thread-safe game state access

## 📡 API Endpoints

### Game Management

#### Start New Game
```http
POST /api/game/new
Content-Type: application/json

{
  "session_id": "default",
  "force_new": false
}
```
Creates or retrieves a game session.

#### Get Game State
```http
GET /api/game/state/<session_id>
```
Returns complete game state for a session.

#### Perform Action
```http
POST /api/game/action/<session_id>
Content-Type: application/json

{
  "action": "navigate",
  "target_node_id": "node_123"
}
```
Executes a game action and returns results.

### Save/Load System

#### List All Saves
```http
GET /api/saves
```
Returns metadata for all save slots (0-4).

#### Save Game
```http
POST /api/saves/<slot>
Content-Type: application/json

{
  "session_id": "default"
}
```
Saves current game to specified slot.

#### Load Game
```http
POST /api/load/<slot>
Content-Type: application/json

{
  "session_id": "default"
}
```
Loads game from specified slot.

#### Delete Save
```http
DELETE /api/saves/<slot>
```
Removes save from slot (except auto-save).

### Information Endpoints

#### Ship Information
```http
GET /api/game/ship_info/<session_id>
```
Returns detailed ship stats and modifications.

#### Inventory Details
```http
GET /api/game/inventory/<session_id>
```
Returns inventory items with weights and values.

#### Navigation Options
```http
GET /api/game/navigation_options/<session_id>
```
Returns available movement destinations.

#### Available Modifications
```http
GET /api/game/available_mods/<session_id>
```
Returns purchasable ship modifications.

## 🔄 WebSocket Events

### Client → Server

#### Join Session
```javascript
socket.emit('join_session', {
  session_id: 'default'
});
```

#### Leave Session
```javascript
socket.emit('leave_session', {
  session_id: 'default'
});
```

### Server → Client

#### Game State Update
```javascript
socket.on('game_state', (gameState) => {
  // Complete game state object
});
```

#### Game Event
```javascript
socket.on('game_event', (event) => {
  // type: event type
  // message: event description
  // choices: available actions
});
```

## 🎮 Navigation System

The server includes a specialized navigation function for the web interface:

```python
def web_navigation(session, target_node_id=None, target_region_id=None):
    """Handles movement within and between regions"""
    # Validates movement
    # Calculates fuel costs
    # Triggers random events
    # Updates location
    # Returns results
```

### Navigation Features
- Intra-region movement between nodes
- Inter-region jumps via wormholes
- Fuel consumption with augmentation bonuses
- Random danger encounters
- Discovery rewards

## 🔒 Thread Safety

### Locking Strategy
```python
with game_lock:
    # All game state modifications
    session = session_manager.get_session(session_id)
    result = action_processor.process_action(session, action, data)
```

### Session Cleanup
- Background thread runs every 5 minutes
- Removes sessions inactive > 30 minutes
- Prevents memory leaks

## 🚨 Error Handling

### HTTP Status Codes
- `200` - Success
- `400` - Bad request (invalid parameters)
- `404` - Session/save not found
- `500` - Server error

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional information"
}
```

## 🔧 Configuration

### Server Settings
```python
# Host and port
socketio.run(app, debug=True, host='0.0.0.0', port=5000)

# CORS settings
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
```

### Static Files
- Templates: `../templates/`
- Static assets: `../static/`
- Favicon handling included

## 📊 Performance Considerations

### Optimization Strategies
1. **Session caching** - Active sessions kept in memory
2. **Lazy loading** - Star maps generated on demand
3. **Batch updates** - WebSocket events grouped
4. **Auto-save throttling** - Prevents excessive disk I/O

### Scalability
- Stateless REST design
- Session affinity for WebSocket
- Horizontal scaling possible with Redis
- Database backend ready (not implemented)

## 🔍 Debugging

### Common Issues

#### "Session not found"
- Session expired (30min timeout)
- Wrong session_id
- Server restarted

#### WebSocket disconnection
- Client network issues
- Server overload
- CORS misconfiguration

### Debug Mode
Enable Flask debug mode for:
- Detailed error traces
- Auto-reload on code changes
- Request/response logging

## 📚 Extension Points

### Adding New Endpoints
1. Define route in `app.py`
2. Add session validation
3. Call appropriate manager/processor
4. Return JSON response

### Custom Events
1. Define event handler
2. Emit via `socketio.emit()`
3. Handle in client JavaScript

### Middleware
- Add Flask middleware for auth
- Custom decorators for validation
- Request/response interceptors

---

Parent: [[backend/index|Backend Components]] | [[components/index|Components]]
Related: [[action-processor|Action Processor]] | [[session-manager|Session Manager]]
