---
title: Development Setup
tags: [development, setup, guide, contributing]
created: 2025-06-10
updated: 2025-06-10
status: active
---

# Development Setup Guide

Get your Cosmic Explorer development environment running in minutes.

## 📋 Prerequisites

### Required Software
- **Python** 3.8 or higher
- **Node.js** 14+ (for tooling)
- **Git** for version control
- **Code editor** (VS Code recommended)

### Recommended Tools
- **Make** - For automation
- **Python virtual env** - Dependency isolation
- **Browser DevTools** - For debugging

## 🚀 Quick Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/cosmic-explorer.git
cd cosmic-explorer
```

### 2. Python Setup
```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### 3. Node Setup (Optional)
```bash
# Install Node dependencies
npm install

# This enables linting and formatting tools
```

### 4. Run the Game
```bash
# Using make
make run

# Or directly
python api/app.py

# Or use the start script
./start_game.sh
```

Open browser to: `http://localhost:5000`

## 🛠️ Development Tools

### Available Make Commands
```bash
make help      # Show all commands
make run       # Start the game server
make test      # Run test suite
make lint      # Check code style
make format    # Auto-format code
make clean     # Remove generated files
```

### IDE Setup (VS Code)

#### Recommended Extensions
```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

#### Workspace Settings
```json
{
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "editor.rulers": [88]
}
```

## 📁 Project Structure

```
cosmic-explorer/
├── api/                 # Backend Python code
│   ├── app.py          # Flask server
│   ├── action_processor.py
│   └── *.py            # Game systems
├── static/             # Frontend assets
│   ├── js/            # JavaScript
│   ├── css/           # Stylesheets
│   └── images/        # Graphics
├── templates/          # HTML templates
├── docs/              # Documentation
├── tests/             # Test suite
├── saves/             # Save game files
└── dev/               # Development scripts
```

## 🧪 Testing

### Running Tests
```bash
# All tests
pytest

# With coverage
pytest --cov=api

# Specific test file
pytest tests/test_combat.py

# Watch mode
pytest-watch
```

### Test Structure
```python
# tests/test_game.py
def test_navigation():
    """Test navigation reduces fuel"""
    session = GameSession("test")
    initial_fuel = session.player_stats["fuel"]
    
    # Navigate
    result = action_processor.process_action(
        session, "navigate", {}
    )
    
    assert session.player_stats["fuel"] < initial_fuel
```

## 🎨 Code Style

### Python (PEP 8 + Black)
```bash
# Format Python code
black api/ tests/

# Check style
flake8 api/ tests/

# Type checking
mypy api/
```

### JavaScript (ESLint + Prettier)
```bash
# Format JavaScript
npm run format

# Lint JavaScript
npm run lint

# Fix issues
npm run lint:fix
```

### Pre-commit Hooks
```bash
# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

## 🔍 Debugging

### Backend Debugging

#### Flask Debug Mode
```python
# In api/app.py
if __name__ == '__main__':
    socketio.run(app, debug=True)
```

#### Python Debugger
```python
# Add breakpoint
import pdb; pdb.set_trace()

# Or with IPython
import ipdb; ipdb.set_trace()
```

#### VS Code Launch Config
```json
{
  "name": "Python: Flask",
  "type": "python",
  "request": "launch",
  "module": "api.app",
  "env": {
    "FLASK_APP": "api/app.py",
    "FLASK_ENV": "development"
  }
}
```

### Frontend Debugging

#### Browser DevTools
1. Open with F12
2. Set breakpoints in Sources tab
3. Use Console for testing
4. Monitor Network tab

#### Debug Logging
```javascript
// Enable debug mode
window.DEBUG = true;

// Conditional logging
if (window.DEBUG) {
    console.log('Game state:', gameState);
}
```

## 🌐 Network Debugging

### Monitor WebSocket
```javascript
// In console
socket.on('game_state', (data) => {
    console.log('Received:', data);
});
```

### Test API Endpoints
```bash
# Get game state
curl http://localhost:5000/api/game/state/default

# Perform action
curl -X POST http://localhost:5000/api/game/action/default \
  -H "Content-Type: application/json" \
  -d '{"action": "navigate"}'
```

## 📝 Making Changes

### Typical Workflow
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Format code
5. Commit with clear message
6. Push and create PR

### Adding New Features

#### Backend (New Action)
1. Add handler in `action_processor.py`
2. Update `action_handlers` dict
3. Add tests in `test_actions.py`
4. Document in relevant `.md`

#### Frontend (New UI)
1. Add HTML in `templates/index.html`
2. Add styles in `static/css/game.css`
3. Add logic in appropriate `.js` file
4. Test across browsers

## 🚀 Hot Reload

### Backend Hot Reload
Flask debug mode auto-reloads on Python changes.

### Frontend Hot Reload
```bash
# Simple approach
python -m http.server 8000

# Or use live-server
npm install -g live-server
live-server --port=8000
```

## 📊 Performance Profiling

### Python Profiling
```python
import cProfile
import pstats

# Profile function
cProfile.run('process_action()', 'stats.prof')

# Analyze
stats = pstats.Stats('stats.prof')
stats.sort_stats('cumulative').print_stats(10)
```

### JavaScript Profiling
Use Chrome DevTools Performance tab:
1. Start recording
2. Perform actions
3. Stop and analyze
4. Look for bottlenecks

## 🔒 Security Considerations

### Development vs Production
```python
# config.py
DEBUG = os.environ.get('FLASK_ENV') == 'development'
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key')
```

### CORS Settings
```python
# Only for development
CORS(app, origins=['http://localhost:*'])
```

## 🆘 Common Setup Issues

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process or use different port
python api/app.py --port 5001
```

### Module Import Errors
```bash
# Ensure virtual env is activated
which python  # Should show venv path

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### WebSocket Connection Failed
- Check CORS settings
- Verify server is running
- Check browser console
- Try different browser

---

Parent: [[guides/development/index|Development Guides]] | [[guides/index|Guides]]
Next: [[guides/development/adding-features|Adding Features]] | [[guides/development/testing|Testing Guide]]
