# navigation.py - Handles navigation and exploration logic for Cosmic Explorer

from config import config

def standard_navigation(player_stats):
    print('\nYou chart a course through space.')
    print('1. Investigate a nearby planet.')
    print('2. Continue on your planned route.')
    choice = input('Enter your choice (1 or 2): ')
    if choice == '1':
        print('You approach the planet...')
        player_stats['ship_condition'] -= 5
        player_stats['fuel'] -= config.FUEL_CONSUMPTION_RATE
        print(f"Exploration takes a toll. Ship condition slightly decreased. Fuel consumed: {config.FUEL_CONSUMPTION_RATE}.")
    elif choice == '2':
        print('You proceed smoothly on your route.')
        player_stats['fuel'] -= config.FUEL_CONSUMPTION_RATE
        print(f"Fuel consumed during navigation: {config.FUEL_CONSUMPTION_RATE}.")
