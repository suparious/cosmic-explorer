"""
Ship System Module for Cosmic Explorer
Handles all ship-related functionality including types, modifications, and stats
"""

# Ship type definitions with their base stats and characteristics
SHIP_TYPES = {
    "scout": {
        "name": "Scout Vessel",
        "description": "Fast and agile, perfect for exploration",
        "cost": 400,
        "max_hp": 80,
        "cargo_capacity": 50,
        "fuel_efficiency": 0.8,  # 20% better fuel efficiency
        "speed": 1.2,  # 20% faster
        "slots": {
            "high": 2,
            "mid": 3,
            "low": 1,
            "rig": 1
        },
        "icon": "🛸"
    },
    "trader": {
        "name": "Merchant Cruiser",
        "description": "Massive cargo hold for profitable trade runs",
        "cost": 800,
        "max_hp": 100,
        "cargo_capacity": 200,
        "fuel_efficiency": 1.2,  # 20% worse fuel efficiency
        "speed": 0.8,  # 20% slower
        "slots": {
            "high": 1,
            "mid": 2,
            "low": 4,
            "rig": 2
        },
        "icon": "🚢"
    },
    "combat": {
        "name": "Combat Frigate",
        "description": "Armed and armored for dangerous encounters",
        "cost": 1200,
        "max_hp": 150,
        "cargo_capacity": 100,
        "fuel_efficiency": 1.0,
        "speed": 1.0,
        "slots": {
            "high": 4,
            "mid": 2,
            "low": 2,
            "rig": 1
        },
        "icon": "⚔️"
    },
    "explorer": {
        "name": "Explorer Class",
        "description": "Versatile vessel for long-range expeditions",
        "cost": 2000,
        "max_hp": 120,
        "cargo_capacity": 150,
        "fuel_efficiency": 0.9,
        "speed": 1.1,
        "slots": {
            "high": 3,
            "mid": 3,
            "low": 3,
            "rig": 2
        },
        "icon": "🚀"
    }
}

# Ship modification definitions organized by slot type
SHIP_MODS = {
    # High slot mods (weapons, mining, utilities)
    "laser_cannon": {
        "name": "Pulse Laser Cannon",
        "description": "Basic energy weapon for defense",
        "slot": "high",
        "cost": 200,
        "effects": {
            "combat_power": 10
        },
        "icon": "⚡"
    },
    "missile_launcher": {
        "name": "Missile Launcher",
        "description": "Long-range explosive weapon",
        "slot": "high",
        "cost": 300,
        "effects": {
            "combat_power": 15
        },
        "icon": "🚀"
    },
    "mining_laser": {
        "name": "Mining Laser",
        "description": "Extract valuable resources from asteroids",
        "slot": "high",
        "cost": 250,
        "effects": {
            "mining_yield": 1.5
        },
        "icon": "⛏️"
    },
    "salvager": {
        "name": "Salvage Scanner",
        "description": "Recover valuable components from wrecks",
        "slot": "high",
        "cost": 350,
        "effects": {
            "salvage_chance": 0.3
        },
        "icon": "🔧"
    },
    
    # Mid slot mods (shields, scanners, utilities)
    "shield_booster": {
        "name": "Shield Booster",
        "description": "Increases maximum shields",
        "slot": "mid",
        "cost": 300,
        "effects": {
            "max_hp": 20
        },
        "icon": "🛡️"
    },
    "scanner_upgrade": {
        "name": "Advanced Scanner",
        "description": "Improved detection and analysis",
        "slot": "mid",
        "cost": 400,
        "effects": {
            "scan_bonus": 2.0
        },
        "icon": "📡"
    },
    "targeting_computer": {
        "name": "Targeting Computer",
        "description": "Improves weapon accuracy",
        "slot": "mid",
        "cost": 250,
        "effects": {
            "accuracy": 0.2
        },
        "icon": "🎯"
    },
    "afterburner": {
        "name": "Afterburner Module",
        "description": "Boost speed temporarily",
        "slot": "mid",
        "cost": 350,
        "effects": {
            "speed": 0.3
        },
        "icon": "🔥"
    },
    
    # Low slot mods (armor, cargo, engineering)
    "armor_plates": {
        "name": "Reinforced Armor Plates",
        "description": "Increases hull strength",
        "slot": "low",
        "cost": 250,
        "effects": {
            "max_hp": 30
        },
        "icon": "🪨"
    },
    "cargo_expander": {
        "name": "Cargo Bay Extension",
        "description": "Increases cargo capacity",
        "slot": "low",
        "cost": 200,
        "effects": {
            "cargo_capacity": 50
        },
        "icon": "📦"
    },
    "fuel_optimizer": {
        "name": "Fuel Efficiency Module",
        "description": "Reduces fuel consumption",
        "slot": "low",
        "cost": 300,
        "effects": {
            "fuel_efficiency": 0.8
        },
        "icon": "⚙️"
    },
    "repair_drones": {
        "name": "Nanite Repair System",
        "description": "Slowly repairs hull damage",
        "slot": "low",
        "cost": 500,
        "effects": {
            "hull_repair": 1
        },
        "icon": "🤖"
    },
    
    # Rig slot mods (permanent modifications)
    "cargo_rig": {
        "name": "Cargo Optimization Rig",
        "description": "Permanent cargo capacity increase",
        "slot": "rig",
        "cost": 600,
        "effects": {
            "cargo_capacity": 75
        },
        "permanent": True,
        "icon": "🏗️"
    },
    "speed_rig": {
        "name": "Engine Tuning Rig",
        "description": "Permanent speed increase",
        "slot": "rig",
        "cost": 700,
        "effects": {
            "speed": 0.2,
            "fuel_efficiency": 0.9
        },
        "permanent": True,
        "icon": "⚡"
    },
    "shield_rig": {
        "name": "Shield Matrix Rig",
        "description": "Permanent shield enhancement",
        "slot": "rig",
        "cost": 800,
        "effects": {
            "max_hp": 40
        },
        "permanent": True,
        "icon": "💠"
    }
}


class ShipManager:
    """Manages ship-related operations and calculations"""
    
    @staticmethod
    def get_ship_info(ship_type):
        """Get information about a specific ship type"""
        return SHIP_TYPES.get(ship_type, SHIP_TYPES["scout"])
    
    @staticmethod
    def get_mod_info(mod_id):
        """Get information about a specific modification"""
        return SHIP_MODS.get(mod_id)
    
    @staticmethod
    def calculate_effective_stats(base_stats, ship_type, equipped_mods):
        """Calculate effective ship stats including all modifications"""
        ship_info = SHIP_TYPES.get(ship_type, SHIP_TYPES["scout"])
        
        # Start with base ship stats
        effective_stats = {
            "max_hp": ship_info["max_hp"],
            "cargo_capacity": ship_info["cargo_capacity"],
            "fuel_efficiency": ship_info["fuel_efficiency"],
            "speed": ship_info["speed"],
            "combat_power": 0,
            "mining_yield": 1.0,
            "salvage_chance": 0.0,
            "scan_bonus": 1.0,
            "accuracy": 0.0,
            "hull_repair": 0
        }
        
        # Apply mod effects
        for slot_type, mods in equipped_mods.items():
            for mod_id in mods:
                if mod_id in SHIP_MODS:
                    mod_effects = SHIP_MODS[mod_id].get("effects", {})
                    
                    # Apply each effect
                    for effect, value in mod_effects.items():
                        if effect in effective_stats:
                            if effect in ["fuel_efficiency", "mining_yield", "scan_bonus"]:
                                # Multiplicative effects
                                effective_stats[effect] *= value
                            else:
                                # Additive effects
                                effective_stats[effect] += value
        
        return effective_stats
    
    @staticmethod
    def can_equip_mod(ship_type, equipped_mods, mod_id):
        """Check if a modification can be equipped"""
        if mod_id not in SHIP_MODS:
            return False, "Invalid modification"
        
        mod_info = SHIP_MODS[mod_id]
        slot_type = mod_info["slot"]
        ship_info = SHIP_TYPES.get(ship_type, SHIP_TYPES["scout"])
        
        # Check if ship has available slot
        current_mods_in_slot = len(equipped_mods.get(slot_type, []))
        max_slots = ship_info["slots"].get(slot_type, 0)
        
        if current_mods_in_slot >= max_slots:
            return False, f"No available {slot_type} slots"
        
        return True, "Can equip"
    
    @staticmethod
    def get_combat_power(equipped_mods):
        """Calculate total combat power from equipped weapons"""
        total_power = 0
        for mods in equipped_mods.values():
            for mod_id in mods:
                if mod_id in SHIP_MODS:
                    total_power += SHIP_MODS[mod_id].get("effects", {}).get("combat_power", 0)
        return total_power
    
    @staticmethod
    def get_available_mods_for_slot(slot_type):
        """Get all modifications available for a specific slot type"""
        return {
            mod_id: mod_info 
            for mod_id, mod_info in SHIP_MODS.items() 
            if mod_info["slot"] == slot_type
        }
    
    @staticmethod
    def purchase_ship(player_stats, ship_type):
        """Handle ship purchase"""
        if ship_type not in SHIP_TYPES:
            return False, "Invalid ship type"
        
        ship_info = SHIP_TYPES[ship_type]
        
        if player_stats["wealth"] < ship_info["cost"]:
            return False, f"Insufficient wealth. Need {ship_info['cost']}"
        
        # Deduct cost
        player_stats["wealth"] -= ship_info["cost"]
        
        # Update ship stats
        player_stats["ship_type"] = ship_type
        player_stats["ship_condition"] = ship_info["max_hp"]
        player_stats["max_ship_condition"] = ship_info["max_hp"]
        player_stats["base_max_ship_condition"] = ship_info["max_hp"]
        player_stats["cargo_capacity"] = ship_info["cargo_capacity"]
        
        # Reset mods for new ship
        player_stats["ship_mods"] = {
            "high": [],
            "mid": [],
            "low": [],
            "rig": []
        }
        
        return True, f"{ship_info['icon']} {ship_info['name']} purchased!"
    
    @staticmethod
    def install_mod(player_stats, mod_id):
        """Install a modification on the ship"""
        if mod_id not in SHIP_MODS:
            return False, "Invalid modification"
        
        mod_info = SHIP_MODS[mod_id]
        slot_type = mod_info["slot"]
        
        # Check if can equip
        can_equip, reason = ShipManager.can_equip_mod(
            player_stats["ship_type"],
            player_stats["ship_mods"],
            mod_id
        )
        
        if not can_equip:
            return False, reason
        
        # Check wealth
        if player_stats["wealth"] < mod_info["cost"]:
            return False, f"Insufficient wealth. Need {mod_info['cost']}"
        
        # Purchase and install
        player_stats["wealth"] -= mod_info["cost"]
        player_stats["ship_mods"][slot_type].append(mod_id)
        
        return True, f"{mod_info['icon']} {mod_info['name']} installed!"
    
    @staticmethod
    def remove_mod(player_stats, mod_id, slot_type):
        """Remove a modification from the ship"""
        if mod_id not in player_stats["ship_mods"].get(slot_type, []):
            return False, "Modification not installed"
        
        mod_info = SHIP_MODS[mod_id]
        
        # Check if permanent
        if mod_info.get("permanent", False):
            return False, "Rig modifications are permanent and cannot be removed"
        
        # Remove mod
        player_stats["ship_mods"][slot_type].remove(mod_id)
        
        # Refund 50% of cost
        refund = mod_info["cost"] // 2
        player_stats["wealth"] += refund
        
        return True, f"{mod_info['name']} removed. Received {refund} credits as salvage value"
