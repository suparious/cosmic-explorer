# ui.py - Handles UI elements for Cosmic Explorer using blessed for terminal rendering

from blessed import Terminal
import time
from config import config  # Import config for fuel reference

term = Terminal()

def get_ship_ascii(ship_condition, current_event="Exploring", has_flight_pod=False):
    """Return ASCII art for the ship based on condition, current event, and flight pod ownership."""
    pod_icon = " [Pod]" if has_flight_pod else ""
    if ship_condition > 70:
        ship = f"""
       ____{pod_icon}
      /    \\
     /      \\
    /________\\
    |        |
    |________|
"""
    elif ship_condition > 30:
        ship = f"""
       ____{pod_icon}
      /    \\
     /  *   \\
    /___*____\\
    |        |
    |___*____|
"""
    else:
        ship = f"""
       ____{pod_icon}
      / *  \\
     /  *   \\
    /_*_*____\\
    |   *    |
    |_*_*____|
"""
    event_indicator = f"Status: {current_event}"
    return ship + event_indicator

def get_player_ascii(health, wealth):
    """Return ASCII art for the player based on health and wealth."""
    if health > 70:
        player = """
     O
    /|\\
    / \\
"""
    elif health > 30:
        player = """
     O
    /|*
    / \\
"""
    else:
        player = """
     O
    /|*
    /*\\
"""
    wealth_indicator = f"Credits: {wealth}"
    return player + wealth_indicator

def get_fuel_gauge(fuel):
    """Return a visual fuel gauge based on fuel level."""
    max_bar = 10
    fuel_percentage = fuel / config.STARTING_FUEL if fuel > 0 else 0
    filled = int(max_bar * fuel_percentage)
    return "Fuel: [" + "█" * filled + " " * (max_bar - filled) + "]"

def display_dashboard(player_stats, active_quest, turn_count, max_turns):
    # Clear the screen
    print(term.clear)
    
    # ANSI-like colors via blessed
    with term.location(0, 0):
        print(term.cyan_bold + "=== Cosmic Explorer Dashboard ===" + term.normal)
        print(term.green_bold + f"Health: {player_stats['health']}" + term.normal)
        print(term.yellow_bold + f"Wealth: {player_stats['wealth']}" + term.normal)
        print(term.blue_bold + f"Ship Condition: {player_stats['ship_condition']}/{player_stats['max_ship_condition']}" + term.normal)
        print(term.red_bold + get_fuel_gauge(player_stats['fuel']) + term.normal)
        print(term.green_bold + f"Food Supplies: {player_stats['food']}" + term.normal)
        if active_quest:
            print(term.magenta_bold + f"Active Quest: {active_quest['name']} - {active_quest['status']}" + term.normal)
        print(term.cyan_bold + f"Turn: {turn_count}/{max_turns}" + term.normal)
        print(term.cyan_bold + "================================" + term.normal)
    
    # Display ASCII art for ship and player avatars
    with term.location(40, 1):
        ship_event = "Exploring" if not active_quest else active_quest['name']
        print(term.blue + get_ship_ascii(player_stats['ship_condition'], ship_event, player_stats['has_flight_pod']) + term.normal)
    
    with term.location(60, 1):
        print(term.green + get_player_ascii(player_stats['health'], player_stats['wealth']) + term.normal)
    
    # Simple animation for dashboard update
    with term.location(0, 10):
        print(term.cyan + "Updating sensors..." + term.normal)
        for i in range(4):
            print(term.cyan + f"Scan progress: {i*25}%" + term.normal, end='')
            time.sleep(0.2)
            print(term.move_left * len(f"Scan progress: {i*25}%"), end='')
        print(term.cyan + "Scan complete!" + term.normal)

def display_event(event_text):
    with term.location(0, 12):
        print(term.white + event_text + term.normal)

def display_choices(choices):
    with term.location(0, 14):
        for idx, choice in enumerate(choices, 1):
            print(term.white + f"{idx}. {choice}" + term.normal)
        print(term.white + "Enter your choice: " + term.normal, end='')
