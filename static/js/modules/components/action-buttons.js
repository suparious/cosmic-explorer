/**
 * ActionButtons - Manages dynamic action buttons in the UI
 */
export class ActionButtons {
    constructor(uiManager) {
        this.uiManager = uiManager;
    }
    
    /**
     * Show the buy pod button
     */
    showBuyPodButton() {
        let buyPodBtn = document.getElementById('buy-pod-btn');
        if (!buyPodBtn) {
            // Create button if it doesn't exist
            buyPodBtn = document.createElement('button');
            buyPodBtn.id = 'buy-pod-btn';
            buyPodBtn.className = 'action-btn available';
            buyPodBtn.innerHTML = '<span class="btn-icon">🛸</span><span>Buy Pod</span>';
            buyPodBtn.onclick = () => {
                if (window.gameEngine) window.gameEngine.buyPod();
            };
            
            const actionPanel = document.getElementById('action-panel');
            if (actionPanel) {
                actionPanel.appendChild(buyPodBtn);
            }
        }
        buyPodBtn.style.display = 'flex';
    }
    
    /**
     * Hide the buy pod button
     */
    hideBuyPodButton() {
        const buyPodBtn = document.getElementById('buy-pod-btn');
        if (buyPodBtn) {
            buyPodBtn.style.display = 'none';
        }
    }
    
    /**
     * Show the buy ship button
     */
    showBuyShipButton() {
        let buyShipBtn = document.getElementById('buy-ship-btn');
        if (!buyShipBtn) {
            // Create button if it doesn't exist
            buyShipBtn = document.createElement('button');
            buyShipBtn.id = 'buy-ship-btn';
            buyShipBtn.className = 'action-btn available';
            buyShipBtn.innerHTML = '<span class="btn-icon">🚀</span><span>Buy Ship</span>';
            buyShipBtn.onclick = () => {
                if (window.gameEngine) window.gameEngine.buyShip();
            };
            
            const actionPanel = document.getElementById('action-panel');
            if (actionPanel) {
                actionPanel.appendChild(buyShipBtn);
            }
        }
        buyShipBtn.style.display = 'flex';
    }
    
    /**
     * Hide the buy ship button
     */
    hideBuyShipButton() {
        const buyShipBtn = document.getElementById('buy-ship-btn');
        if (buyShipBtn) {
            buyShipBtn.style.display = 'none';
        }
    }
    
    /**
     * Show the pod mods button
     * @param {boolean} justBoughtPod - Whether the pod was just purchased
     */
    showPodModsButton(justBoughtPod = false) {
        let podModsBtn = document.getElementById('pod-mods-btn');
        if (!podModsBtn) {
            // Create button if it doesn't exist
            podModsBtn = document.createElement('button');
            podModsBtn.id = 'pod-mods-btn';
            podModsBtn.className = 'action-btn';
            podModsBtn.innerHTML = '<span class="btn-icon">✨</span><span>Pod Mods</span>';
            // Add inline styles to ensure visibility
            podModsBtn.style.cssText = 'background: linear-gradient(135deg, #FFD700, #FFA500); color: #0a0a0f; font-weight: bold;';
            
            const actionPanel = document.getElementById('action-panel');
            if (actionPanel) {
                // Insert before the last button (Star Map) to keep it more visible
                const starMapBtn = actionPanel.querySelector('button:last-child');
                if (starMapBtn) {
                    actionPanel.insertBefore(podModsBtn, starMapBtn);
                } else {
                    actionPanel.appendChild(podModsBtn);
                }
                console.log('Pod Mods button added to action panel');
            }
        }
        
        // Update button state based on justBoughtPod
        if (justBoughtPod) {
            podModsBtn.disabled = true;
            podModsBtn.classList.remove('available');
            podModsBtn.title = 'Navigate at least once before installing augmentations';
            // Update button text to be more helpful
            podModsBtn.innerHTML = '<span class="btn-icon">✨</span><span>Pod Mods (Navigate First)</span>';
            podModsBtn.onclick = () => {
                if (this.uiManager.notificationManager) {
                    this.uiManager.notificationManager.showNotification('You must navigate at least once after buying a pod before installing augmentations!', 'info', 4000);
                }
            };
        } else {
            podModsBtn.disabled = false;
            podModsBtn.classList.add('available');
            podModsBtn.title = 'Install pod augmentations';
            podModsBtn.innerHTML = '<span class="btn-icon">✨</span><span>Pod Mods</span>';
            podModsBtn.onclick = () => {
                if (this.uiManager.podModsModal) {
                    this.uiManager.podModsModal.show();
                }
            };
        }
        
        podModsBtn.style.display = 'flex';
    }
    
    /**
     * Hide the pod mods button
     */
    hidePodModsButton() {
        const podModsBtn = document.getElementById('pod-mods-btn');
        if (podModsBtn) {
            podModsBtn.style.display = 'none';
        }
    }
}
