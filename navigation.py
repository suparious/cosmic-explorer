# navigation.py - Handles navigation and exploration logic for Cosmic Explorer

from config import config
import random

def standard_navigation(player_stats):
    at_repair_location = False
    print('\nYou chart a course through space.')
    print('1. Investigate a nearby planet.')
    print('2. Continue on your planned route.')
    choice = input('Enter your choice (1 or 2): ')
    if choice == '1':
        print('You approach the planet...')
        player_stats['ship_condition'] -= 5
        player_stats['fuel'] -= config.FUEL_CONSUMPTION_RATE
        print(f"Exploration takes a toll. Ship condition slightly decreased. Fuel consumed: {config.FUEL_CONSUMPTION_RATE}.")
        # Set repair location to true when at a planet
        at_repair_location = True
        print("You've docked at a planetary outpost. Repairs are available here.")
    elif choice == '2':
        print('You proceed smoothly on your route.')
        player_stats['fuel'] -= config.FUEL_CONSUMPTION_RATE
        print(f"Fuel consumed during navigation: {config.FUEL_CONSUMPTION_RATE}.")
    return at_repair_location

def region_navigation(player_stats, star_map, current_region_id, current_node_id):
    """Handle navigation within the region system"""
    if not star_map or not current_region_id or not current_node_id:
        # Fallback to standard navigation if no star map
        return {
            'current_region_id': current_region_id,
            'current_node_id': current_node_id,
            'at_repair_location': standard_navigation(player_stats)
        }
    
    # Get current location info
    current_region = star_map['regions'][current_region_id]
    current_node = None
    for node in current_region['nodes']:
        if node['id'] == current_node_id:
            current_node = node
            break
    
    if not current_node:
        print("ERROR: Current node not found!")
        return None
    
    print(f"\nCurrent Location: {current_node['name']} in {current_region['name']}")
    print(f"Node Type: {current_node['type'].replace('_', ' ').title()}")
    
    # Show available actions
    print("\nNavigation Options:")
    
    # Get connected nodes in current region
    connected_nodes = []
    for node_id in current_node['connections']:
        for node in current_region['nodes']:
            if node['id'] == node_id:
                connected_nodes.append(node)
                break
    
    # Display connected nodes
    choice_num = 1
    choices = []
    
    for node in connected_nodes:
        status = "[Visited]" if node['visited'] else "[Unvisited]"
        features = []
        if node['has_repair']:
            features.append("Repairs")
        if node['has_trade']:
            features.append("Trade")
        feature_str = f" ({', '.join(features)})" if features else ""
        
        print(f"{choice_num}. Travel to {node['name']} {status}{feature_str}")
        choices.append(('node', node))
        choice_num += 1
    
    # Show region jump options if at a wormhole or have enough fuel
    if current_node['type'] == 'wormhole' or player_stats['fuel'] >= 50:
        for region_id in current_region['connections']:
            if region_id in star_map['regions']:
                other_region = star_map['regions'][region_id]
                fuel_cost = 50 if current_node['type'] != 'wormhole' else 20
                print(f"{choice_num}. Jump to {other_region['name']} (Fuel cost: {fuel_cost})")
                choices.append(('region', other_region, fuel_cost))
                choice_num += 1
    
    print(f"{choice_num}. Stay at current location")
    
    # Get player choice
    try:
        choice = int(input(f"Enter your choice (1-{choice_num}): "))
        if choice < 1 or choice > choice_num:
            print("Invalid choice. Staying at current location.")
            return {
                'current_region_id': current_region_id,
                'current_node_id': current_node_id,
                'at_repair_location': current_node['has_repair']
            }
    except ValueError:
        print("Invalid input. Staying at current location.")
        return {
            'current_region_id': current_region_id,
            'current_node_id': current_node_id,
            'at_repair_location': current_node['has_repair']
        }
    
    # Process choice
    if choice == choice_num:  # Stay at current location
        print("You decide to stay at your current location.")
        return {
            'current_region_id': current_region_id,
            'current_node_id': current_node_id,
            'at_repair_location': current_node['has_repair']
        }
    
    choice_data = choices[choice - 1]
    
    if choice_data[0] == 'node':
        # Travel to connected node
        target_node = choice_data[1]
        print(f"\nTraveling to {target_node['name']}...")
        
        # Consume fuel
        player_stats['fuel'] -= config.FUEL_CONSUMPTION_RATE
        print(f"Fuel consumed: {config.FUEL_CONSUMPTION_RATE}")
        
        # Random events during travel
        if random.random() < target_node['danger_level']:
            print("\nDanger encountered during travel!")
            damage = random.randint(5, 15)
            player_stats['ship_condition'] -= damage
            print(f"Ship condition decreased by {damage}")
        
        # Mark as discovered
        target_node['discovered'] = True
        
        print(f"\nArrived at {target_node['name']}")
        
        return {
            'current_region_id': current_region_id,
            'current_node_id': target_node['id'],
            'at_repair_location': target_node['has_repair']
        }
    
    elif choice_data[0] == 'region':
        # Jump to another region
        target_region = choice_data[1]
        fuel_cost = choice_data[2]
        
        if player_stats['fuel'] < fuel_cost:
            print("Insufficient fuel for region jump!")
            return {
                'current_region_id': current_region_id,
                'current_node_id': current_node_id,
                'at_repair_location': current_node['has_repair']
            }
        
        print(f"\nInitiating jump to {target_region['name']}...")
        player_stats['fuel'] -= fuel_cost
        print(f"Fuel consumed: {fuel_cost}")
        
        # Find entry node in target region (first discovered or random)
        entry_node = None
        for node in target_region['nodes']:
            if node['discovered']:
                entry_node = node
                break
        
        if not entry_node:
            # First visit to this region
            entry_node = random.choice(target_region['nodes'])
            entry_node['discovered'] = True
            print(f"\nDiscovered new region: {target_region['name']}!")
            # Bonus for discovering new region
            player_stats['wealth'] += 100
            print("Gained 100 wealth for discovering a new region!")
        
        print(f"Arrived at {entry_node['name']} in {target_region['name']}")
        
        # Add region to discovered list
        if target_region['id'] not in star_map.get('discovered_regions', []):
            star_map.setdefault('discovered_regions', []).append(target_region['id'])
        
        return {
            'current_region_id': target_region['id'],
            'current_node_id': entry_node['id'],
            'at_repair_location': entry_node['has_repair']
        }
    
    # Fallback
    return {
        'current_region_id': current_region_id,
        'current_node_id': current_node_id,
        'at_repair_location': current_node['has_repair']
    }
