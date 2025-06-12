// Backward compatibility wrapper for the modularized music engine
// This file ensures existing code continues to work without changes

import { MusicEngine } from './audio/index.js';

// Export to window for backward compatibility
window.MusicEngine = MusicEngine;

// Log migration notice (can be removed in production)
console.log('MusicEngine: Using modular audio system. See /static/js/audio/MIGRATION_GUIDE.md for details.');
