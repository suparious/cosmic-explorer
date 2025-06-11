/**
 * UIManager - Main UI coordinator that manages all UI modules
 * Refactored to use modular components
 */

// Import all modules
import { NotificationManager } from './modules/notifications/notification-manager.js';
import { ScreenManager } from './modules/screens/screen-manager.js';
import { ModalManager } from './modules/modals/modal-manager.js';
import { HUDManager } from './modules/hud/hud-manager.js';
import { AudioVisualizer } from './modules/audio/audio-visualizer.js';
import { KeyboardShortcuts } from './modules/utils/keyboard-shortcuts.js';
import { UISounds } from './modules/utils/ui-sounds.js';
import { ActionButtons } from './modules/components/action-buttons.js';
import { SaveLoadModal } from './modules/modals/save-load-modal.js';
import { PodModsModal } from './modules/modals/pod-mods-modal.js';
import { FoodModal } from './modules/modals/food-modal.js';
import { ShipModal } from './modules/modals/ship-modal.js';
import { StarMapModal } from './modules/modals/star-map-modal.js';

class UIManager {
    constructor() {
        console.log('UIManager constructor called');
        
        try {
            // Game state tracking
            this.hasActiveGame = false;
            
            // Initialize all modules
            this.notificationManager = new NotificationManager();
            this.screenManager = new ScreenManager(this);
            this.modalManager = new ModalManager();
            this.hudManager = new HUDManager(this);
            this.audioVisualizer = new AudioVisualizer();
            this.keyboardShortcuts = new KeyboardShortcuts(this);
            this.uiSounds = new UISounds();
            this.actionButtons = new ActionButtons(this);
            
            // Initialize modals
            this.saveLoadModal = new SaveLoadModal(this);
            this.podModsModal = new PodModsModal(this);
            this.foodModal = new FoodModal(this);
            this.shipModal = new ShipModal(this);
            this.starMapModal = new StarMapModal(this);
            
            console.log('UIManager initialized successfully');
        } catch (error) {
            console.error('Error in UIManager constructor:', error);
            throw error;
        }
    }
    
    // ========== Screen Management ==========
    
    showScreen(screenName) {
        this.screenManager.showScreen(screenName);
    }
    
    // ========== HUD Updates ==========
    
    updateHUD(gameState) {
        this.hudManager.updateHUD(gameState);
    }
    
    // ========== Notifications ==========
    
    showNotification(message, type = 'info', duration = 3000) {
        this.notificationManager.showNotification(message, type, duration);
    }
    
    addEventMessage(message, type = 'info') {
        this.notificationManager.addEventMessage(message, type);
    }
    
    // ========== Modal Management ==========
    
    showChoiceModal(title, choices, callback) {
        this.modalManager.showChoiceModal(title, choices, callback);
    }
    
    hideChoiceModal() {
        this.modalManager.hideChoiceModal();
    }
    
    closeAllModals() {
        this.modalManager.closeAllModals();
    }
    
    // ========== Save/Load ==========
    
    showSaveLoadModal(mode = 'save') {
        this.saveLoadModal.show(mode);
    }
    
    hideSaveLoadModal() {
        this.saveLoadModal.hide();
    }
    
    // ========== Game Control ==========
    
    startNewGame() {
        this.showScreen('game');
        this.hasActiveGame = true;
        this.screenManager.updateContinueButtonVisibility();
        if (window.gameEngine) {
            window.gameEngine.startNewGame();
        }
    }
    
    continueGame() {
        if (this.hasActiveGame && window.gameEngine && window.gameEngine.gameState) {
            this.showScreen('game');
            // Resume music if it was playing
            if (window.audioManager) {
                window.audioManager.playMusic();
            }
        } else {
            // No active game, show notification
            this.showNotification('No active game found. Please start a new game or load a saved game.', 'info');
        }
    }
    
    loadGame() {
        // Show save/load modal in load mode
        this.showSaveLoadModal('load');
    }
    
    // ========== Settings ==========
    
    showSettings() {
        this.showScreen('settings');
    }
    
    hideSettings() {
        this.showScreen('mainMenu');
        
        // Apply settings
        const masterVolume = document.getElementById('master-volume');
        const sfxVolume = document.getElementById('sfx-volume');
        const musicVolume = document.getElementById('music-volume');
        
        if (masterVolume && sfxVolume && musicVolume && window.audioManager) {
            window.audioManager.setMasterVolume(masterVolume.value / 100);
            window.audioManager.setSFXVolume(sfxVolume.value / 100);
            window.audioManager.setMusicVolume(musicVolume.value / 100);
        }
    }
    
    showCredits() {
        this.showNotification('Created with x.ai Grok-3 and Claude Opus 4', 'info', 5000);
    }
    
    // ========== Game Over/Victory ==========
    
    showGameOver(message) {
        this.addEventMessage(message, 'danger');
        this.hasActiveGame = false;
        this.screenManager.updateContinueButtonVisibility();
        this.showChoiceModal('Game Over', ['Start New Game', 'Return to Main Menu'], (choice) => {
            if (choice === 1) {
                this.startNewGame();
            } else {
                this.showScreen('mainMenu');
            }
        });
    }
    
    showVictory(message) {
        this.addEventMessage(message, 'success');
        this.hasActiveGame = false;
        this.screenManager.updateContinueButtonVisibility();
        this.showChoiceModal('Victory!', ['Start New Game', 'Return to Main Menu'], (choice) => {
            if (choice === 1) {
                this.startNewGame();
            } else {
                this.showScreen('mainMenu');
            }
        });
    }
    
    // ========== Pod Mods ==========
    
    showPodModsModal() {
        this.podModsModal.show();
    }
    
    hidePodModsModal() {
        this.podModsModal.hide();
    }
    
    // ========== Food Modal ==========
    
    showFoodModal() {
        this.foodModal.show();
    }
    
    hideFoodModal() {
        this.foodModal.hide();
    }
    
    // ========== Ship Modal ==========
    
    showShipModal() {
        this.shipModal.show();
    }
    
    hideShipModal() {
        this.shipModal.hide();
    }
    
    // ========== Star Map ==========
    
    showStarMap(starMap, navigationData) {
        this.starMapModal.show(starMap, navigationData);
    }
    
    hideStarMap() {
        this.starMapModal.hide();
    }
}

// Create global instance and expose it
window.uiManager = new UIManager();
window.gameUI = window.uiManager; // For backward compatibility

// Export for module usage
export default UIManager;
