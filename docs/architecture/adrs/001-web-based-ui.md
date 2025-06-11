---
title: ADR-001 - Web-Based UI Architecture
tags: [adr, architecture, frontend, decision]
created: 2025-06-10
updated: 2025-06-10
status: accepted
---

# ADR-001: Web-Based UI Over Terminal Interface

## Status
Accepted

## Context
Cosmic Explorer initially supported both a terminal-based ASCII interface and a web-based graphical interface. This dual-interface approach was causing:
- Increased maintenance burden
- Feature disparity between interfaces
- Limited visual capabilities in terminal mode
- Difficulty implementing modern game features (particles, animations, real-time updates)
- Poor user experience for non-technical players

The game needed to choose a primary interface to focus development efforts and provide the best player experience.

## Decision
We decided to deprecate the terminal interface and focus exclusively on the web-based UI, making it the sole interface for Cosmic Explorer.

## Consequences

### Positive
- **Rich Visual Experience**: Canvas-based rendering enables particles, animations, and visual effects
- **Broader Audience**: Accessible to players without terminal expertise
- **Modern Features**: Support for mouse input, modal dialogs, and responsive design
- **Real-time Updates**: WebSocket enables smooth, real-time game state synchronization
- **Asset Integration**: Easy to add sprites, sounds, and other media
- **Cross-platform**: Works on any device with a modern web browser
- **Development Focus**: Single interface reduces complexity and speeds development

### Negative
- **Lost Terminal Charm**: No longer playable in pure terminal environments
- **Browser Requirement**: Players need a web browser (though this is nearly universal)
- **Network Latency**: WebSocket introduces minimal latency vs direct terminal
- **Resource Usage**: Higher memory/CPU usage than ASCII terminal

### Neutral
- **Architecture Shift**: Moved from direct Python UI to client-server model
- **Technology Stack**: Added JavaScript, WebSocket, and Canvas API to requirements
- **Testing Approach**: Need both backend and frontend testing strategies

## Alternatives Considered

### Option 1: Maintain Both Interfaces
- **Description**: Continue supporting both terminal and web interfaces
- **Pros**: Maximum compatibility, preserves original vision
- **Cons**: Double maintenance, feature parity issues, slows development
- **Why rejected**: Maintenance burden outweighed benefits

### Option 2: Terminal-Only with Enhanced Graphics
- **Description**: Improve terminal interface with libraries like Rich or Blessed
- **Pros**: Lighter weight, works over SSH, retro appeal
- **Cons**: Still limited graphics, smaller audience, platform compatibility issues
- **Why rejected**: Fundamental limitations of terminal graphics

### Option 3: Desktop Application (Electron)
- **Description**: Package web UI as standalone desktop app
- **Pros**: Native app experience, offline play, better performance
- **Cons**: Larger download, platform-specific builds, update distribution
- **Why rejected**: Web deployment simpler, updates instant, no installation

## Implementation Notes

### Migration Path
1. Feature parity check between interfaces
2. Port terminal-only features to web
3. Deprecation notice in terminal UI
4. Remove terminal code in next major version

### Architecture Changes
- Separated game logic from UI completely
- Introduced REST API and WebSocket endpoints
- Created JavaScript game client
- Implemented Canvas-based renderer

### File Structure
```
/api/          - Flask server and API
/static/js/    - JavaScript client
/templates/    - HTML templates
/game.py       - Pure game logic (no UI)
```

## References
- [[archive/feature-docs/terminal-ui-deprecated|Terminal UI Deprecation Notice]]
- [[architecture/overview|System Architecture]]
- [[components/frontend/index|Frontend Architecture]]
- Related: [[adr-002-websocket-communication|ADR-002: WebSocket Communication]]

---

Parent: [[architecture/adrs/index|ADR Index]] | [[architecture/overview|Architecture Overview]]
