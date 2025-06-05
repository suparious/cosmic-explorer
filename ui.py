# ui.py - Handles UI elements for Cosmic Explorer using blessed for terminal rendering

from blessed import Terminal
import time

term = Terminal()

def display_dashboard(player_stats, active_quest, turn_count, max_turns):
    # Clear the screen
    print(term.clear)
    
    # ANSI-like colors via blessed
    with term.location(0, 0):
        print(term.cyan_bold + "=== Cosmic Explorer Dashboard ===" + term.normal)
        print(term.green_bold + f"Health: {player_stats['health']}" + term.normal)
        print(term.yellow_bold + f"Wealth: {player_stats['wealth']}" + term.normal)
        print(term.blue_bold + f"Ship Condition: {player_stats['ship_condition']}" + term.normal)
        print(term.red_bold + f"Fuel: {player_stats['fuel']}" + term.normal)
        if active_quest:
            print(term.magenta_bold + f"Active Quest: {active_quest['name']} - {active_quest['status']}" + term.normal)
        print(term.cyan_bold + f"Turn: {turn_count}/{max_turns}" + term.normal)
        print(term.cyan_bold + "================================" + term.normal)
        
        # ASCII Art for Player and Ship with dynamic indicators
        print(term.green_bold + "Player Avatar (Health & Wealth):" + term.normal)
        player_health_bar = "█" * (player_stats['health'] // 10) + "-" * (10 - player_stats['health'] // 10)
        player_wealth_indicator = "$" * (player_stats['wealth'] // 100) if player_stats['wealth'] > 0 else "-"
        print(f"[ {player_health_bar} ] Wealth: {player_wealth_indicator}")
        print("   _____  ")
        print("  /     \\ ")
        print(" /_______\\")
        print(" |  (•)  |")
        print("  \     / ")
        print("   \___/  ")
        
        print(term.blue_bold + "Ship Avatar (Condition & Event):" + term.normal)
        ship_condition_bar = "█" * (player_stats['ship_condition'] // 10) + "-" * (10 - player_stats['ship_condition'] // 10)
        ship_event = active_quest['name'] if active_quest else "Exploring"
        print(f"[ {ship_condition_bar} ] Event: {ship_event}")
        print("      _______ ")
        print("     /       \\____ ")
        print("    /         \   \\ ")
        print("   /___________\/_/ ")
        print("   |  [===]  | ")
        print("   |_________| ")
        
        print(term.red_bold + "Fuel Gauge:" + term.normal)
        fuel_bar = "█" * (player_stats['fuel'] // 10) + "-" * (10 - player_stats['fuel'] // 10)
        print(f"[ {fuel_bar} ]")
    
    # Simple animation for dashboard update
    with term.location(0, 25):
        print(term.cyan + "Updating sensors..." + term.normal)
        for i in range(4):
            print(term.cyan + f"Scan progress: {i*25}%" + term.normal, end='')
            time.sleep(0.2)
            print(term.move_left * len(f"Scan progress: {i*25}%"), end='')
        print(term.cyan + "Scan complete!" + term.normal)

def display_event(event_text):
    with term.location(0, 27):
        print(term.white + event_text + term.normal)

def display_choices(choices):
    with term.location(0, 29):
        for idx, choice in enumerate(choices, 1):
            print(term.white + f"{idx}. {choice}" + term.normal)
        print(term.white + "Enter your choice: " + term.normal, end='')