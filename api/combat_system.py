"""
Combat System Module for Cosmic Explorer
Handles space combat encounters, enemy types, and tactical decisions
"""

import random

# Enemy type definitions
ENEMY_TYPES = {
    "pirate_scout": {
        "name": "Pirate Scout",
        "description": "A small, fast raider looking for easy targets",
        "hp": 30,
        "max_hp": 30,
        "combat_power": 5,
        "accuracy": 0.7,
        "speed": 1.2,
        "loot_chance": 0.8,
        "loot_table": [
            {"item": "scrap_metal", "quantity": (2, 5), "chance": 0.6},
            {"item": "fuel_cells", "quantity": (1, 2), "chance": 0.3},
            {"item": "rare_minerals", "quantity": (1, 3), "chance": 0.1}
        ],
        "wealth_reward": (50, 100),
        "flee_threshold": 0.3,  # Will flee when below 30% HP
        "icon": "🏴‍☠️"
    },
    "pirate_raider": {
        "name": "Pirate Raider",
        "description": "A well-armed pirate vessel",
        "hp": 60,
        "max_hp": 60,
        "combat_power": 12,
        "accuracy": 0.75,
        "speed": 1.0,
        "loot_chance": 0.9,
        "loot_table": [
            {"item": "scrap_metal", "quantity": (5, 10), "chance": 0.5},
            {"item": "data_cores", "quantity": (1, 2), "chance": 0.3},
            {"item": "luxury_goods", "quantity": (1, 2), "chance": 0.2}
        ],
        "wealth_reward": (100, 200),
        "flee_threshold": 0.2,
        "icon": "☠️"
    },
    "alien_drone": {
        "name": "Alien Defense Drone",
        "description": "An automated guardian of ancient ruins",
        "hp": 45,
        "max_hp": 45,
        "combat_power": 10,
        "accuracy": 0.85,  # Very accurate
        "speed": 0.8,  # Slower
        "loot_chance": 1.0,  # Always drops loot
        "loot_table": [
            {"item": "quantum_processor", "quantity": (1, 1), "chance": 0.4},
            {"item": "alien_artifacts", "quantity": (1, 1), "chance": 0.3},
            {"item": "exotic_matter", "quantity": (1, 1), "chance": 0.3}
        ],
        "wealth_reward": (0, 0),  # No credits from drones
        "flee_threshold": 0,  # Never flees
        "icon": "🤖"
    },
    "space_kraken": {
        "name": "Space Kraken",
        "description": "A massive creature of the void",
        "hp": 100,
        "max_hp": 100,
        "combat_power": 20,
        "accuracy": 0.6,  # Less accurate but powerful
        "speed": 0.6,
        "loot_chance": 1.0,
        "loot_table": [
            {"item": "exotic_matter", "quantity": (2, 4), "chance": 0.6},
            {"item": "alien_artifacts", "quantity": (1, 2), "chance": 0.4}
        ],
        "wealth_reward": (200, 400),
        "flee_threshold": 0.1,
        "icon": "🐙"
    },
    "rogue_ai_ship": {
        "name": "Rogue AI Warship",
        "description": "A powerful vessel controlled by a mad AI",
        "hp": 80,
        "max_hp": 80,
        "combat_power": 15,
        "accuracy": 0.9,  # Extremely accurate
        "speed": 1.1,
        "loot_chance": 1.0,
        "loot_table": [
            {"item": "quantum_processor", "quantity": (2, 3), "chance": 0.5},
            {"item": "data_cores", "quantity": (3, 5), "chance": 0.3},
            {"item": "fusion_core", "quantity": (1, 1), "chance": 0.2}
        ],
        "wealth_reward": (150, 300),
        "flee_threshold": 0,  # Never flees
        "icon": "🖥️"
    }
}

# Combat action definitions
COMBAT_ACTIONS = {
    "attack": {
        "name": "Attack",
        "description": "Fire all weapons at the enemy",
        "accuracy_modifier": 1.0,
        "damage_modifier": 1.0,
        "defense_modifier": 1.0
    },
    "precise_shot": {
        "name": "Precise Shot",
        "description": "Take careful aim for increased accuracy",
        "accuracy_modifier": 1.5,
        "damage_modifier": 0.8,
        "defense_modifier": 1.2
    },
    "barrage": {
        "name": "Barrage",
        "description": "Unleash maximum firepower at reduced accuracy",
        "accuracy_modifier": 0.7,
        "damage_modifier": 1.5,
        "defense_modifier": 0.8
    },
    "evasive": {
        "name": "Evasive Maneuvers",
        "description": "Focus on dodging enemy fire",
        "accuracy_modifier": 0.5,
        "damage_modifier": 0.5,
        "defense_modifier": 2.0
    }
}


class CombatManager:
    """Manages combat encounters and resolution"""
    
    def __init__(self):
        self.combat_log = []
        self.current_combat = None
    
    def generate_encounter(self, danger_level=0.5, location_type=None):
        """Generate a random combat encounter based on danger and location"""
        # Weight enemies by danger level
        enemy_weights = {
            "pirate_scout": 1.0 - danger_level * 0.5,
            "pirate_raider": danger_level,
            "alien_drone": 0.3 if location_type == "ancient_ruins" else 0.1,
            "space_kraken": danger_level * 0.3 if location_type == "nebula" else 0.05,
            "rogue_ai_ship": danger_level * 0.4
        }
        
        # Normalize weights
        total_weight = sum(enemy_weights.values())
        enemy_choices = []
        for enemy_type, weight in enemy_weights.items():
            enemy_choices.append((enemy_type, weight / total_weight))
        
        # Select enemy
        roll = random.random()
        cumulative = 0
        for enemy_type, weight in enemy_choices:
            cumulative += weight
            if roll <= cumulative:
                return self.create_enemy(enemy_type)
        
        # Fallback
        return self.create_enemy("pirate_scout")
    
    def create_enemy(self, enemy_type):
        """Create an enemy instance"""
        if enemy_type not in ENEMY_TYPES:
            enemy_type = "pirate_scout"
        
        enemy_data = ENEMY_TYPES[enemy_type].copy()
        return {
            "type": enemy_type,
            "hp": enemy_data["hp"],
            "max_hp": enemy_data["max_hp"],
            "data": enemy_data
        }
    
    def start_combat(self, player_stats, enemy=None, danger_level=0.5):
        """Initialize a combat encounter"""
        if not enemy:
            enemy = self.generate_encounter(danger_level)
        
        self.current_combat = {
            "player": {
                "hp": player_stats["ship_condition"],
                "max_hp": player_stats["max_ship_condition"],
                "stats": player_stats
            },
            "enemy": enemy,
            "turn": 1,
            "log": []
        }
        
        # Initial message
        enemy_data = enemy["data"]
        message = f"{enemy_data['icon']} Encountered {enemy_data['name']}! {enemy_data['description']}"
        self.current_combat["log"].append(message)
        
        return {
            "started": True,
            "enemy": enemy,
            "message": message,
            "combat_state": self.get_combat_state()
        }
    
    def get_combat_state(self):
        """Get current combat state for UI"""
        if not self.current_combat:
            return None
        
        return {
            "player_hp": self.current_combat["player"]["hp"],
            "player_max_hp": self.current_combat["player"]["max_hp"],
            "enemy_hp": self.current_combat["enemy"]["hp"],
            "enemy_max_hp": self.current_combat["enemy"]["max_hp"],
            "enemy_type": self.current_combat["enemy"]["type"],
            "enemy_data": self.current_combat["enemy"]["data"],
            "turn": self.current_combat["turn"],
            "available_actions": self.get_available_actions()
        }
    
    def get_available_actions(self):
        """Get available combat actions based on player equipment"""
        actions = ["attack", "evasive"]  # Basic actions always available
        
        # Add special actions based on equipment
        player_stats = self.current_combat["player"]["stats"]
        
        # Check for targeting computer
        for mods in player_stats.get("ship_mods", {}).values():
            if "targeting_computer" in mods:
                actions.append("precise_shot")
                break
        
        # Check for multiple weapons
        weapon_count = 0
        for mods in player_stats.get("ship_mods", {}).values():
            for mod in mods:
                if mod in ["laser_cannon", "missile_launcher"]:
                    weapon_count += 1
        
        if weapon_count >= 2:
            actions.append("barrage")
        
        return actions
    
    def process_combat_action(self, action_id, player_stats):
        """Process a combat action and return results"""
        if not self.current_combat:
            return {"error": "No active combat"}
        
        action = COMBAT_ACTIONS.get(action_id, COMBAT_ACTIONS["attack"])
        enemy = self.current_combat["enemy"]
        enemy_data = enemy["data"]
        
        # Calculate player combat stats
        from ship_system import ShipManager
        player_power = ShipManager.get_combat_power(player_stats["ship_mods"])
        
        # Apply equipment bonuses
        player_accuracy = 0.7  # Base accuracy
        player_speed = 1.0
        
        for mods in player_stats.get("ship_mods", {}).values():
            if "targeting_computer" in mods:
                player_accuracy += 0.2
            if "afterburner" in mods:
                player_speed += 0.3
        
        # Apply action modifiers
        player_accuracy *= action["accuracy_modifier"]
        player_damage = player_power * action["damage_modifier"]
        player_defense = player_speed * action["defense_modifier"]
        
        # Player attacks
        player_message = f"You use {action['name']}!"
        if random.random() < player_accuracy:
            damage_dealt = max(1, int(player_damage + random.randint(-2, 2)))
            enemy["hp"] -= damage_dealt
            player_message += f" Hit for {damage_dealt} damage!"
        else:
            player_message += " Missed!"
        
        self.current_combat["log"].append(player_message)
        
        # Check if enemy defeated
        if enemy["hp"] <= 0:
            return self.end_combat(True, player_stats)
        
        # Enemy attacks
        enemy_accuracy = enemy_data["accuracy"] / player_defense
        enemy_message = f"{enemy_data['name']} attacks!"
        
        if random.random() < enemy_accuracy:
            damage_taken = max(1, int(enemy_data["combat_power"] + random.randint(-3, 3)))
            self.current_combat["player"]["hp"] -= damage_taken
            player_stats["ship_condition"] -= damage_taken
            enemy_message += f" You take {damage_taken} damage!"
        else:
            enemy_message += " You evade the attack!"
        
        self.current_combat["log"].append(enemy_message)
        
        # Check if player defeated
        if self.current_combat["player"]["hp"] <= 0:
            player_stats["ship_condition"] = 0
            return self.end_combat(False, player_stats)
        
        # Check if enemy should flee
        enemy_hp_percent = enemy["hp"] / enemy["max_hp"]
        if enemy_hp_percent <= enemy_data["flee_threshold"] and random.random() < 0.5:
            self.current_combat["log"].append(f"{enemy_data['name']} flees the battle!")
            return self.end_combat(True, player_stats, enemy_fled=True)
        
        # Increment turn
        self.current_combat["turn"] += 1
        
        return {
            "success": True,
            "messages": [player_message, enemy_message],
            "combat_state": self.get_combat_state(),
            "combat_ongoing": True
        }
    
    def attempt_flee(self, player_stats):
        """Attempt to flee from combat"""
        if not self.current_combat:
            return {"error": "No active combat"}
        
        enemy = self.current_combat["enemy"]
        enemy_data = enemy["data"]
        
        # Calculate flee chance based on speed
        player_speed = 1.0
        for mods in player_stats.get("ship_mods", {}).values():
            if "afterburner" in mods:
                player_speed += 0.3
        
        from ship_system import SHIP_TYPES
        ship_info = SHIP_TYPES.get(player_stats.get("ship_type", "scout"))
        player_speed *= ship_info.get("speed", 1.0)
        
        flee_chance = min(0.9, player_speed / (enemy_data["speed"] * 1.5))
        
        if random.random() < flee_chance:
            # Successful flee
            fuel_cost = 10
            player_stats["fuel"] -= fuel_cost
            self.current_combat = None
            
            return {
                "success": True,
                "fled": True,
                "message": f"Successfully fled! Used {fuel_cost} extra fuel.",
                "combat_ongoing": False
            }
        else:
            # Failed to flee, enemy gets free attack
            damage_taken = max(1, int(enemy_data["combat_power"] * 1.5))
            self.current_combat["player"]["hp"] -= damage_taken
            player_stats["ship_condition"] -= damage_taken
            
            message = f"Failed to escape! {enemy_data['name']} hits you for {damage_taken} damage!"
            self.current_combat["log"].append(message)
            
            # Check if player defeated
            if self.current_combat["player"]["hp"] <= 0:
                player_stats["ship_condition"] = 0
                return self.end_combat(False, player_stats)
            
            return {
                "success": False,
                "fled": False,
                "message": message,
                "combat_state": self.get_combat_state(),
                "combat_ongoing": True
            }
    
    def negotiate(self, player_stats):
        """Attempt to negotiate with enemy"""
        if not self.current_combat:
            return {"error": "No active combat"}
        
        enemy = self.current_combat["enemy"]
        enemy_data = enemy["data"]
        
        # Some enemies can't be negotiated with
        if enemy["type"] in ["alien_drone", "rogue_ai_ship"]:
            return {
                "success": False,
                "message": f"{enemy_data['name']} cannot be reasoned with!",
                "combat_state": self.get_combat_state(),
                "combat_ongoing": True
            }
        
        # Calculate negotiation cost
        base_cost = enemy_data["wealth_reward"][1]  # Max reward as base
        hp_percent = enemy["hp"] / enemy["max_hp"]
        negotiation_cost = int(base_cost * hp_percent)
        
        if player_stats["wealth"] < negotiation_cost:
            return {
                "success": False,
                "message": f"Need {negotiation_cost} credits to negotiate. You have {player_stats['wealth']}.",
                "combat_state": self.get_combat_state(),
                "combat_ongoing": True
            }
        
        # Negotiation success based on enemy HP and type
        success_chance = 0.3 + (1 - hp_percent) * 0.5
        
        if random.random() < success_chance:
            # Successful negotiation
            player_stats["wealth"] -= negotiation_cost
            self.current_combat = None
            
            return {
                "success": True,
                "message": f"Negotiation successful! Paid {negotiation_cost} credits for safe passage.",
                "combat_ongoing": False
            }
        else:
            # Failed negotiation
            return {
                "success": False,
                "message": f"{enemy_data['name']} rejects your offer and continues attacking!",
                "combat_state": self.get_combat_state(),
                "combat_ongoing": True
            }
    
    def end_combat(self, victory, player_stats, enemy_fled=False):
        """End combat and distribute rewards"""
        if not self.current_combat:
            return {"error": "No active combat"}
        
        enemy = self.current_combat["enemy"]
        enemy_data = enemy["data"]
        results = {
            "victory": victory,
            "enemy_fled": enemy_fled,
            "combat_ongoing": False,
            "rewards": {
                "wealth": 0,
                "items": [],
                "experience": 0
            }
        }
        
        if victory and not enemy_fled:
            # Calculate rewards
            wealth_min, wealth_max = enemy_data["wealth_reward"]
            wealth_reward = random.randint(wealth_min, wealth_max)
            player_stats["wealth"] += wealth_reward
            results["rewards"]["wealth"] = wealth_reward
            
            # Roll for loot
            if random.random() < enemy_data["loot_chance"]:
                from inventory_system import InventoryManager
                
                # Select loot from table
                for loot_entry in enemy_data["loot_table"]:
                    if random.random() < loot_entry["chance"]:
                        item_id = loot_entry["item"]
                        qty_min, qty_max = loot_entry["quantity"]
                        quantity = random.randint(qty_min, qty_max)
                        
                        # Try to add to inventory
                        can_add, reason = InventoryManager.can_add_item(
                            player_stats["inventory"],
                            player_stats["cargo_capacity"],
                            item_id,
                            quantity
                        )
                        
                        if can_add:
                            InventoryManager.add_item(
                                player_stats["inventory"],
                                item_id,
                                quantity
                            )
                            results["rewards"]["items"].append({
                                "item_id": item_id,
                                "quantity": quantity
                            })
            
            message = f"Victory! Defeated {enemy_data['name']}. "
            if wealth_reward > 0:
                message += f"Gained {wealth_reward} credits. "
            if results["rewards"]["items"]:
                message += "Found loot!"
        elif victory and enemy_fled:
            message = "The enemy fled! Combat ended."
        else:
            message = "Defeated! Your ship has been destroyed!"
        
        results["message"] = message
        self.current_combat = None
        self.combat_log = []
        
        return results
    
    def get_combat_summary(self):
        """Get a summary of the combat for display"""
        if not self.current_combat:
            return None
        
        return {
            "turn": self.current_combat["turn"],
            "log": self.current_combat["log"][-5:],  # Last 5 messages
            "player_hp_percent": self.current_combat["player"]["hp"] / self.current_combat["player"]["max_hp"],
            "enemy_hp_percent": self.current_combat["enemy"]["hp"] / self.current_combat["enemy"]["max_hp"]
        }
