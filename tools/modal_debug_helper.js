// Modal Debug Helper for Cosmic Explorer
// Use this in the browser console to test and debug modal functionality

window.modalDebug = {
    // Test showing a modal with valid choices
    testValidModal: function() {
        console.log('Testing valid modal...');
        window.uiManager.showChoiceModal(
            'Test Modal - Should Work', 
            ['Option 1', 'Option 2', 'Option 3'], 
            (choice) => {
                console.log('User selected choice:', choice);
            }
        );
    },
    
    // Test showing a modal with empty choices (should not show)
    testEmptyModal: function() {
        console.log('Testing empty modal (should not appear)...');
        window.uiManager.showChoiceModal(
            'Test Modal - Should NOT Appear', 
            [], 
            (choice) => {
                console.log('This should never be called');
            }
        );
    },
    
    // Test showing a modal with invalid choices (should not show)
    testInvalidModal: function() {
        console.log('Testing invalid modal (should not appear)...');
        window.uiManager.showChoiceModal(
            'Test Modal - Should NOT Appear', 
            [null, undefined, '', '   ', 0, false], 
            (choice) => {
                console.log('This should never be called');
            }
        );
    },
    
    // Force close all modals
    closeAll: function() {
        console.log('Closing all modals...');
        window.uiManager.closeAllModals();
    },
    
    // Check modal state
    checkState: function() {
        const modal = document.getElementById('choice-modal');
        const choiceList = document.getElementById('choice-list');
        const closeBtn = modal.querySelector('.modal-close');
        
        console.log('Modal State:', {
            displayed: modal.style.display,
            zIndex: modal.style.zIndex,
            animation: modal.style.animation,
            choiceCount: choiceList.children.length,
            choices: Array.from(choiceList.children).map(c => c.textContent),
            closeButtonPosition: closeBtn ? {
                position: window.getComputedStyle(closeBtn).position,
                top: window.getComputedStyle(closeBtn).top,
                right: window.getComputedStyle(closeBtn).right,
                left: window.getComputedStyle(closeBtn).left
            } : 'No close button found'
        });
        
        console.log('Active Modals:', window.uiManager.modalManager.activeModals.length);
    },
    
    // Simulate backend event with choices
    simulateChoiceEvent: function(choices = ['Navigate', 'Scan', 'Wait']) {
        console.log('Simulating choice event...');
        const event = {
            type: 'choice_required',
            message: 'What would you like to do?',
            choices: choices
        };
        
        window.gameEngine.socketHandler.handleGameEvent(event);
    },
    
    // Fix stuck modal
    fixStuckModal: function() {
        console.log('Attempting to fix stuck modal...');
        
        // Force close the modal
        const modal = document.getElementById('choice-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.style.animation = 'none';
            
            // Clear choices
            const choiceList = document.getElementById('choice-list');
            if (choiceList) {
                choiceList.innerHTML = '';
            }
            
            // Clean up modal manager state
            window.uiManager.modalManager.cleanupChoiceModalHandlers();
            window.uiManager.modalManager.activeModals = [];
            window.uiManager.modalManager.currentModalZIndex = 1000;
        }
        
        console.log('Modal should be closed now. Try starting a new game.');
    },
    
    // Show instructions
    help: function() {
        console.log(`
Modal Debug Helper Commands:
============================
modalDebug.testValidModal()    - Test a working modal with 3 choices
modalDebug.testEmptyModal()    - Test modal with empty choices (should not show)
modalDebug.testInvalidModal()  - Test modal with invalid choices (should not show)
modalDebug.closeAll()          - Force close all modals
modalDebug.checkState()        - Check current modal state and position
modalDebug.simulateChoiceEvent() - Simulate a backend choice event
modalDebug.fixStuckModal()     - Fix a stuck modal that won't close
modalDebug.help()              - Show this help message

If you're stuck with a modal that won't close, run:
modalDebug.fixStuckModal()
        `);
    }
};

console.log('Modal Debug Helper loaded. Type "modalDebug.help()" for commands.');
