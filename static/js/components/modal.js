// Modal Component System for Cosmic Explorer
// Provides standardized modal creation and management

class ModalManager {
    constructor() {
        this.activeModals = [];
        this.modalZIndexBase = 1000;
    }

    /**
     * Create a standardized modal with consistent styling and behavior
     * @param {Object} options - Modal configuration
     * @returns {HTMLElement} The created modal element
     */
    createModal(options = {}) {
        const {
            id = `modal-${Date.now()}`,
            title = '',
            content = '',
            className = '',
            showCloseButton = true,
            closeOnOverlayClick = true,
            onClose = null,
            zIndexOffset = 0
        } = options;

        // Create modal container
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = `modal ${className}`;
        modal.style.zIndex = this.modalZIndexBase + zIndexOffset + this.activeModals.length;

        // Create modal content wrapper
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        // Create header if title is provided
        if (title) {
            const header = document.createElement('div');
            header.className = 'modal-header';
            
            const titleElement = document.createElement('h3');
            titleElement.textContent = title;
            header.appendChild(titleElement);

            if (showCloseButton) {
                const closeButton = this.createCloseButton(() => this.closeModal(modal, onClose));
                header.appendChild(closeButton);
            }

            modalContent.appendChild(header);
        } else if (showCloseButton) {
            // If no title but close button is needed, add it to content
            const closeButton = this.createCloseButton(() => this.closeModal(modal, onClose));
            closeButton.style.position = 'absolute';
            closeButton.style.top = '1rem';
            closeButton.style.right = '1rem';
            modalContent.appendChild(closeButton);
        }

        // Add content
        if (typeof content === 'string') {
            const contentDiv = document.createElement('div');
            contentDiv.className = 'modal-body';
            contentDiv.innerHTML = content;
            modalContent.appendChild(contentDiv);
        } else if (content instanceof HTMLElement) {
            content.className = `modal-body ${content.className || ''}`;
            modalContent.appendChild(content);
        }

        modal.appendChild(modalContent);

        // Handle overlay click
        if (closeOnOverlayClick) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal, onClose);
                }
            });
        }

        // Handle escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && this.isTopModal(modal)) {
                this.closeModal(modal, onClose);
            }
        };
        modal.dataset.escapeHandler = 'true';
        document.addEventListener('keydown', escapeHandler);
        modal._escapeHandler = escapeHandler;

        return modal;
    }

    /**
     * Create a standardized close button
     * @param {Function} onClick - Click handler
     * @returns {HTMLElement} The close button element
     */
    createCloseButton(onClick) {
        const button = document.createElement('button');
        button.className = 'modal-close';
        button.innerHTML = '×';
        button.setAttribute('aria-label', 'Close modal');
        button.onclick = onClick;
        return button;
    }

    /**
     * Show a modal
     * @param {HTMLElement} modal - The modal to show
     */
    showModal(modal) {
        if (!modal || !(modal instanceof HTMLElement)) {
            console.error('Invalid modal element');
            return;
        }

        // Add to DOM if not already present
        if (!document.body.contains(modal)) {
            document.body.appendChild(modal);
        }

        // Show modal with proper display
        modal.style.display = 'flex';
        
        // Add to active modals list
        if (!this.activeModals.includes(modal)) {
            this.activeModals.push(modal);
        }

        // Add fade-in animation
        modal.style.animation = 'fade-in 0.3s ease-out';
    }

    /**
     * Close a modal
     * @param {HTMLElement|string} modalOrId - The modal element or its ID
     * @param {Function} onClose - Optional callback after closing
     */
    closeModal(modalOrId, onClose = null) {
        const modal = typeof modalOrId === 'string' 
            ? document.getElementById(modalOrId) 
            : modalOrId;

        if (!modal) {
            console.error('Modal not found');
            return;
        }

        // Fade out animation
        modal.style.animation = 'fade-out 0.3s ease-out';
        
        setTimeout(() => {
            // Hide modal
            modal.style.display = 'none';
            
            // Remove from active modals
            const index = this.activeModals.indexOf(modal);
            if (index > -1) {
                this.activeModals.splice(index, 1);
            }

            // Remove escape handler
            if (modal._escapeHandler) {
                document.removeEventListener('keydown', modal._escapeHandler);
            }

            // Call onClose callback if provided
            if (typeof onClose === 'function') {
                onClose();
            }
        }, 300);
    }

    /**
     * Check if a modal is the topmost active modal
     * @param {HTMLElement} modal - The modal to check
     * @returns {boolean} True if the modal is on top
     */
    isTopModal(modal) {
        return this.activeModals.length > 0 && 
               this.activeModals[this.activeModals.length - 1] === modal;
    }

    /**
     * Close all open modals
     */
    closeAllModals() {
        // Close in reverse order (top to bottom)
        [...this.activeModals].reverse().forEach(modal => {
            this.closeModal(modal);
        });
    }

    /**
     * Create a standardized tab system for modals
     * @param {Array} tabs - Array of tab configurations
     * @param {Function} onTabChange - Callback when tab changes
     * @returns {Object} Tab container and content container elements
     */
    createTabSystem(tabs, onTabChange) {
        const tabContainer = document.createElement('div');
        tabContainer.className = 'modal-tabs';

        const contentContainer = document.createElement('div');
        contentContainer.className = 'modal-tab-content';

        tabs.forEach((tab, index) => {
            // Create tab button
            const tabButton = document.createElement('button');
            tabButton.className = `tab-button ${index === 0 ? 'active' : ''}`;
            tabButton.textContent = tab.label;
            tabButton.onclick = () => {
                // Update active states
                tabContainer.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                tabButton.classList.add('active');

                // Call change handler
                if (onTabChange) {
                    onTabChange(tab.id, index);
                }
            };
            tabContainer.appendChild(tabButton);
        });

        return { tabContainer, contentContainer };
    }
}

// Create global instance
window.modalManager = new ModalManager();

// Add modal animation styles if not already present
if (!document.getElementById('modal-animations')) {
    const style = document.createElement('style');
    style.id = 'modal-animations';
    style.textContent = `
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes fade-out {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.95); }
        }
        
        .modal-tabs {
            display: flex;
            background: rgba(0, 0, 0, 0.3);
            border-bottom: 2px solid var(--glass-border);
        }
        
        .tab-button {
            flex: 1;
            padding: 1rem;
            background: none;
            border: none;
            color: var(--text-secondary);
            font-family: 'Orbitron', sans-serif;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }
        
        .tab-button:hover {
            color: var(--text-primary);
            background: rgba(0, 255, 255, 0.1);
        }
        
        .tab-button.active {
            color: var(--primary-color);
            background: rgba(0, 255, 255, 0.2);
        }
        
        .tab-button.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--primary-color);
        }
        
        .modal-body {
            padding: 1.5rem;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 2px solid var(--glass-border);
        }
        
        .modal-header h3 {
            margin: 0;
            font-family: 'Orbitron', sans-serif;
            color: var(--primary-color);
        }
        
        .modal-close {
            background: none;
            border: none;
            color: var(--text-primary);
            font-size: 2rem;
            cursor: pointer;
            padding: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            border-radius: 50%;
        }
        
        .modal-close:hover {
            color: var(--danger-color);
            background: rgba(255, 51, 51, 0.1);
            transform: rotate(90deg);
        }
        
        .modal-close:focus {
            outline: 2px solid var(--primary-color);
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(style);
}
