// Main entry point for the Cosmic Explorer music engine
// Provides backward compatibility with window.MusicEngine

import { MusicEngine } from './MusicEngine.js';

// Export for ES6 modules
export { MusicEngine };

// Maintain backward compatibility with global window object
window.MusicEngine = MusicEngine;

// Export other useful utilities if needed by external code
export { TRACK_DEFINITIONS } from './constants/trackDefinitions.js';
export { layerFactory } from './layers/LayerFactory.js';
