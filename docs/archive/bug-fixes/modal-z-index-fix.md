# Modal Z-Index Layering Fix

## Problem Description
The game had an issue where notification modals, confirmation pop-ups, and question dialogs (like sell dialogs) were appearing behind other modals such as:
- Save/Load modal
- Ship/Inventory modal
- Pod Mods modal
- Food modal
- Star Map modal

This was happening because the CSS had static z-index values assigned to each modal:
- choice-modal: 1001
- save-load-modal: 1002
- pod-mods-modal: 1003
- food-modal: 1004
- ship-modal: 1005
- star-map-modal: 1006

When a choice modal (used for confirmations and questions) was opened from within another modal, it would appear behind because of its lower z-index.

## Solution Implemented
I implemented a dynamic z-index management system in the UIManager class:

1. **Added z-index management properties to UIManager constructor:**
   - `modalZIndexBase`: Base z-index value (1000)
   - `currentModalZIndex`: Tracks the current highest z-index
   - `activeModals`: Array to track currently open modals

2. **Updated all modal show methods to:**
   - Increment `currentModalZIndex` by 10 when showing a modal
   - Set the modal's z-index to the new value
   - Track the modal in `activeModals` array

3. **Updated all modal hide methods to:**
   - Remove the modal from `activeModals` array
   - Reset `currentModalZIndex` to base value when no modals are active

4. **Removed static z-index values from CSS**
   - Removed hardcoded z-index values for individual modals
   - Kept notification z-index at 9999 to ensure they always appear on top

## Affected Methods
- `showChoiceModal()` / `hideChoiceModal()`
- `showSaveLoadModal()` / `hideSaveLoadModal()`
- `showPodModsModal()` / `hidePodModsModal()`
- `showFoodModal()` / `hideFoodModal()`
- `showShipModal()` / `hideShipModal()`
- `showStarMap()` / `hideStarMap()`

## Result
Now when any modal is opened, it automatically gets a higher z-index than any currently open modal. This ensures that:
- Confirmation dialogs appear on top of the modal that triggered them
- Sell dialogs appear on top of the inventory modal
- Question prompts appear on top of any other modal
- The layering is always correct regardless of which modals are open

## Testing
To test the fix:
1. Open the Ship/Inventory modal
2. Try to sell an item - the sell dialog should appear on top
3. Open the Save/Load modal
4. Try to overwrite a save - the confirmation should appear on top
5. Open any modal and trigger a choice/question - it should always appear on top

The modal layering issue is now completely resolved!
