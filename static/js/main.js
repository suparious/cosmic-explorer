// Main entry point for Cosmic Explorer
window.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Cosmic Explorer...');
    
    try {
        // Create global instances
        window.gameEngine = new GameEngine();
        
        // Initialize game engine
        await window.gameEngine.init();
        
        // Set global references after initialization
        window.gameUI = window.gameEngine.uiManager;
        window.audioManager = window.gameEngine.audioManager;
        
        // Check if UI manager was created successfully
        if (!window.gameUI) {
            throw new Error('UI Manager failed to initialize');
        }
        
        // Setup keyboard shortcuts for save/load
        window.gameUI.setupKeyboardShortcuts();
        
        // Simulate loading
        setTimeout(() => {
            // Hide loading screen and show main menu
            if (window.gameUI) {
                window.gameUI.showScreen('mainMenu');
            } else {
                // Fallback: manually show main menu if UIManager failed
                console.warn('UIManager not available, using fallback');
                const loadingScreen = document.getElementById('loading-screen');
                const mainMenu = document.getElementById('main-menu');
                if (loadingScreen) loadingScreen.classList.remove('active');
                if (mainMenu) mainMenu.classList.add('active');
            }
            
            // Play background music on first user interaction
            document.addEventListener('click', () => {
                if (window.audioManager) {
                    window.audioManager.playMusic();
                }
            }, { once: true });
        }, 2000);
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.gameEngine.renderer) {
            window.gameEngine.renderer.resize();
        }
    });
    
    // Prevent context menu on canvas
    document.getElementById('game-canvas').addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Add keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!window.gameUI || window.gameUI.currentScreen !== 'game') return;
        
        switch(e.key) {
            case '1':
                window.gameEngine.navigate();
                break;
            case '2':
                window.gameEngine.scanArea();
                break;
            case 'n':
            case 'N':
                window.gameEngine.navigate();
                break;
            case 's':
            case 'S':
                window.gameEngine.scanArea();
                break;
            case '3':
            case 'r':
            case 'R':
                window.gameEngine.repair();
                break;
            case '4':
            case 'i':
            case 'I':
                window.gameEngine.showInventory();
                break;
            case '5':
            case 'q':
            case 'Q':
                window.gameEngine.showQuests();
                break;
            case '6':
            case 'm':
            case 'M':
                window.gameEngine.showMap();
                break;
            case 'Escape':
                window.gameUI.showScreen('mainMenu');
                break;
        }
    });
    
    console.log('Cosmic Explorer initialized!');
});
