# Cosmic Explorer Tools

This directory contains utility scripts and tools for development and asset generation.

## Files

### `favicon_generator.html`
An interactive HTML tool for generating favicon images. Open this file in a browser to:
- Design custom favicons using Canvas
- Export as different sizes
- Preview how the favicon looks

### `generate_favicon.py`
Python script for generating favicon.ico files programmatically.
- Creates multi-resolution ICO files
- Supports 16x16, 32x32, and 48x48 sizes
- Uses PIL/Pillow for image processing

Usage:
```bash
python generate_favicon.py
```

### `create_favicon.sh`
Bash script wrapper for favicon generation.
- Checks dependencies
- Runs the Python favicon generator
- Copies output to appropriate directories

Usage:
```bash
./create_favicon.sh
```

### `POD_MODS_DEBUG.js`
Debugging utility for the Pod Modifications system.
- Tests pod mod functionality
- Validates augmentation data
- Helps diagnose UI issues

### `music_debug_helper.js`
Comprehensive music system debugging tool.
- Test all music tracks quickly
- Simulate different game states
- Check audio visualizer data
- Volume controls and status monitoring

Usage:
```javascript
// Copy entire file contents to browser console, then:
musicDebug.testAll()     // Test all tracks
musicDebug.status()      // Show current status
musicDebug.play('combat') // Play specific track
```

## Adding New Tools

When adding new utility scripts:

1. Place them in this directory
2. Update this README with documentation
3. Make shell scripts executable: `chmod +x script.sh`
4. Add any required dependencies to `requirements-dev.txt`

## Development Utilities Wishlist

- [ ] Sprite sheet generator
- [ ] Sound effect generator
- [ ] Save file inspector/editor
- [ ] Performance profiler
- [ ] Automated screenshot tool
- [ ] Release packager
