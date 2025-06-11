---
title: API Reference
tags: [api, reference, endpoints, rest, websocket]
created: 2025-06-10
updated: 2025-06-10
status: active
---

# API Reference

Complete reference for Cosmic Explorer's REST and WebSocket APIs.

## 🌐 Base URL

```
http://localhost:5000
```

## 🔑 Authentication

Currently no authentication required. All endpoints are open.

## 📡 REST Endpoints

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

**Response:**
```json
{
  "success": true,
  "session_id": "default",
  "game_state": {
    "player_stats": {...},
    "turn_count": 0,
    "star_map": {...}
  }
}
```

#### Get Game State
```http
GET /api/game/state/{session_id}
```

**Response:**
```json
{
  "session_id": "default",
  "player_stats": {
    "health": 100,
    "wealth": 500,
    "ship_condition": 100,
    "fuel": 100,
    "food": 50,
    "inventory": []
  },
  "turn_count": 42,
  "current_location": {...}
}
```

#### Perform Game Action
```http
POST /api/game/action/{session_id}
Content-Type: application/json

{
  "action": "navigate",
  "target_node_id": "node_123",
  "target_region_id": "region_456"
}
```

**Available Actions:**
- `navigate` - Move to new location
- `repair` - Repair ship (costs 100)
- `buy_ship` - Purchase new ship
- `buy_mod` - Install modification
- `buy_pod` - Purchase escape pod
- `buy_augmentation` - Add pod augmentation
- `consume_food` - Restore health
- `mine` - Mine asteroids
- `salvage` - Salvage debris
- `combat` - Initiate combat
- `flee` - Escape combat
- `negotiate` - Pay to end combat

**Response:**
```json
{
  "success": true,
  "result": {
    "event": "Traveled safely to Trading Post Alpha.",
    "event_type": "navigation",
    "choices": []
  },
  "game_state": {...}
}
```

### Information Endpoints

#### Get Ship Information
```http
GET /api/game/ship_info/{session_id}
```

**Response:**
```json
{
  "name": "Scout",
  "cost": 500,
  "hp": 100,
  "cargo_capacity": 50,
  "speed": 1.2,
  "slots": {
    "high": 2,
    "mid": 2,
    "low": 1,
    "rig": 1
  },
  "equipped_mods": {
    "high": [
      {
        "id": "laser_cannon",
        "name": "Laser Cannon",
        "effects": {...}
      }
    ]
  },
  "effective_stats": {
    "max_hp": 120,
    "cargo_capacity": 50,
    "fuel_efficiency": 0.8
  }
}
```

#### Get Inventory
```http
GET /api/game/inventory/{session_id}
```

**Response:**
```json
{
  "inventory": [
    {
      "id": "rare_minerals",
      "name": "Rare Minerals",
      "quantity": 5,
      "weight": 2,
      "base_value": 50,
      "total_weight": 10,
      "total_value": 250
    }
  ],
  "cargo_capacity": 50,
  "used_space": 10,
  "total_value": 250
}
```

#### Get Navigation Options
```http
GET /api/game/navigation_options/{session_id}
```

**Response:**
```json
{
  "options": [
    {
      "type": "node",
      "id": "node_123",
      "name": "Trading Post Alpha",
      "node_type": "trading_post",
      "visited": true,
      "has_repair": true,
      "has_trade": true,
      "danger_level": 0.2,
      "fuel_cost": 10
    },
    {
      "type": "region",
      "id": "region_2",
      "name": "Frontier Space",
      "region_type": "dangerous",
      "fuel_cost": 50
    }
  ],
  "current_location": {
    "region": "Core Systems",
    "node": "Earth Station",
    "type": "station"
  }
}
```

#### Get Available Modifications
```http
GET /api/game/available_mods/{session_id}
```

**Response:**
```json
{
  "high": {
    "max_slots": 2,
    "used_slots": 1,
    "available_mods": {
      "missile_launcher": {
        "name": "Missile Launcher",
        "cost": 800,
        "description": "High damage projectile weapon"
      }
    }
  },
  "mid": {...},
  "low": {...},
  "rig": {...}
}
```

### Save System

#### List All Saves
```http
GET /api/saves
```

**Response:**
```json
{
  "success": true,
  "saves": [
    {
      "slot": 0,
      "metadata": {
        "timestamp": "2025-06-10T10:30:00",
        "turn_count": 42,
        "wealth": 2500,
        "health": 85,
        "location": "Trading Post Alpha",
        "game_version": "0.1.0"
      },
      "is_autosave": true
    }
  ],
  "max_slots": 5
}
```

#### Save to Slot
```http
POST /api/saves/{slot}
Content-Type: application/json

{
  "session_id": "default"
}
```

**Response:**
```json
{
  "success": true,
  "slot": 1,
  "metadata": {...}
}
```

#### Load from Slot
```http
POST /api/load/{slot}
Content-Type: application/json

{
  "session_id": "default"
}
```

**Response:**
```json
{
  "success": true,
  "session_id": "default",
  "game_state": {...}
}
```

#### Delete Save
```http
DELETE /api/saves/{slot}
```

**Response:**
```json
{
  "success": true,
  "message": "Save in slot 2 deleted"
}
```

#### Get Save Info
```http
GET /api/saves/{slot}
```

**Response:**
```json
{
  "success": true,
  "slot": 1,
  "metadata": {...},
  "is_autosave": false
}
```

### Statistics
```http
GET /api/game/statistics/{session_id}
```

**Response:**
```json
{
  "total_distance_traveled": 156,
  "systems_visited": 23,
  "items_collected": 45,
  "credits_earned": 5600,
  "credits_spent": 3100,
  "ships_destroyed": 8,
  "pod_uses": 1
}
```

## 🔌 WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:5000');

socket.on('connect', () => {
    console.log('Connected to server');
});
```

### Client → Server Events

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

### Server → Client Events

#### Game State Update
```javascript
socket.on('game_state', (gameState) => {
    // Complete game state object
    // Sent after any action that changes state
});
```

#### Game Event
```javascript
socket.on('game_event', (event) => {
    // event.type: 'combat', 'navigation', 'danger', etc
    // event.message: "Description of what happened"
    // event.choices: ["Option 1", "Option 2"]
});
```

#### Connected
```javascript
socket.on('connected', (data) => {
    // data.data: "Connected to Cosmic Explorer server"
});
```

#### Session Joined
```javascript
socket.on('joined_session', (data) => {
    // data.session_id: "default"
});
```

## 🚨 Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional information"
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (session/save not found)
- `500` - Internal Server Error

### Common Errors

#### Session Not Found
```json
{
  "error": "Session not found"
}
```

#### Invalid Action
```json
{
  "success": false,
  "result": {
    "event": "Unknown action: invalid_action",
    "event_type": "error"
  }
}
```

#### Insufficient Resources
```json
{
  "success": true,
  "result": {
    "event": "Insufficient wealth. Need 100 credits.",
    "event_type": "error"
  }
}
```

## 🧪 Testing Endpoints

### Using cURL

#### Start New Game
```bash
curl -X POST http://localhost:5000/api/game/new \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test"}'
```

#### Navigate
```bash
curl -X POST http://localhost:5000/api/game/action/test \
  -H "Content-Type: application/json" \
  -d '{"action": "navigate"}'
```

#### Get State
```bash
curl http://localhost:5000/api/game/state/test
```

### Using JavaScript

```javascript
// Async/await example
async function performAction(action) {
    const response = await fetch('/api/game/action/default', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
    });
    
    const result = await response.json();
    console.log(result);
}

// WebSocket example
socket.emit('join_session', { session_id: 'default' });
socket.on('game_state', (state) => {
    updateUI(state);
});
```

## 📝 Notes

### Session Management
- Sessions timeout after 1 hour of inactivity
- Maximum 100 concurrent sessions
- Session IDs can be any string

### Rate Limiting
- No rate limiting currently implemented
- Be mindful of server resources

### Future Enhancements
- Authentication system
- API versioning (/api/v1/)
- GraphQL endpoint
- Real-time multiplayer events

---

Parent: [[references/index|References]] | [[README|Documentation Hub]]
Related: [[components/backend/api-server|API Server]] | [[guides/development/index|Development Guides]]
