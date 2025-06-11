---
title: Getting Started with Cosmic Explorer
tags: [guide, getting-started, setup, quickstart]
created: 2025-06-10
updated: 2025-06-10
status: active
---

# Getting Started with Cosmic Explorer

Welcome to Cosmic Explorer! This guide will help you get the game running quickly.

## Quick Start

### Prerequisites
- Python 3.8 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git (for cloning the repository)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/cosmic-explorer.git
   cd cosmic-explorer
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the Game**
   ```bash
   python api/app.py
   ```
   
   Or use the provided scripts:
   - **Windows**: Double-click `start_game.bat`
   - **Mac/Linux**: Run `./start_game.sh`

4. **Open in Browser**
   Navigate to `http://localhost:5000`

## First Time Playing

### Game Objective
You're a space explorer trying to survive and thrive in a dangerous universe. Navigate between regions, trade goods, fight pirates, and upgrade your ship while managing limited resources.

### Basic Controls
- **Mouse**: Click on locations to navigate
- **Keyboard Shortcuts**:
  - `I` - Open inventory
  - `S` - Save game
  - `L` - Load game
  - `ESC` - Close modals

### Starting Strategy
1. **Stay Safe Initially**: Avoid dangerous regions until you upgrade
2. **Trade Wisely**: Buy low at mining colonies, sell high at space stations
3. **Manage Resources**: 
   - Keep fuel above 20%
   - Maintain ship health
   - Save credits for pod
4. **Buy Escape Pod Early**: Insurance against ship destruction (500 credits)

## Understanding the Interface

### Main Game View
```
┌─────────────────────────────────────┐
│  Health: ████████░░  Fuel: ██████░░ │  ← Status Bars
│  Credits: 1000      Location: Eden  │  ← Resources
├─────────────────────────────────────┤
│                                     │
│         [Ship Animation]            │  ← Game Canvas
│         ✦ ✦ ✦ ✦ ✦                 │  ← Locations
│                                     │
├─────────────────────────────────────┤
│ [Navigate] [Trade] [Repair] [Save]  │  ← Action Buttons
└─────────────────────────────────────┘
```

### Key UI Elements
- **Status Bars**: Visual health and fuel indicators
- **Resource Display**: Credits, current location
- **Game Canvas**: Shows ship and nearby locations
- **Action Buttons**: Context-sensitive based on location

## Core Gameplay Loop

### 1. Navigation Phase
- Click locations to travel
- Each jump consumes fuel
- Random events may occur

### 2. Location Actions
- **Planets**: Trade goods, repair ship, buy pod mods
- **Mining Colonies**: Buy cheap raw materials
- **Space Stations**: Sell goods for profit
- **Outposts**: Repair and refuel

### 3. Event Resolution
- **Combat**: Fight or flee from pirates
- **Discoveries**: Find valuable salvage
- **Traders**: Special trading opportunities

### 4. Resource Management
- **Fuel**: Required for navigation
- **Health**: Lost in combat, restored with food/repairs
- **Credits**: Used for all purchases
- **Cargo**: Limited by weight capacity

## Save System

### Manual Saves
- Press `S` or click Save button
- Choose from 5 save slots
- Name your saves for easy identification

### Auto-save
- Automatically saves to slot 0
- Triggers after significant actions
- Can be loaded like any manual save

### Loading Games
- Press `L` or click Load button
- Select save slot to restore
- Continue from exact game state

## Common Issues

### Game Won't Start
1. Check Python version: `python --version`
2. Ensure all dependencies installed
3. Check port 5000 isn't in use
4. Try `python3` instead of `python`

### Can't Connect to Game
1. Ensure server is running (check terminal)
2. Try `http://127.0.0.1:5000` instead
3. Disable browser extensions
4. Check firewall settings

### Performance Issues
1. Close other browser tabs
2. Disable particle effects (in future settings)
3. Use Chrome/Firefox for best performance
4. Check browser console for errors

## Next Steps

### Learn More
- [[first-game|Your First Game]] - Detailed walkthrough
- [[game-mechanics|Game Mechanics]] - Deep dive into systems
- [[advanced-strategies|Advanced Strategies]] - Pro tips

### Development
- [[guides/development/setup|Development Setup]] - Contribute to the project
- [[architecture/overview|Architecture Overview]] - Understand the codebase
- [[references/api/index|API Reference]] - Technical documentation

### Get Help
- [[troubleshooting/index|Troubleshooting Guide]] - Common solutions
- [GitHub Issues](https://github.com/cosmic-explorer/issues) - Report bugs
- [Discord Community](#) - Chat with players

---

Parent: [[guides/getting-started/index|Getting Started]] | [[README|Documentation Hub]]
