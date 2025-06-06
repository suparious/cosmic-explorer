"""
Action Processor Module for Cosmic Explorer
Handles all game actions and events in a modular way
"""

import random
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import config
from ship_system import ShipManager, SHIP_TYPES
from inventory_system import InventoryManager, ITEM_TYPES
from pod_system import PodManager, POD_AUGMENTATIONS
from regions import get_region_visual_config
from combat_system import CombatManager, COMBAT_ACTIONS


class ActionProcessor:
    """Processes game actions and returns results"""
    
    def __init__(self):
        self.combat_manager = CombatManager()
        self.action_handlers = {
            "navigate": self.handle_navigate,
            "event": self.handle_random_event,
            "repair": self.handle_repair,
            "buy_ship": self.handle_buy_ship,
            "buy_mod": self.handle_buy_mod,
            "remove_mod": self.handle_remove_mod,
            "use_item": self.handle_use_item,
            "sell_item": self.handle_sell_item,
            "buy_pod": self.handle_buy_pod,
            "buy_augmentation": self.handle_buy_augmentation,
            "consume_food": self.handle_consume_food,
            "scan": self.handle_scan,
            "mine": self.handle_mine,
            "salvage": self.handle_salvage,
            "trade": self.handle_trade,
            "quest": self.handle_quest,
            "combat": self.handle_combat,
            "combat_action": self.handle_combat_action,
            "flee": self.handle_flee,
            "negotiate": self.handle_negotiate
        }
    
    def process_action(self, session, action, data=None):
        """Main entry point for processing actions"""
        result = {
            "success": False,
            "event": None,
            "event_type": "info",
            "choices": []
        }
        
        # Check game over conditions first
        if self.check_game_over(session, result):
            return result
        
        # Update activity
        session.update_activity()
        
        # Get handler for action
        handler = self.action_handlers.get(action)
        if not handler:
            result["event"] = f"Unknown action: {action}"
            result["event_type"] = "error"
            return result
        
        # Process the action
        try:
            result = handler(session, data or {})
            result["success"] = True
            
            # Process turn effects if this was a turn-consuming action
            if action in ["navigate", "mine", "salvage"]:
                turn_message = session.process_turn_effects()
                if turn_message:
                    result["event"] += f"\n{turn_message}"
                
                # Auto-save after turn-consuming actions
                try:
                    from save_manager import save_game_to_slot, get_current_location_name
                    location_name = get_current_location_name(
                        session.star_map,
                        session.current_region_id,
                        session.current_node_id
                    )
                    save_game_to_slot(session.to_save_dict(), 0, location_name)  # Slot 0 is auto-save
                except Exception:
                    pass  # Silently fail auto-save to not interrupt gameplay
            
        except Exception as e:
            result["event"] = f"Error processing action: {str(e)}"
            result["event_type"] = "error"
            result["success"] = False
        
        return result
    
    def check_game_over(self, session, result):
        """Check and handle game over conditions"""
        # Health depleted
        if session.player_stats["health"] <= 0:
            session.game_over = True
            result["event"] = "Game Over: Your health has depleted."
            result["event_type"] = "game_over"
            return True
        
        # Ship destroyed
        if session.player_stats["ship_condition"] <= 0 and not session.player_stats["in_pod_mode"]:
            if session.player_stats["has_flight_pod"]:
                # Activate pod
                success, message = PodManager.activate_pod(session.player_stats)
                if success:
                    result["event"] = message
                    result["event_type"] = "pod_activated"
                    result["choices"] = ["Navigate to nearest planet/outpost", "Try to send distress signal"]
                    session.statistics["pod_uses"] += 1
                    return False  # Not game over yet
            else:
                session.game_over = True
                result["event"] = "Game Over: Your ship is destroyed and you have no escape pod."
                result["event_type"] = "game_over"
                return True
        
        # Pod destroyed
        if session.player_stats["in_pod_mode"] and session.player_stats["pod_hp"] <= 0:
            session.game_over = True
            result["event"] = "Game Over: Your escape pod has been destroyed."
            result["event_type"] = "game_over"
            return True
        
        # Out of fuel
        if session.player_stats["fuel"] <= 0:
            session.game_over = True
            result["event"] = "Game Over: Out of fuel. You're stranded in space."
            result["event_type"] = "game_over"
            return True
        
        # Victory condition
        if session.player_stats["wealth"] >= config.VICTORY_WEALTH_THRESHOLD:
            session.victory = True
            session.game_over = True
            result["event"] = f"Victory! You've amassed {session.player_stats['wealth']} credits and achieved legendary status!"
            result["event_type"] = "victory"
            return True
        
        # Turn limit
        if session.turn_count >= config.MAX_TURNS:
            session.game_over = True
            result["event"] = f"Game Over: Maximum turns ({config.MAX_TURNS}) reached."
            result["event_type"] = "game_over"
            return True
        
        return False
    
    def handle_navigate(self, session, data):
        """Handle navigation action"""
        session.turn_count += 1
        
        # Reset just bought pod flag
        if "just_bought_pod" in session.player_stats:
            session.player_stats["just_bought_pod"] = False
        
        target_node_id = data.get("target_node_id")
        target_region_id = data.get("target_region_id")
        
        # Import navigation function
        from api.app import web_navigation
        
        # Pod mode navigation
        if session.player_stats["in_pod_mode"]:
            session.at_repair_location, nav_message, event_type = web_navigation(
                session, target_node_id, target_region_id
            )
            
            # Handle pod damage
            safe, damage_message, damage = PodManager.handle_pod_navigation(session.player_stats)
            
            result = {
                "event": f"{nav_message} {damage_message} Pod HP: {session.player_stats['pod_hp']}/{session.player_stats['pod_max_hp']}",
                "event_type": "danger" if damage > 0 else event_type or "navigation",
                "choices": []
            }
            
            # If reached safety, offer ship purchase
            if session.at_repair_location:
                result["choices"] = ["Buy new ship (400+ wealth)", "Wait and conserve resources"]
            
            # Update statistics
            session.statistics["total_distance_traveled"] += 1
            
        else:
            # Regular navigation
            session.at_repair_location, nav_message, event_type = web_navigation(
                session, target_node_id, target_region_id
            )
            
            result = {
                "event": nav_message,
                "event_type": event_type or "navigation",
                "choices": []
            }
            
            # Update statistics
            session.statistics["total_distance_traveled"] += 1
            session.statistics["systems_visited"] += 1
            
            # Check for combat encounter during navigation (not in pod mode)
            if not session.player_stats.get("in_combat", False) and random.random() < 0.25:  # 25% chance
                location = session.get_current_location()
                danger_level = 0.5
                if location and location["node"]:
                    danger_level = location["node"].get("danger_level", 0.5)
                
                # Higher chance in dangerous areas
                if random.random() < danger_level:
                    # Start combat
                    combat_result = self.combat_manager.start_combat(
                        session.player_stats,
                        danger_level=danger_level
                    )
                    
                    session.player_stats["in_combat"] = True
                    session.current_event = "combat"
                    
                    result["event"] += f"\n\n{combat_result['message']}"
                    result["event_type"] = "combat_start"
                    result["choices"] = ["Attack", "Flee", "Negotiate"]
                    result["combat_state"] = combat_result["combat_state"]
        
        return result
    
    def handle_random_event(self, session, data):
        """Handle random events"""
        effective_stats = session.get_effective_stats()
        
        # Enhanced events with items
        event_roll = random.random()
        
        if event_roll < 0.3:  # 30% chance of item event
            # Generate random loot
            loot = InventoryManager.generate_random_loot()
            if loot:
                # Check cargo space
                can_add, reason = InventoryManager.can_add_item(
                    session.player_stats["inventory"],
                    effective_stats["cargo_capacity"],
                    loot["item_id"],
                    loot["quantity"]
                )
                
                if can_add:
                    InventoryManager.add_item(
                        session.player_stats["inventory"],
                        loot["item_id"],
                        loot["quantity"]
                    )
                    
                    item_info = ITEM_TYPES[loot["item_id"]]
                    event_messages = [
                        f"Discovered floating cargo: {item_info['name']}!",
                        f"Salvaged {item_info['name']} from space debris!",
                        f"Found abandoned {item_info['name']}!",
                        f"Retrieved {item_info['name']} from a derelict station!"
                    ]
                    
                    session.statistics["items_collected"] += loot["quantity"]
                    
                    return {
                        "event": f"{random.choice(event_messages)} (+{loot['quantity']} {item_info['icon']})",
                        "event_type": "success",
                        "choices": []
                    }
                else:
                    return {
                        "event": "Found valuable cargo but your hold is full!",
                        "event_type": "info",
                        "choices": []
                    }
        
        # Standard stat events
        events = [
            ("Successful trade negotiation", "wealth", 100, "success"),
            ("Asteroid collision", "ship_condition", -20, "danger"),
            ("Navigation error", "fuel", -10, "warning"),
            ("Fuel cache discovered", "fuel", 30, "success"),
            ("Space pirates attack", "health", -25, "danger"),
            ("Emergency supplies found", "food", 20, "success")
        ]
        
        event_desc, stat, base_change, event_type = random.choice(events)
        change = base_change
        
        # Apply modifiers
        if stat == "wealth" and change > 0:
            # Scanner bonuses
            change = int(change * effective_stats.get("scan_bonus", 1))
        
        # Apply change
        session.player_stats[stat] = max(0, session.player_stats[stat] + change)
        
        # Update statistics
        if stat == "wealth" and change > 0:
            session.statistics["credits_earned"] += change
        
        # Format message
        if change > 0:
            message = f"{event_desc}! +{change} {stat}"
        else:
            message = f"{event_desc}! {change} {stat}"
        
        return {
            "event": message,
            "event_type": event_type,
            "choices": []
        }
    
    def handle_repair(self, session, data):
        """Handle ship repair"""
        if not session.at_repair_location:
            return {
                "event": "Must be at a repair location.",
                "event_type": "error",
                "choices": []
            }
        
        if session.player_stats["wealth"] < 100:
            return {
                "event": "Insufficient wealth. Need 100 credits.",
                "event_type": "error",
                "choices": []
            }
        
        effective_stats = session.get_effective_stats()
        max_hp = effective_stats["max_ship_condition"]
        
        session.player_stats["wealth"] -= 100
        session.player_stats["ship_condition"] = max_hp
        session.statistics["credits_spent"] += 100
        
        return {
            "event": f"Ship fully repaired! HP restored to {max_hp}.",
            "event_type": "repair",
            "choices": []
        }
    
    def handle_buy_ship(self, session, data):
        """Handle ship purchase"""
        ship_type = data.get("ship_type", "scout")
        
        if not session.at_repair_location:
            return {
                "event": "Must be at a repair location to buy ships.",
                "event_type": "error",
                "choices": []
            }
        
        success, message = ShipManager.purchase_ship(session.player_stats, ship_type)
        
        if success:
            # Exit pod mode if applicable
            if session.player_stats["in_pod_mode"]:
                PodManager.exit_pod_mode(session.player_stats)
            
            session.statistics["credits_spent"] += SHIP_TYPES[ship_type]["cost"]
            
            return {
                "event": message,
                "event_type": "purchase",
                "choices": []
            }
        else:
            return {
                "event": message,
                "event_type": "error",
                "choices": []
            }
    
    def handle_buy_mod(self, session, data):
        """Handle modification purchase"""
        mod_id = data.get("mod_id")
        
        if not session.at_repair_location:
            return {
                "event": "Must be at a repair location to install modifications.",
                "event_type": "error",
                "choices": []
            }
        
        success, message = ShipManager.install_mod(session.player_stats, mod_id)
        
        if success:
            from ship_system import SHIP_MODS
            session.statistics["credits_spent"] += SHIP_MODS[mod_id]["cost"]
        
        return {
            "event": message,
            "event_type": "purchase" if success else "error",
            "choices": []
        }
    
    def handle_remove_mod(self, session, data):
        """Handle modification removal"""
        mod_id = data.get("mod_id")
        slot_type = data.get("slot_type")
        
        if not session.at_repair_location:
            return {
                "event": "Must be at a repair location to remove modifications.",
                "event_type": "error",
                "choices": []
            }
        
        success, message = ShipManager.remove_mod(session.player_stats, mod_id, slot_type)
        
        return {
            "event": message,
            "event_type": "info" if success else "error",
            "choices": []
        }
    
    def handle_use_item(self, session, data):
        """Handle item usage"""
        item_id = data.get("item_id")
        
        success, message = InventoryManager.use_item(session.player_stats, item_id)
        
        return {
            "event": message,
            "event_type": "heal" if success else "error",
            "choices": []
        }
    
    def handle_sell_item(self, session, data):
        """Handle item sale"""
        item_id = data.get("item_id")
        quantity = data.get("quantity", 1)
        
        if not session.at_repair_location:
            return {
                "event": "Must be at a trading location to sell items.",
                "event_type": "error",
                "choices": []
            }
        
        # Get current node for price modifier
        location = session.get_current_location()
        price_modifier = 1.0
        
        if location and location["node"]:
            # Trading posts offer better prices
            if location["node"]["type"] == "trading_post":
                price_modifier = 1.2
            # Some systems have different demand
            elif location["region"]["type"] == "industrial":
                if ITEM_TYPES.get(item_id, {}).get("category") == "component":
                    price_modifier = 1.3
        
        success, message, credits = InventoryManager.sell_item(
            session.player_stats, item_id, quantity, price_modifier
        )
        
        if success:
            session.statistics["credits_earned"] += credits
        
        return {
            "event": message,
            "event_type": "success" if success else "error",
            "choices": []
        }
    
    def handle_buy_pod(self, session, data):
        """Handle pod purchase"""
        success, message = PodManager.purchase_pod(session.player_stats)
        
        if success:
            session.statistics["credits_spent"] += 500
        
        return {
            "event": message,
            "event_type": "purchase" if success else "error",
            "choices": []
        }
    
    def handle_buy_augmentation(self, session, data):
        """Handle pod augmentation purchase"""
        aug_id = data.get("augmentation_id")
        
        if not session.at_repair_location:
            return {
                "event": "Must be at a repair location to install augmentations.",
                "event_type": "error",
                "choices": []
            }
        
        success, message = PodManager.install_augmentation(session.player_stats, aug_id)
        
        if success:
            session.statistics["credits_spent"] += POD_AUGMENTATIONS[aug_id]["cost"]
        
        return {
            "event": message,
            "event_type": "purchase" if success else "error",
            "choices": []
        }
    
    def handle_consume_food(self, session, data):
        """Handle food consumption"""
        amount = data.get("amount", 10)
        health_gain = amount * 2
        
        if session.player_stats["food"] < amount:
            return {
                "event": f"Insufficient food. Have {session.player_stats['food']}.",
                "event_type": "error",
                "choices": []
            }
        
        session.player_stats["food"] -= amount
        old_health = session.player_stats["health"]
        session.player_stats["health"] = min(
            session.player_stats["health"] + health_gain,
            config.STARTING_HEALTH
        )
        actual_gain = session.player_stats["health"] - old_health
        
        return {
            "event": f"Consumed {amount} food. Health +{actual_gain}!",
            "event_type": "heal",
            "choices": []
        }
    
    def handle_scan(self, session, data):
        """Handle scanning action"""
        # TODO: Implement scanning mechanics
        return {
            "event": "Scanning not yet implemented.",
            "event_type": "info",
            "choices": []
        }
    
    def handle_mine(self, session, data):
        """Handle mining action"""
        # Check for mining equipment
        has_mining_laser = False
        mining_yield = 1.0
        
        for mods in session.player_stats["ship_mods"].values():
            if "mining_laser" in mods:
                has_mining_laser = True
                from ship_system import SHIP_MODS
                mining_yield = SHIP_MODS["mining_laser"]["effects"]["mining_yield"]
                break
        
        if not has_mining_laser:
            return {
                "event": "No mining equipment installed. Purchase a Mining Laser at a repair station.",
                "event_type": "error",
                "choices": []
            }
        
        # Check location
        location = session.get_current_location()
        if not location or location["node"]["type"] != "asteroid_field":
            return {
                "event": "Must be in an asteroid field to mine. Look for asteroid fields on the star map.",
                "event_type": "error",
                "choices": []
            }
        
        # Check fuel cost
        fuel_cost = 5
        if session.player_stats["fuel"] < fuel_cost:
            return {
                "event": f"Insufficient fuel for mining operations. Need {fuel_cost} fuel.",
                "event_type": "error",
                "choices": []
            }
        
        # Mining success
        session.turn_count += 1
        session.player_stats["fuel"] -= fuel_cost
        
        if random.random() < 0.7:  # 70% success rate
            # Generate minerals
            base_quantity = random.randint(2, 5)
            quantity = int(base_quantity * mining_yield)
            
            # Check cargo space
            effective_stats = session.get_effective_stats()
            can_add, reason = InventoryManager.can_add_item(
                session.player_stats["inventory"],
                effective_stats["cargo_capacity"],
                "rare_minerals",
                quantity
            )
            
            if can_add:
                InventoryManager.add_item(
                    session.player_stats["inventory"],
                    "rare_minerals",
                    quantity
                )
                session.statistics["items_collected"] += quantity
                
                # Small chance for bonus find
                if random.random() < 0.1:
                    bonus_items = ["quantum_processor", "exotic_matter", "data_cores"]
                    bonus_item = random.choice(bonus_items)
                    can_add_bonus, _ = InventoryManager.can_add_item(
                        session.player_stats["inventory"],
                        effective_stats["cargo_capacity"],
                        bonus_item,
                        1
                    )
                    if can_add_bonus:
                        InventoryManager.add_item(
                            session.player_stats["inventory"],
                            bonus_item,
                            1
                        )
                        return {
                            "event": f"Mining successful! Extracted {quantity} rare minerals. Bonus find: {ITEM_TYPES[bonus_item]['name']}!",
                            "event_type": "success",
                            "choices": []
                        }
                
                return {
                    "event": f"Mining successful! Extracted {quantity} rare minerals. Used {fuel_cost} fuel.",
                    "event_type": "success",
                    "choices": []
                }
            else:
                return {
                    "event": "Mining successful but cargo hold is full! Sell some items first.",
                    "event_type": "warning",
                    "choices": []
                }
        else:
            # Mining failure
            damage = random.randint(5, 15)
            session.player_stats["ship_condition"] -= damage
            
            return {
                "event": f"Mining accident! Asteroid collision caused {damage} damage. Used {fuel_cost} fuel.",
                "event_type": "danger",
                "choices": []
            }
    
    def handle_salvage(self, session, data):
        """Handle salvage action"""
        # Check for salvager equipment
        has_salvager = False
        salvage_efficiency = 1.0
        
        for mods in session.player_stats["ship_mods"].values():
            if "salvager" in mods:
                has_salvager = True
                from ship_system import SHIP_MODS
                salvage_efficiency = SHIP_MODS["salvager"]["effects"].get("salvage_efficiency", 1.5)
                break
        
        if not has_salvager:
            return {
                "event": "No salvage equipment installed. Purchase a Salvager at a repair station.",
                "event_type": "error",
                "choices": []
            }
        
        # Check if there's salvage available (after combat or at certain locations)
        location = session.get_current_location()
        salvageable_locations = ["debris_field", "battlefield", "derelict_station"]
        
        # Check if we just had combat
        has_recent_combat = session.statistics.get("ships_destroyed", 0) > session.statistics.get("last_salvage_count", 0)
        is_salvageable_location = location and location["node"]["type"] in salvageable_locations
        
        if not has_recent_combat and not is_salvageable_location:
            return {
                "event": "Nothing to salvage here. Try after combat or at debris fields.",
                "event_type": "error",
                "choices": []
            }
        
        # Check fuel cost
        fuel_cost = 3
        if session.player_stats["fuel"] < fuel_cost:
            return {
                "event": f"Insufficient fuel for salvage operations. Need {fuel_cost} fuel.",
                "event_type": "error",
                "choices": []
            }
        
        # Salvage operation
        session.turn_count += 1
        session.player_stats["fuel"] -= fuel_cost
        session.statistics["last_salvage_count"] = session.statistics.get("ships_destroyed", 0)
        
        # Salvage success rate
        if random.random() < 0.8:  # 80% success rate
            # Generate salvage
            salvage_table = [
                {"item": "scrap_metal", "weight": 0.4, "quantity": (3, 8)},
                {"item": "electronic_components", "weight": 0.3, "quantity": (2, 5)},
                {"item": "fuel_cells", "weight": 0.2, "quantity": (1, 3)},
                {"item": "data_cores", "weight": 0.08, "quantity": (1, 2)},
                {"item": "fusion_core", "weight": 0.02, "quantity": (1, 1)}
            ]
            
            # Determine what was salvaged
            salvaged_items = []
            total_weight = 0
            effective_stats = session.get_effective_stats()
            
            for item_data in salvage_table:
                if random.random() < item_data["weight"] * salvage_efficiency:
                    qty_min, qty_max = item_data["quantity"]
                    quantity = random.randint(qty_min, qty_max)
                    
                    # Check cargo space
                    can_add, reason = InventoryManager.can_add_item(
                        session.player_stats["inventory"],
                        effective_stats["cargo_capacity"],
                        item_data["item"],
                        quantity
                    )
                    
                    if can_add:
                        InventoryManager.add_item(
                            session.player_stats["inventory"],
                            item_data["item"],
                            quantity
                        )
                        salvaged_items.append(f"{quantity}x {ITEM_TYPES[item_data['item']]['name']}")
                        session.statistics["items_collected"] += quantity
                        total_weight += ITEM_TYPES[item_data['item']]["weight"] * quantity
                    else:
                        break  # Cargo full
            
            if salvaged_items:
                return {
                    "event": f"Salvage successful! Found: {', '.join(salvaged_items)}. Used {fuel_cost} fuel.",
                    "event_type": "success",
                    "choices": []
                }
            else:
                return {
                    "event": "Salvage operation complete but cargo hold is full!",
                    "event_type": "warning",
                    "choices": []
                }
        else:
            # Salvage failure - possible hazard
            if random.random() < 0.5:
                # Just wasted fuel
                return {
                    "event": f"Found only worthless debris. Used {fuel_cost} fuel.",
                    "event_type": "info",
                    "choices": []
                }
            else:
                # Hazardous debris
                damage = random.randint(3, 10)
                session.player_stats["ship_condition"] -= damage
                return {
                    "event": f"Hazardous debris! Took {damage} damage. Used {fuel_cost} fuel.",
                    "event_type": "danger",
                    "choices": []
                }
    
    def handle_trade(self, session, data):
        """Handle trading action"""
        # TODO: Implement advanced trading
        return {
            "event": "Advanced trading not yet implemented.",
            "event_type": "info",
            "choices": []
        }
    
    def handle_quest(self, session, data):
        """Handle quest-related actions"""
        # TODO: Implement quest system
        return {
            "event": "Quest system not yet implemented.",
            "event_type": "info",
            "choices": []
        }
    
    def handle_combat(self, session, data):
        """Handle combat initiation"""
        if session.player_stats.get("in_combat", False):
            return {
                "event": "Already in combat!",
                "event_type": "error",
                "choices": []
            }
        
        # Generate encounter based on location
        location = session.get_current_location()
        danger_level = 0.5
        location_type = None
        
        if location and location["node"]:
            danger_level = location["node"].get("danger_level", 0.5)
            location_type = location["node"].get("type")
        
        combat_result = self.combat_manager.start_combat(
            session.player_stats,
            danger_level=danger_level
        )
        
        session.player_stats["in_combat"] = True
        session.current_event = "combat"
        
        return {
            "event": combat_result["message"],
            "event_type": "combat_start",
            "choices": ["Attack", "Flee", "Negotiate"],
            "combat_state": combat_result["combat_state"]
        }
    
    def handle_combat_action(self, session, data):
        """Handle combat actions"""
        if not session.player_stats.get("in_combat", False):
            return {
                "event": "Not in combat!",
                "event_type": "error",
                "choices": []
            }
        
        action = data.get("combat_action", "attack")
        
        # Process combat action
        result = self.combat_manager.process_combat_action(action, session.player_stats)
        
        if result.get("combat_ongoing", False):
            # Combat continues
            return {
                "event": "\n".join(result.get("messages", [])),
                "event_type": "combat",
                "choices": ["Attack", "Flee", "Negotiate"],
                "combat_state": result.get("combat_state")
            }
        else:
            # Combat ended
            session.player_stats["in_combat"] = False
            session.current_event = None
            
            # Update statistics
            if result.get("victory", False):
                session.statistics["ships_destroyed"] += 1
                if result["rewards"]["wealth"] > 0:
                    session.statistics["credits_earned"] += result["rewards"]["wealth"]
                if result["rewards"]["items"]:
                    for item in result["rewards"]["items"]:
                        session.statistics["items_collected"] += item["quantity"]
            
            return {
                "event": result.get("message", "Combat ended."),
                "event_type": "combat_end" if result.get("victory") else "game_over",
                "choices": [],
                "rewards": result.get("rewards")
            }
    
    def handle_flee(self, session, data):
        """Handle fleeing from combat"""
        if not session.player_stats.get("in_combat", False):
            return {
                "event": "Not in combat!",
                "event_type": "error",
                "choices": []
            }
        
        result = self.combat_manager.attempt_flee(session.player_stats)
        
        if result.get("fled", False):
            # Successfully fled
            session.player_stats["in_combat"] = False
            session.current_event = None
            
            return {
                "event": result["message"],
                "event_type": "flee_success",
                "choices": []
            }
        elif result.get("combat_ongoing", False):
            # Failed to flee, combat continues
            return {
                "event": result["message"],
                "event_type": "flee_failed",
                "choices": ["Attack", "Flee", "Negotiate"],
                "combat_state": result.get("combat_state")
            }
        else:
            # Player defeated while fleeing
            session.player_stats["in_combat"] = False
            session.current_event = None
            
            return {
                "event": result.get("message", "Defeated!"),
                "event_type": "game_over",
                "choices": []
            }
    
    def handle_negotiate(self, session, data):
        """Handle negotiation attempts"""
        if not session.player_stats.get("in_combat", False):
            return {
                "event": "Not in combat!",
                "event_type": "error",
                "choices": []
            }
        
        result = self.combat_manager.negotiate(session.player_stats)
        
        if result.get("success", False) and not result.get("combat_ongoing", True):
            # Successfully negotiated
            session.player_stats["in_combat"] = False
            session.current_event = None
            session.statistics["credits_spent"] += result.get("cost", 0)
            
            return {
                "event": result["message"],
                "event_type": "negotiate_success",
                "choices": []
            }
        else:
            # Failed negotiation or combat continues
            return {
                "event": result["message"],
                "event_type": "negotiate_failed",
                "choices": ["Attack", "Flee", "Negotiate"],
                "combat_state": result.get("combat_state")
            }
