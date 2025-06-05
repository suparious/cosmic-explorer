# Innovative Game: Cosmic Explorer
# This is a text-based adventure game with unique mechanics and storytelling.

import random
import json
import os
from config import config  # Import game configuration
from events import offer_quest, random_event  # Import event-related functions
from navigation import standard_navigation  # Import navigation functions

# Player stats initialized from config
player_stats = {
    "health": config.STARTING_HEALTH,
    "wealth": config.STARTING_WEALTH,
    "ship_condition": config.STARTING_SHIP_CONDITION,
    "fuel": config.STARTING_FUEL
}

# Quest tracking
active_quest = None
turn_count = 0

def load_game():
    try:
        with open(config.SAVE_FILE_PATH, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "health": config.STARTING_HEALTH,
            "wealth": config.STARTING_WEALTH,
            "ship_condition": config.STARTING_SHIP_CONDITION,
            "fuel": config.STARTING_FUEL,
            "active_quest": None,
            "turn_count": 0
        }

def save_game(state):
    with open(config.SAVE_FILE_PATH, "w") as f:
        json.dump(state, f)
    print("Progress saved automatically.")

def display_stats():
    print(f"\nPlayer Stats - Health: {player_stats['health']}, Wealth: {player_stats['wealth']}, Ship Condition: {player_stats['ship_condition']}, Fuel: {player_stats['fuel']}")
    if active_quest:
        print(f"Active Quest: {active_quest['name']} - {active_quest['status']}")
    print(f"Turn: {turn_count}/{config.MAX_TURNS}")

def start_game():
    global player_stats, active_quest, turn_count
    print(f'Welcome to {config.GAME_NAME}! (Version: {config.GAME_VERSION})')
    print('Your journey through the stars begins now...')
    print('You are on board your spaceship, ready to explore the unknown.')
    # Load saved progress
    saved_state = load_game()
    player_stats.update({
        "health": saved_state["health"],
        "wealth": saved_state["wealth"],
        "ship_condition": saved_state["ship_condition"],
        "fuel": saved_state.get("fuel", config.STARTING_FUEL)
    })
    active_quest = saved_state["active_quest"]
    turn_count = saved_state["turn_count"]
    display_stats()
    game_loop()

def game_loop():
    global active_quest, turn_count
    while True:
        turn_count += 1
        if player_stats['health'] <= 0:
            print("Game Over: Your health has depleted. Your journey ends here.")
            break
        if player_stats['ship_condition'] <= 0:
            print("Game Over: Your ship is destroyed. You're stranded in space.")
            break
        if player_stats['fuel'] <= config.MINIMUM_FUEL_THRESHOLD:
            print("Game Over: You've run out of fuel. You're stranded in space.")
            break
        if player_stats['wealth'] >= config.VICTORY_WEALTH_THRESHOLD:
            print(f"Victory: You've amassed great wealth and can retire as a legendary explorer of {config.GAME_NAME}!")
            break
        if turn_count >= config.MAX_TURNS:
            print(f"Game Over: You've reached the maximum number of turns ({config.MAX_TURNS}). Your journey ends here.")
            break

        # Adjusted probabilities to increase event frequency for more engagement
        event_chance = random.random() * 100
        if event_chance < config.QUEST_OFFER_CHANCE + 10 and not active_quest:  # Increased chance for quests
            offer_quest(player_stats, active_quest)
            if active_quest:
                continue
        elif event_chance < config.RANDOM_EVENT_CHANCE + 20:  # Increased chance for random events
            random_event(player_stats)
        else:
            standard_navigation(player_stats)

        display_stats()
        # Automatically save progress after each action
        save_game({
            "health": player_stats['health'],
            "wealth": player_stats['wealth'],
            "ship_condition": player_stats['ship_condition'],
            "fuel": player_stats['fuel'],
            "active_quest": active_quest,
            "turn_count": turn_count
        })

if __name__ == '__main__':
    start_game()
