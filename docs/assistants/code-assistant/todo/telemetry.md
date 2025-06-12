You're working on a modular JavaScript UI for a space exploration game called Cosmic Explorer.

The game:
- Has a canvas-based 60 FPS renderer
- Uses a modular UI system (`window.uiManager`)
- Communicates with a Python backend via REST and WebSockets

Your task:
Implement a modular telemetry system in vanilla JavaScript that:

1. Tracks player behavior:
   - Clicks per second (CPS)
   - HUD interactions
   - Modal opens/closes
   - Mouse movement heatmap (optional)
   - Session start, end, focus/blur
   - Key UI actions like star map open, ship mod applied, purchase attempted

2. Sends telemetry data:
   - Via `POST /telemetry` (use `fetch`)
   - Batch events every 5 seconds
   - JSON format with timestamps and event types

3. Integrates cleanly with existing UI modules:
   - Add a new module: `modules/telemetry/telemetry.js`
   - Auto-init from `ui.js` via `uiManager.telemetry`
   - Hook into modal and HUD event dispatchers

4. Uses best practices:
   - GDPR/CCPA compliant (check `window.telemetryConsent`)
   - Avoids performance drag
   - Lightweight, no dependencies
   - Graceful fallback if server unreachable

Output:
- The complete `telemetry.js` module
- The `sendTelemetry()` batching logic
- Example integration with `modal-manager` and `hud-manager`

Assume:
- `window.sessionId` and `window.playerId` are set
- You can emit `document.dispatchEvent(new CustomEvent('telemetry', { detail }))` for cross-module hooks
