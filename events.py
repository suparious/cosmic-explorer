# events.py - Handles random events and quest logic for Cosmic Explorer

import random

def offer_quest(player_stats, active_quest):
    quests = [
        {"name": "Rescue Mission", "reward": 300, "risk": "health", "status": "Locate stranded crew", "reward_type": "wealth"},
        {"name": "Artifact Hunt", "reward": 500, "risk": "ship_condition", "status": "Find ancient relic", "reward_type": "wealth"},
        {"name": "Fuel Expedition", "reward": 50, "risk": "fuel", "status": "Secure fuel reserves", "reward_type": "fuel"},
        {"name": "Diplomatic Encounter", "reward": 200, "risk": "health", "status": "Negotiate with alien leaders", "reward_type": "wealth"}
    ]
    quest = random.choice(quests)
    print(f"\nA new quest is available: {quest['name']}")
    print(f"Objective: {quest['status']}")
    print(f"Reward: {quest['reward']} {quest['reward_type']}")
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
        ("Find a fuel depot", "fuel", 30, "You refuel your ship! Fuel increased."),
        ("Face pirate ambush", "health", -25, "Pirates attack! Health decreased."),
        ("Discover cosmic phenomenon", "wealth", 80, "You document a rare event! Wealth increased."),
        ("Receive distress call", "ship_condition", -15, "Helping out strains your ship! Ship condition decreased."),
        ("Find food supplies", "health", 20, "You discover food supplies! Health increased."),
        ("Scavenge fuel reserves", "fuel", 25, "You scavenge fuel reserves! Fuel increased.")
    ]
    event, stat, change, message = random.choice(events)
    print(f"\nEvent: {event}")
    player_stats[stat] += change
    print(message)