---
title: API Reference Index
tags: [api, reference, index]
created: 2025-06-10
updated: 2025-06-10
status: active
---

# API Reference

Technical reference documentation for the Cosmic Explorer API.

## 📚 Available References

### [[endpoints|REST & WebSocket Endpoints]]
Complete reference for all API endpoints including:
- REST API endpoints
- WebSocket events
- Request/response formats
- Error handling
- Usage examples

### [[game-actions|Game Actions Reference]]
Detailed documentation of all game actions:
- Action parameters
- Validation rules
- Success/failure conditions
- State changes

### [[data-schemas|Data Schemas]]
JSON schemas for game objects:
- Player stats structure
- Ship modifications
- Inventory items
- Save file formats

## 🔌 API Overview

### Base Configuration
- **URL**: `http://localhost:5000`
- **Protocol**: HTTP/WebSocket
- **Format**: JSON
- **Auth**: None (currently)

### Key Endpoints
- `/api/game/*` - Game management
- `/api/saves/*` - Save system
- WebSocket events for real-time updates

## 🧪 Testing the API

### Quick Test
```bash
# Check if server is running
curl http://localhost:5000/api/game/state/test

# Start new game
curl -X POST http://localhost:5000/api/game/new \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test"}'
```

### Development Tools
- Postman collection (coming soon)
- WebSocket test client
- API documentation generator

## 📊 API Patterns

### Response Format
All responses follow consistent structure:
```json
{
  "success": true,
  "data": {...},
  "error": null
}
```

### Error Handling
Errors include helpful messages:
```json
{
  "success": false,
  "error": "Description of error",
  "details": "Additional context"
}
```

### Versioning
Currently v1 (implicit). Future versions will use:
- `/api/v1/` - Current
- `/api/v2/` - Future

## 🔗 Related Documentation

- [[components/backend/api-server|API Server Implementation]]
- [[guides/development/setup|Development Setup]]
- [[architecture/overview|System Architecture]]

---

Parent: [[references/index|References]] | [[README|Documentation Hub]]
