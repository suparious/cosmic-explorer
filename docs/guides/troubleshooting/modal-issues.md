---
title: Modal Dialog Troubleshooting
tags: [troubleshooting, frontend, ui, modals]
created: 2025-06-10
updated: 2025-06-10
status: active
source: archive/bug-fixes/modal-z-index-fix.md, archive/bug-fixes/modal-exit-button-fix.md
---

# Modal Dialog Troubleshooting

Common issues and solutions for the modal dialog system in Cosmic Explorer.

## Modal Z-Index Layering Issues

### Problem Description
Notification modals, confirmation dialogs, and question prompts appearing behind other modals like Save/Load, Ship/Inventory, or Pod Mods modals.

### Root Cause
Static z-index values in CSS causing improper layering when multiple modals are open:
- Choice modals had z-index: 1001
- Save/Load modal had z-index: 1002
- Other modals had incrementing values

### Solution: Dynamic Z-Index Management

#### Implementation Details
The `UIManager` class now includes dynamic z-index management:

```javascript
class UIManager {
    constructor() {
        this.modalZIndexBase = 1000;
        this.currentModalZIndex = 1000;
        this.activeModals = [];
    }
    
    showModal(modalElement) {
        this.currentModalZIndex += 10;
        modalElement.style.zIndex = this.currentModalZIndex;
        this.activeModals.push(modalElement);
    }
    
    hideModal(modalElement) {
        this.activeModals = this.activeModals.filter(m => m !== modalElement);
        if (this.activeModals.length === 0) {
            this.currentModalZIndex = this.modalZIndexBase;
        }
    }
}
```

#### Affected Components
- `showChoiceModal()` / `hideChoiceModal()`
- `showSaveLoadModal()` / `hideSaveLoadModal()`  
- `showPodModsModal()` / `hidePodModsModal()`
- `showFoodModal()` / `hideFoodModal()`
- `showShipModal()` / `hideShipModal()`
- `showStarMap()` / `hideStarMap()`

### Testing the Fix
1. Open Ship/Inventory modal
2. Try to sell an item - sell dialog should appear on top
3. Open Save/Load modal
4. Try to overwrite a save - confirmation should appear on top

## Modal Close Button Issues

### Problem Description
Exit/close buttons on modals not functioning properly or not visible.

### Common Causes
1. **Event Handler Not Attached**: Close button click handler not properly bound
2. **Button Hidden**: CSS styling hiding the button
3. **Z-Index Issues**: Button rendered below modal overlay

### Solutions

#### Ensure Event Handlers
```javascript
// Correct approach
const closeButton = modal.querySelector('.close-button');
closeButton.addEventListener('click', () => {
    uiManager.hideModal(modal);
});

// Avoid inline handlers
// ❌ <button onclick="closeModal()">
```

#### Verify Button Visibility
```css
.modal .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1; /* Above modal content */
    cursor: pointer;
    /* Ensure visible */
    display: block;
    opacity: 1;
}
```

## Modal Overflow Issues

### Problem Description
Modal content extending beyond viewport or being cut off.

### Solution
```css
.modal-content {
    max-height: 80vh;
    overflow-y: auto;
    margin: 10vh auto;
}

/* For mobile responsiveness */
@media (max-width: 768px) {
    .modal-content {
        max-height: 90vh;
        margin: 5vh auto;
        width: 95%;
    }
}
```

## Modal Background Scroll

### Problem Description
Page scrolling while modal is open, causing poor UX.

### Solution
```javascript
// When showing modal
document.body.style.overflow = 'hidden';

// When hiding modal
document.body.style.overflow = '';
```

## Multiple Modal Management

### Problem Description
Opening multiple modals simultaneously causing conflicts.

### Best Practices
1. **Modal Stack**: Track open modals in array
2. **ESC Key Handling**: Close only topmost modal
3. **Backdrop Clicks**: Handle only for topmost modal

```javascript
class ModalManager {
    constructor() {
        this.modalStack = [];
    }
    
    open(modal) {
        // Close existing modals if exclusive
        if (modal.exclusive) {
            this.closeAll();
        }
        this.modalStack.push(modal);
        this.updateEscHandler();
    }
    
    close(modal) {
        this.modalStack = this.modalStack.filter(m => m !== modal);
        this.updateEscHandler();
    }
    
    updateEscHandler() {
        // ESC closes only the topmost modal
        document.onkeydown = (e) => {
            if (e.key === 'Escape' && this.modalStack.length > 0) {
                this.close(this.modalStack[this.modalStack.length - 1]);
            }
        };
    }
}
```

## Performance Issues

### Problem Description
Modals causing lag or stuttering, especially with animations.

### Solutions

#### Optimize Animations
```css
.modal {
    /* Use transform for better performance */
    transform: translateY(-100%);
    transition: transform 0.3s ease-out;
}

.modal.show {
    transform: translateY(0);
}

/* Avoid animating expensive properties */
/* ❌ transition: all 0.3s; */
```

#### Reduce Repaints
```javascript
// Batch DOM updates
const fragment = document.createDocumentFragment();
items.forEach(item => {
    const element = createItemElement(item);
    fragment.appendChild(element);
});
modalContent.appendChild(fragment);
```

## Debugging Modal Issues

### Console Commands
```javascript
// Check active modals
console.log(uiManager.activeModals);

// Check z-index values
document.querySelectorAll('.modal').forEach(m => {
    console.log(m.id, m.style.zIndex);
});

// Force close all modals
uiManager.closeAllModals();
```

### Common Error Messages
- `Cannot read property 'addEventListener' of null` - Element not found
- `Maximum call stack size exceeded` - Infinite recursion in show/hide
- `Modal is not defined` - Scope or timing issue

## Best Practices

### Modal Structure
```html
<div class="modal" id="example-modal">
    <div class="modal-backdrop"></div>
    <div class="modal-content">
        <button class="close-button" aria-label="Close">×</button>
        <h2>Modal Title</h2>
        <div class="modal-body">
            <!-- Content -->
        </div>
        <div class="modal-footer">
            <button class="confirm">Confirm</button>
            <button class="cancel">Cancel</button>
        </div>
    </div>
</div>
```

### Accessibility
- Use `role="dialog"` and `aria-modal="true"`
- Trap focus within modal
- Provide keyboard navigation
- Include close button with `aria-label`

## Related Documentation

- [[components/frontend/ui-system|UI System Architecture]]
- [[guides/development/frontend-guide|Frontend Development Guide]]
- [[references/ui-components|UI Component Reference]]
- [[archive/bug-fixes/modal-z-index-fix|Original Z-Index Fix]]

---

Parent: [[guides/troubleshooting/index|Troubleshooting]] | [[README|Documentation Hub]]
