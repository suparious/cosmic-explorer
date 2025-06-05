# Pod Augmentation System

## Overview
The escape pod system now features purchasable augmentations that enhance your ship's capabilities while the pod is attached. This adds a strategic risk/reward layer where players invest in powerful upgrades that are lost when the pod is used.

## Features

### Pod HP System
- Pod HP is now real-time data from the game state (not placeholder)
- Shows actual HP values (e.g., "30/30 HP") in the UI
- Visual indicators update based on pod status

### Available Augmentations

#### 🛡️ Shield Boost Matrix (300 wealth)
- Increases maximum ship HP by 20
- Provides extra durability for dangerous journeys
- Ship HP bar adjusts to show increased capacity

#### 📡 Advanced Scanner Array (400 wealth)
- Doubles rewards from positive scan events
- Helps accumulate wealth faster
- Shows "(Scanner Array bonus!)" when triggered

#### 📦 Emergency Cargo Module (500 wealth)
- Preserves 50% of wealth when pod is used
- Critical for protecting hard-earned resources
- Activates automatically when buying new ship after pod use

#### 🚀 Emergency Thrusters (250 wealth)
- Reduces fuel consumption by 20%
- Extends exploration range
- Applies to all navigation actions

### Visual Indicators

#### On Ship (Game Canvas)
- Augmentations appear as colored dots around the pod
- Each augmentation has a unique color:
  - Shield Boost: Green
  - Scanner Array: Cyan
  - Cargo Module: Magenta
  - Emergency Thrusters: Red
- Pulsing effect shows augmentations are active

#### In UI
- "Pod Mods" button appears at repair locations
- Modal shows all augmentations with:
  - Icon, name, and description
  - Cost and purchase button
  - "Installed" status for owned augmentations
  - Disabled state when can't afford

### Strategic Considerations

1. **Investment Risk**: All augmentations are lost when pod is used
2. **Synergy**: Combine augmentations for maximum effectiveness
3. **Timing**: Buy augmentations early to maximize benefit
4. **Balance**: Choose between immediate ship upgrades vs pod augmentations

### Implementation Details

#### Backend (api/app.py)
- `POD_AUGMENTATIONS` dictionary defines all augmentations
- `get_effective_stats()` applies augmentation bonuses
- `base_max_ship_condition` tracks ship HP without augmentations
- Augmentations cleared when pod is used

#### Frontend
- Real-time pod HP updates from game state
- Dynamic button visibility based on location and pod status
- Modal interface for purchasing augmentations
- Visual feedback on ship canvas

#### Game Balance
- Augmentations powerful enough to justify risk
- Costs balanced against typical wealth accumulation
- Effects noticeable but not game-breaking
- Encourages strategic planning

## Usage Guide

1. **Purchase Pod**: First buy escape pod for 500 wealth
2. **Visit Repair Location**: Augmentations only available at planets/outposts
3. **Click "Pod Mods"**: Opens augmentation purchase interface
4. **Select Augmentations**: Choose based on playstyle and wealth
5. **Enjoy Benefits**: Effects apply immediately to ship
6. **Risk Management**: Remember all lost if ship destroyed!

## Future Expansion Ideas
- Rare augmentations from special events
- Augmentation combinations that unlock bonus effects
- Pod upgrade tiers (Bronze/Silver/Gold pods)
- Augmentation recovery missions
- Trade-in system for unwanted augmentations