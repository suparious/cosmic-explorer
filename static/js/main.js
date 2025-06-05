// Main entry point for Cosmic Explorer
window.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Cosmic Explorer...');
    
    // Create global instances
    window.gameEngine = new GameEngine();
    window.gameUI = window.gameEngine.uiManager;
    window.audioManager = window.gameEngine.audioManager;
    
    // Initialize game engine
    await window.gameEngine.init();
    
    // Simulate loading
    setTimeout(() => {
        // Hide loading screen and show main menu
        window.gameUI.showScreen('mainMenu');
        
        // Play background music on first user interaction
        document.addEventListener('click', () => {
            window.audioManager.playMusic();
        }, { once: true });
    }, 2000);
    
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
        if (window.gameUI.currentScreen !== 'game') return;
        
        switch(e.key) {
            case '1':
                window.gameEngine.navigate();
                break;
            case '2':
                window.gameEngine.scanArea();
                break;
            case '3':
                window.gameEngine.repair();
                break;
            case '4':
                window.gameEngine.showInventory();
                break;
            case '5':
                window.gameEngine.showQuests();
                break;
            case '6':
                window.gameEngine.showMap();
                break;
            case 'Escape':
                window.gameUI.showScreen('mainMenu');
                break;
        }
    });
    
    console.log('Cosmic Explorer initialized!');
});
