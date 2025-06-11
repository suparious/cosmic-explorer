---
title: Common Issues
tags: [troubleshooting, guides, problems, solutions]
created: 2025-06-10
updated: 2025-06-10
status: active
---

# Common Issues & Solutions

Quick fixes for frequent problems in Cosmic Explorer.

## 🚨 Game Won't Start

### Browser Shows "Connection Refused"
**Problem**: Server isn't running  
**Solutions**:
1. Make sure you ran `start_game.bat` or `start_game.sh`
2. Check terminal for error messages
3. Try running directly: `python api/app.py`
4. Check if port 5000 is already in use

### "Module Not Found" Error
**Problem**: Missing dependencies  
**Solutions**:
```bash
# Install requirements
pip install -r requirements.txt

# If that fails, try:
pip install flask flask-cors flask-socketio
```

### Page Loads But Nothing Happens
**Problem**: JavaScript error  
**Solutions**:
1. Open browser console (F12)
2. Look for red error messages
3. Try hard refresh (Ctrl+F5)
4. Clear browser cache

## 💾 Save/Load Problems

### "No Save Found in This Slot"
**Problem**: Save doesn't exist  
**Solutions**:
1. Check different slot numbers
2. Auto-save is always in slot 0
3. Manual saves in slots 1-4

### Can't Save Game
**Problem**: Disk/permission issue  
**Solutions**:
1. Check `saves/` directory exists
2. Verify write permissions
3. Check disk space
4. Try different save slot

### Save File Corrupted
**Problem**: Invalid JSON  
**Solutions**:
1. Load from different slot
2. Use auto-save (slot 0)
3. Check `saves/` for backup files
4. Start new game if necessary

## 🎮 Gameplay Issues

### Stuck with No Fuel
**Problem**: Can't move, game over  
**Solutions**:
- This is intentional - manage fuel carefully!
- Load earlier save
- Always keep fuel reserve
- Buy fuel at trading posts

### Ship Destroyed, No Pod
**Problem**: Game over without escape pod  
**Solutions**:
- This ends the game - pods are important!
- Always buy escape pod first (500 credits)
- Load earlier save
- Start new game

### Can't Find Repair Station
**Problem**: Ship damaged, no repairs  
**Solutions**:
1. Keep navigating - they're random
2. Look for planets/outposts
3. Check star map for marked locations
4. Save fuel for searching

### Inventory Full
**Problem**: Can't pick up items  
**Solutions**:
1. Sell items at trading posts
2. Upgrade to larger ship
3. Install cargo expansion mods
4. Prioritize valuable items

## 🖥️ UI/Display Issues

### Modal Won't Close
**Problem**: Stuck in dialog  
**Solutions**:
1. Press `ESC` key
2. Click outside modal
3. Click X button
4. Refresh page if stuck

### UI Elements Overlapping
**Problem**: Display glitch  
**Solutions**:
1. Refresh browser (F5)
2. Check browser zoom (Ctrl+0 to reset)
3. Try different browser
4. Report bug with screenshot

### Can't See Full Game
**Problem**: Cut off screen  
**Solutions**:
1. Minimum resolution: 1024x768
2. Press F11 for fullscreen
3. Zoom out browser (Ctrl+-)
4. Check mobile view settings

## ⚔️ Combat Problems

### Combat Too Difficult
**Problem**: Keep dying  
**Solutions**:
1. Upgrade weapons first
2. Use "Evasive" action when low HP
3. Flee from strong enemies
4. Fight in safer regions

### Can't Flee from Combat
**Problem**: Flee keeps failing  
**Solutions**:
1. Install Afterburner mod (+speed)
2. Use faster ship types
3. Flee early (more HP = better)
4. Some enemies prevent fleeing

### No Loot from Combat
**Problem**: Inventory full  
**Solutions**:
1. Check cargo capacity
2. Sell items before combat
3. Some enemies drop no loot
4. Loot chance isn't 100%

## 🔧 Performance Issues

### Game Runs Slowly
**Problem**: Low FPS  
**Solutions**:
1. Close other browser tabs
2. Disable browser extensions
3. Check CPU usage
4. Try different browser

### Lag During Actions
**Problem**: Delayed responses  
**Solutions**:
1. Check network connection
2. Server may be processing
3. Don't spam click buttons
4. Wait for action to complete

## 🐛 Known Bugs

### Star Map Not Interactive
**Status**: In development  
**Workaround**: Use Navigate button

### No Sound Effects
**Status**: Planned feature  
**Workaround**: Play your own music!

### Mobile Layout Issues
**Status**: Desktop-first design  
**Workaround**: Use desktop/laptop

## 🆘 Still Having Problems?

### Debug Information
Press F12 for browser console:
1. Look for red errors
2. Check network tab
3. Note any 404/500 errors
4. Screenshot for bug reports

### Reporting Bugs
Include:
- Browser and version
- Operating system
- Steps to reproduce
- Error messages
- Screenshots

### Getting Help
1. Check other guides in documentation
2. Review [[architecture/adrs/index|Architecture Decisions]]
3. See [[guides/development/index|Development Guides]]
4. File issue on GitHub

## 💡 Prevention Tips

### Avoid Problems
1. **Save Often** - Use multiple slots
2. **Monitor Resources** - Don't run empty
3. **Buy Insurance** - Get escape pod early
4. **Update Browser** - Use modern version
5. **Clear Cache** - If acting strange

### Best Practices
- Keep 20+ fuel reserve
- Repair before combat
- Save before risks
- Read event text carefully
- Learn from failures

---

Parent: [[guides/troubleshooting/index|Troubleshooting]] | [[guides/index|Guides]]
Related: [[guides/getting-started/quickstart|Quick Start]] | [[modal-issues|Modal Issues]]
