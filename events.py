# events.py - Handles random events and quest logic for Cosmic Explorer

import random

def offer_quest(player_stats, active_quest):
    quests = [
        {"name": "Rescue Mission", "reward": 300, "risk": "health", "status": "Locate stranded crew"},
        {"name": "Artifact Hunt", "reward": 500, "risk": "ship_condition", "status": "Find ancient relic"}
    ]
    quest = random.choice(quests)
    print(f"\nA new quest is available: {quest['name']}")
    print('1. Accept the quest.')
    print('2. Decline and continue exploring.')
    choice = input('Enter your choice (1 or 2): ')
    if choice == '1':
        active_quest = quest
        print(f"You’ve accepted the quest: {quest['name']}.")
    return active_quest

def random_event(player_stats):
    events = [
        ("Encounter alien traders", "wealth", 100, "You trade successfully! Wealth increased."),
        ("Hit by cosmic anomaly", "ship_condition", -20, "Your ship takes damage! Ship condition decreased."),
        ("Discover abandoned ship", "wealth", 150, "You salvage resources! Wealth increased."),
        ("Navigate through asteroid field", "fuel", -10, "Maneuvering consumes extra fuel! Fuel decreased."),
        ("Find a fuel depot", "fuel", 30, "You refuel your ship! Fuel increased.")  # New event for fuel replenishment
    ]
    event, stat, change, message = random.choice(events)
    print(f"\nEvent: {event}")
    player_stats[stat] += change
    print(message)
