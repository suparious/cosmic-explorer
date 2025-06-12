# Choice Modal Empty Choices Fix

## Issue
Players were getting stuck with a "Load Game?" modal that appeared at the start of a new game with no choices displayed and no way to dismiss it.

## Root Cause
The backend (app.py) was emitting `game_event` messages with empty `choices` arrays. Even though the frontend had validation, the socketHandler would still attempt to show the modal when it received an event with `choices: []`.

## Solution Implemented
Modified the backend to only include the `choices` field in `game_event` messages when choices exist and are non-empty. This prevents the issue at its source.

### Changes Made

1. **api/app.py** - Modified the game event emission logic:
   ```python
   # Only include choices if they exist and are non-empty
   choices = result.get('choices', [])
   if choices and len(choices) > 0:
       event_data['choices'] = choices
   ```

This ensures that events without meaningful choices don't include an empty choices array, preventing the frontend from attempting to show an empty modal.

## Why This Fix is Better
- Addresses the root cause instead of patching symptoms
- No UI overrides or hacks needed
- Clean, maintainable solution
- Prevents similar issues in the future

## Testing
1. Start a new game
2. Verify no empty modals appear
3. Verify that legitimate choice modals still work correctly (e.g., during combat)

## Related Information
- The modal system was already properly fixed in June 2025 (see `/docs/archive/bug-fixes/2025-06/choice-modal-trap-fix.md`)
- The issue reappeared due to backend code sending empty choice arrays
- Frontend validation was already robust but backend was sending invalid data
