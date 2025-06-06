"""
Inventory System Module for Cosmic Explorer
Handles all item-related functionality including types, storage, and usage
"""

# Item type definitions with properties and effects
ITEM_TYPES = {
    # Trade goods - valuable items for selling
    "rare_minerals": {
        "name": "Rare Minerals",
        "description": "Valuable ore samples from asteroid mining",
        "weight": 5,
        "base_value": 50,
        "category": "trade",
        "icon": "💎",
        "stack_size": 99
    },
    "alien_artifacts": {
        "name": "Alien Artifacts",
        "description": "Mysterious ancient technology of unknown origin",
        "weight": 2,
        "base_value": 200,
        "category": "trade",
        "icon": "🗿",
        "stack_size": 20
    },
    "data_cores": {
        "name": "Data Cores",
        "description": "Encrypted information storage devices",
        "weight": 1,
        "base_value": 100,
        "category": "trade",
        "icon": "💾",
        "stack_size": 50
    },
    "luxury_goods": {
        "name": "Luxury Goods",
        "description": "High-end consumer products in high demand",
        "weight": 3,
        "base_value": 150,
        "category": "trade",
        "icon": "👑",
        "stack_size": 30
    },
    "scrap_metal": {
        "name": "Scrap Metal",
        "description": "Salvaged materials from destroyed ships",
        "weight": 10,
        "base_value": 20,
        "category": "trade",
        "icon": "🔩",
        "stack_size": 99
    },
    
    # Consumables - items with immediate effects
    "repair_nanobots": {
        "name": "Repair Nanobots",
        "description": "Microscopic robots that repair hull damage",
        "weight": 3,
        "base_value": 100,
        "category": "consumable",
        "effect": {"ship_condition": 20},
        "icon": "🔧",
        "stack_size": 10
    },
    "fuel_cells": {
        "name": "Emergency Fuel Cells",
        "description": "Compact fuel containers for emergency use",
        "weight": 10,
        "base_value": 80,
        "category": "consumable",
        "effect": {"fuel": 30},
        "icon": "🔋",
        "stack_size": 5
    },
    "shield_booster_charge": {
        "name": "Shield Booster Charge",
        "description": "Temporary shield enhancement module",
        "weight": 5,
        "base_value": 150,
        "category": "consumable",
        "effect": {"temp_hp": 50, "duration": 5},
        "icon": "⚡",
        "stack_size": 5
    },
    "med_pack": {
        "name": "Medical Pack",
        "description": "Advanced medical supplies for crew health",
        "weight": 2,
        "base_value": 120,
        "category": "consumable",
        "effect": {"health": 30},
        "icon": "🏥",
        "stack_size": 10
    },
    
    # Components - crafting materials and upgrade parts
    "quantum_processor": {
        "name": "Quantum Processor",
        "description": "Advanced computing component for ship systems",
        "weight": 1,
        "base_value": 300,
        "category": "component",
        "icon": "🖥️",
        "stack_size": 20
    },
    "exotic_matter": {
        "name": "Exotic Matter",
        "description": "Strange material with unique gravitational properties",
        "weight": 2,
        "base_value": 500,
        "category": "component",
        "icon": "🌀",
        "stack_size": 10
    },
    "fusion_core": {
        "name": "Fusion Core",
        "description": "High-energy power source for advanced systems",
        "weight": 5,
        "base_value": 400,
        "category": "component",
        "icon": "☢️",
        "stack_size": 5
    },
    
    # Quest items - special items with no weight
    "ancient_key": {
        "name": "Ancient Key",
        "description": "Opens sealed vaults in ancient ruins",
        "weight": 0,
        "base_value": 0,
        "category": "quest",
        "icon": "🗝️",
        "stack_size": 1,
        "unique": True
    },
    "star_chart_fragment": {
        "name": "Star Chart Fragment",
        "description": "Part of an ancient navigation chart",
        "weight": 0,
        "base_value": 0,
        "category": "quest",
        "icon": "🗺️",
        "stack_size": 1,
        "unique": True
    },
    "distress_beacon": {
        "name": "Distress Beacon",
        "description": "Emergency signal device from a stranded ship",
        "weight": 0,
        "base_value": 0,
        "category": "quest",
        "icon": "📡",
        "stack_size": 1,
        "unique": True
    }
}


class InventoryManager:
    """Manages inventory operations and item interactions"""
    
    @staticmethod
    def calculate_cargo_space(inventory):
        """Calculate total cargo space used by inventory"""
        used_space = 0
        for item in inventory:
            if item["item_id"] in ITEM_TYPES:
                weight = ITEM_TYPES[item["item_id"]]["weight"]
                used_space += weight * item["quantity"]
        return used_space
    
    @staticmethod
    def can_add_item(inventory, cargo_capacity, item_id, quantity=1):
        """Check if items can be added to inventory"""
        if item_id not in ITEM_TYPES:
            return False, "Unknown item type"
        
        item_info = ITEM_TYPES[item_id]
        
        # Quest items don't take space
        if item_info["category"] == "quest":
            return True, "Quest item"
        
        # Calculate weight
        item_weight = item_info["weight"] * quantity
        current_space = InventoryManager.calculate_cargo_space(inventory)
        available_space = cargo_capacity - current_space
        
        if item_weight > available_space:
            return False, f"Insufficient cargo space. Need {item_weight}, have {available_space}"
        
        # Check stack limits
        existing_item = InventoryManager.find_item(inventory, item_id)
        if existing_item:
            max_stack = item_info.get("stack_size", 99)
            if existing_item["quantity"] + quantity > max_stack:
                return False, f"Stack limit exceeded. Max stack: {max_stack}"
        
        return True, "Can add"
    
    @staticmethod
    def add_item(inventory, item_id, quantity=1):
        """Add items to inventory"""
        if item_id not in ITEM_TYPES:
            return False, "Unknown item type"
        
        # Check if item already exists
        existing_item = InventoryManager.find_item(inventory, item_id)
        
        if existing_item:
            # Add to existing stack
            existing_item["quantity"] += quantity
        else:
            # Create new stack
            inventory.append({
                "item_id": item_id,
                "quantity": quantity
            })
        
        return True, f"Added {quantity}x {ITEM_TYPES[item_id]['name']}"
    
    @staticmethod
    def remove_item(inventory, item_id, quantity=1):
        """Remove items from inventory"""
        item = InventoryManager.find_item(inventory, item_id)
        
        if not item:
            return False, "Item not in inventory"
        
        if item["quantity"] < quantity:
            return False, f"Insufficient quantity. Have {item['quantity']}"
        
        item["quantity"] -= quantity
        
        # Remove empty stacks
        if item["quantity"] <= 0:
            inventory.remove(item)
        
        return True, f"Removed {quantity}x {ITEM_TYPES[item_id]['name']}"
    
    @staticmethod
    def find_item(inventory, item_id):
        """Find an item in inventory"""
        return next((item for item in inventory if item["item_id"] == item_id), None)
    
    @staticmethod
    def use_item(player_stats, item_id):
        """Use a consumable item"""
        if item_id not in ITEM_TYPES:
            return False, "Unknown item type"
        
        item_info = ITEM_TYPES[item_id]
        
        if item_info["category"] != "consumable":
            return False, "Item is not consumable"
        
        # Check if item exists
        if not InventoryManager.find_item(player_stats["inventory"], item_id):
            return False, "Item not in inventory"
        
        # Apply effects
        effects = item_info.get("effect", {})
        effect_messages = []
        
        if "ship_condition" in effects:
            old_hp = player_stats["ship_condition"]
            max_hp = player_stats.get("max_ship_condition", 100)
            player_stats["ship_condition"] = min(
                player_stats["ship_condition"] + effects["ship_condition"],
                max_hp
            )
            actual_heal = player_stats["ship_condition"] - old_hp
            effect_messages.append(f"Ship repaired by {actual_heal} HP")
        
        if "fuel" in effects:
            old_fuel = player_stats["fuel"]
            player_stats["fuel"] = min(
                player_stats["fuel"] + effects["fuel"],
                100
            )
            actual_fuel = player_stats["fuel"] - old_fuel
            effect_messages.append(f"Gained {actual_fuel} fuel")
        
        if "health" in effects:
            old_health = player_stats["health"]
            player_stats["health"] = min(
                player_stats["health"] + effects["health"],
                100
            )
            actual_health = player_stats["health"] - old_health
            effect_messages.append(f"Health restored by {actual_health}")
        
        if "temp_hp" in effects:
            # TODO: Implement temporary HP system
            effect_messages.append(f"Temporary +{effects['temp_hp']} HP for {effects.get('duration', 5)} turns")
        
        # Remove item
        InventoryManager.remove_item(player_stats["inventory"], item_id, 1)
        
        return True, f"Used {item_info['name']}. " + ", ".join(effect_messages)
    
    @staticmethod
    def sell_item(player_stats, item_id, quantity=1, price_modifier=1.0):
        """Sell items for credits"""
        if item_id not in ITEM_TYPES:
            return False, "Unknown item type", 0
        
        item_info = ITEM_TYPES[item_id]
        
        # Quest items cannot be sold
        if item_info["category"] == "quest":
            return False, "Quest items cannot be sold", 0
        
        # Check if have enough
        inventory_item = InventoryManager.find_item(player_stats["inventory"], item_id)
        if not inventory_item or inventory_item["quantity"] < quantity:
            return False, "Insufficient quantity", 0
        
        # Calculate price
        base_price = item_info["base_value"]
        total_price = int(base_price * quantity * price_modifier)
        
        # Complete transaction
        InventoryManager.remove_item(player_stats["inventory"], item_id, quantity)
        player_stats["wealth"] += total_price
        
        return True, f"Sold {quantity}x {item_info['name']} for {total_price} credits", total_price
    
    @staticmethod
    def get_inventory_value(inventory):
        """Calculate total value of inventory"""
        total_value = 0
        for item in inventory:
            if item["item_id"] in ITEM_TYPES:
                item_info = ITEM_TYPES[item["item_id"]]
                if item_info["category"] != "quest":
                    total_value += item_info["base_value"] * item["quantity"]
        return total_value
    
    @staticmethod
    def get_items_by_category(category):
        """Get all items of a specific category"""
        return {
            item_id: item_info
            for item_id, item_info in ITEM_TYPES.items()
            if item_info["category"] == category
        }
    
    @staticmethod
    def generate_random_loot(category=None, value_range=(10, 200)):
        """Generate random loot based on category and value range"""
        import random
        
        # Filter items by category and value
        eligible_items = []
        for item_id, item_info in ITEM_TYPES.items():
            if item_info["category"] == "quest":
                continue
            if category and item_info["category"] != category:
                continue
            if value_range[0] <= item_info["base_value"] <= value_range[1]:
                eligible_items.append((item_id, item_info))
        
        if not eligible_items:
            return None
        
        # Select random item
        item_id, item_info = random.choice(eligible_items)
        
        # Random quantity based on value (higher value = lower quantity)
        if item_info["base_value"] > 100:
            quantity = 1
        elif item_info["base_value"] > 50:
            quantity = random.randint(1, 3)
        else:
            quantity = random.randint(1, 5)
        
        return {
            "item_id": item_id,
            "quantity": quantity,
            "total_value": item_info["base_value"] * quantity
        }
