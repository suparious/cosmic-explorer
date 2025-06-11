/**
 * UISounds - Manages UI sound effects
 */
export class UISounds {
    constructor() {
        this.initUISounds();
    }
    
    /**
     * Initialize UI sounds for all interactive elements
     */
    initUISounds() {
        // Add click sound to all interactive buttons
        const addClickSound = (element) => {
            if (!element) return;
            
            // Store original onclick if it exists
            const originalOnClick = element.onclick;
            
            element.onclick = function(e) {
                // Play click sound
                if (window.audioManager && !this.disabled) {
                    window.audioManager.playUIClick();
                }
                
                // Call original onclick if it exists
                if (originalOnClick) {
                    originalOnClick.call(this, e);
                }
            };
        };
        
        // Add sounds to existing buttons
        document.querySelectorAll('.action-btn, .menu-btn, .choice-btn, button').forEach(btn => {
            addClickSound(btn);
        });
        
        // Watch for new buttons being added to DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check if the node itself is a button
                        if (node.matches && (node.matches('.action-btn, .menu-btn, .choice-btn') || node.tagName === 'BUTTON')) {
                            addClickSound(node);
                        }
                        // Check for buttons within the added node
                        if (node.querySelectorAll) {
                            node.querySelectorAll('.action-btn, .menu-btn, .choice-btn, button').forEach(btn => {
                                addClickSound(btn);
                            });
                        }
                    }
                });
            });
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}
