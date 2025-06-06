"""
Pod System Module for Cosmic Explorer
Handles escape pod functionality, augmentations, and pod mode mechanics
"""

# Pod augmentation definitions
POD_AUGMENTATIONS = {
    "shield_boost": {
        "name": "Shield Boost Matrix",
        "description": "Increases maximum ship HP by 20 when pod is equipped",
        "cost": 300,
        "effect": {"max_ship_condition": 20},
        "icon": "🛡️",
        "slot": "defensive"
    },
    "scanner_array": {
        "name": "Advanced Scanner Array",
        "description": "Doubles rewards from scan events",
        "cost": 400,
        "effect": {"scan_multiplier": 2},
        "icon": "📡",
        "slot": "utility"
    },
    "cargo_module": {
        "name": "Emergency Cargo Module",
        "description": "Preserves valuable cargo when pod is used",
        "cost": 500,
        "effect": {"cargo_preservation": 10},  # 10 weight units of cargo saved
        "icon": "📦",
        "slot": "storage"
    },
    "emergency_thrusters": {
        "name": "Emergency Thrusters",
        "description": "Reduces fuel consumption by 20%",
        "cost": 250,
        "effect": {"fuel_efficiency": 0.8},
        "icon": "🚀",
        "slot": "propulsion"
    },
    "life_support_upgrade": {
        "name": "Enhanced Life Support",
        "description": "Pod HP increased to 50",
        "cost": 600,
        "effect": {"pod_max_hp": 50},
        "icon": "💨",
        "slot": "defensive"
    },
    "distress_beacon": {
        "name": "Emergency Distress Beacon",
        "description": "50% chance to be rescued instead of taking damage",
        "cost": 450,
        "effect": {"rescue_chance": 0.5},
        "icon": "🆘",
        "slot": "utility"
    },
    "armor_plating": {
        "name": "Reinforced Pod Armor",
        "description": "Reduces pod damage by 50%",
        "cost": 550,
        "effect": {"damage_reduction": 0.5},
        "icon": "🪨",
        "slot": "defensive"
    },
    "emergency_supplies": {
        "name": "Emergency Supply Cache",
        "description": "Start with 20 food when using pod",
        "cost": 300,
        "effect": {"emergency_food": 20},
        "icon": "🍱",
        "slot": "storage"
    }
}

# Pod configuration
POD_CONFIG = {
    "base_hp": 30,
    "base_cost": 500,
    "max_augmentations": 4,
    "damage_chance": 0.3,  # Chance of taking damage during pod travel
    "base_damage": 10,
    "new_ship_cost": 400
}


class PodManager:
    """Manages escape pod functionality and augmentations"""
    
    @staticmethod
    def can_buy_pod(player_stats):
        """Check if player can purchase an escape pod"""
        if player_stats.get("has_flight_pod", False):
            return False, "Already own an escape pod"
        
        if player_stats["wealth"] < POD_CONFIG["base_cost"]:
            return False, f"Insufficient wealth. Need {POD_CONFIG['base_cost']}"
        
        return True, "Can purchase"
    
    @staticmethod
    def purchase_pod(player_stats):
        """Purchase an escape pod"""
        can_buy, reason = PodManager.can_buy_pod(player_stats)
        
        if not can_buy:
            return False, reason
        
        player_stats["wealth"] -= POD_CONFIG["base_cost"]
        player_stats["has_flight_pod"] = True
        player_stats["pod_hp"] = POD_CONFIG["base_hp"]
        player_stats["pod_max_hp"] = POD_CONFIG["base_hp"]
        player_stats["pod_augmentations"] = []
        player_stats["just_bought_pod"] = True
        
        return True, "Emergency escape pod purchased! This life-saving device will activate if your ship is destroyed."
    
    @staticmethod
    def can_install_augmentation(player_stats, aug_id):
        """Check if an augmentation can be installed"""
        if not player_stats.get("has_flight_pod", False):
            return False, "No escape pod to augment"
        
        if player_stats.get("in_pod_mode", False):
            return False, "Cannot modify pod while in use"
        
        if player_stats.get("just_bought_pod", False):
            return False, "Must navigate at least once after buying pod"
        
        if aug_id not in POD_AUGMENTATIONS:
            return False, "Invalid augmentation"
        
        if aug_id in player_stats.get("pod_augmentations", []):
            return False, "Augmentation already installed"
        
        if len(player_stats.get("pod_augmentations", [])) >= POD_CONFIG["max_augmentations"]:
            return False, f"Maximum {POD_CONFIG['max_augmentations']} augmentations allowed"
        
        aug_info = POD_AUGMENTATIONS[aug_id]
        
        # Check for slot conflicts
        installed_slots = []
        for installed_aug in player_stats.get("pod_augmentations", []):
            if installed_aug in POD_AUGMENTATIONS:
                installed_slots.append(POD_AUGMENTATIONS[installed_aug].get("slot"))
        
        if aug_info.get("slot") in installed_slots:
            return False, f"Already have an augmentation in {aug_info['slot']} slot"
        
        if player_stats["wealth"] < aug_info["cost"]:
            return False, f"Insufficient wealth. Need {aug_info['cost']}"
        
        return True, "Can install"
    
    @staticmethod
    def install_augmentation(player_stats, aug_id):
        """Install a pod augmentation"""
        can_install, reason = PodManager.can_install_augmentation(player_stats, aug_id)
        
        if not can_install:
            return False, reason
        
        aug_info = POD_AUGMENTATIONS[aug_id]
        
        # Purchase augmentation
        player_stats["wealth"] -= aug_info["cost"]
        player_stats["pod_augmentations"].append(aug_id)
        
        # Apply immediate effects
        if aug_id == "life_support_upgrade":
            player_stats["pod_max_hp"] = aug_info["effect"]["pod_max_hp"]
            # If not in pod mode, also heal to new max
            if not player_stats.get("in_pod_mode", False):
                player_stats["pod_hp"] = player_stats["pod_max_hp"]
        
        return True, f"{aug_info['icon']} {aug_info['name']} installed! {aug_info['description']}"
    
    @staticmethod
    def activate_pod(player_stats):
        """Activate escape pod when ship is destroyed"""
        if not player_stats.get("has_flight_pod", False):
            return False, "No escape pod available"
        
        # Enter pod mode
        player_stats["in_pod_mode"] = True
        player_stats["pod_animation_state"] = "ejecting"
        
        # Set pod HP
        max_hp = POD_CONFIG["base_hp"]
        if "life_support_upgrade" in player_stats.get("pod_augmentations", []):
            max_hp = POD_AUGMENTATIONS["life_support_upgrade"]["effect"]["pod_max_hp"]
        
        player_stats["pod_hp"] = max_hp
        player_stats["pod_max_hp"] = max_hp
        
        # Handle cargo preservation
        preserved_cargo = []
        if "cargo_module" in player_stats.get("pod_augmentations", []):
            # Import here to avoid circular dependency
            from inventory_system import ITEM_TYPES
            
            # Sort items by value
            valuable_items = sorted(
                player_stats.get("inventory", []),
                key=lambda x: ITEM_TYPES.get(x["item_id"], {}).get("base_value", 0) * x["quantity"],
                reverse=True
            )
            
            # Save what we can
            pod_capacity = POD_AUGMENTATIONS["cargo_module"]["effect"]["cargo_preservation"]
            used_space = 0
            
            for item in valuable_items:
                item_info = ITEM_TYPES.get(item["item_id"], {})
                item_weight = item_info.get("weight", 0) * item["quantity"]
                
                if used_space + item_weight <= pod_capacity:
                    preserved_cargo.append(item)
                    used_space += item_weight
        
        # Update inventory
        player_stats["inventory"] = preserved_cargo
        
        # Add emergency supplies if augmented
        if "emergency_supplies" in player_stats.get("pod_augmentations", []):
            player_stats["food"] = player_stats.get("food", 0) + 20
        
        message = "Ship destroyed! Emergency pod activated."
        if preserved_cargo:
            message += f" Managed to save {len(preserved_cargo)} items."
        
        return True, message
    
    @staticmethod
    def handle_pod_navigation(player_stats):
        """Handle pod damage during navigation"""
        import random
        
        damage_roll = random.random()
        base_chance = POD_CONFIG["damage_chance"]
        
        # Check for rescue beacon
        if "distress_beacon" in player_stats.get("pod_augmentations", []):
            rescue_roll = random.random()
            if rescue_roll < POD_AUGMENTATIONS["distress_beacon"]["effect"]["rescue_chance"]:
                return True, "Distress beacon activated! A passing ship helps you reach safety.", 0
        
        if damage_roll < base_chance:
            # Pod takes damage
            base_damage = POD_CONFIG["base_damage"]
            
            # Apply damage reduction
            if "armor_plating" in player_stats.get("pod_augmentations", []):
                base_damage = int(base_damage * (1 - POD_AUGMENTATIONS["armor_plating"]["effect"]["damage_reduction"]))
            
            player_stats["pod_hp"] -= base_damage
            player_stats["pod_animation_state"] = "damaged"
            
            return False, f"WARNING: Pod hull damaged! Lost {base_damage} HP.", base_damage
        else:
            player_stats["pod_animation_state"] = "active"
            return True, "Pod holding steady.", 0
    
    @staticmethod
    def can_buy_new_ship(player_stats):
        """Check if player can buy a new ship while in pod"""
        if not player_stats.get("in_pod_mode", False):
            return False, "Not in pod mode"
        
        if not player_stats.get("at_repair_location", False):
            return False, "Must reach a repair location first"
        
        min_cost = POD_CONFIG["new_ship_cost"]
        if player_stats["wealth"] < min_cost:
            return False, f"Insufficient wealth. Need at least {min_cost}"
        
        return True, "Can purchase new ship"
    
    @staticmethod
    def exit_pod_mode(player_stats):
        """Exit pod mode when new ship is acquired"""
        player_stats["in_pod_mode"] = False
        player_stats["has_flight_pod"] = False
        player_stats["pod_hp"] = 0
        player_stats["pod_augmentations"] = []
        player_stats["pod_animation_state"] = "idle"
        
        return True, "Exited pod mode"
    
    @staticmethod
    def get_pod_effects(augmentations):
        """Get combined effects of all pod augmentations"""
        effects = {
            "max_ship_condition": 0,
            "scan_multiplier": 1,
            "fuel_efficiency": 1,
            "cargo_preservation": 0,
            "rescue_chance": 0,
            "damage_reduction": 0
        }
        
        for aug_id in augmentations:
            if aug_id in POD_AUGMENTATIONS:
                aug_effects = POD_AUGMENTATIONS[aug_id]["effect"]
                
                for effect, value in aug_effects.items():
                    if effect in ["scan_multiplier", "fuel_efficiency"]:
                        # Multiplicative effects
                        effects[effect] *= value
                    elif effect in ["rescue_chance", "damage_reduction"]:
                        # Percentage effects (don't stack beyond 1.0)
                        effects[effect] = min(effects[effect] + value, 1.0)
                    else:
                        # Additive effects
                        effects[effect] += value
        
        return effects
    
    @staticmethod
    def get_available_augmentations(installed_augmentations):
        """Get augmentations available for installation"""
        available = {}
        installed_slots = set()
        
        # Get installed slots
        for aug_id in installed_augmentations:
            if aug_id in POD_AUGMENTATIONS:
                installed_slots.add(POD_AUGMENTATIONS[aug_id].get("slot"))
        
        # Filter available augmentations
        for aug_id, aug_info in POD_AUGMENTATIONS.items():
            if aug_id not in installed_augmentations and aug_info.get("slot") not in installed_slots:
                available[aug_id] = aug_info
        
        return available
