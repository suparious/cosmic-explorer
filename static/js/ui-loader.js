/**
 * Module Loader - Manages the loading and initialization of UI modules
 * This provides backward compatibility while using the new modular structure
 */

// Load the UI manager module
import UIManager from './ui.js';

// The UIManager constructor already creates the global instances (window.uiManager and window.gameUI)
// So we just need to make sure it's loaded

// Log successful initialization
console.log('UI modules loaded successfully');

// Dispatch an event to signal that UI is ready
document.dispatchEvent(new Event('uiReady'));
