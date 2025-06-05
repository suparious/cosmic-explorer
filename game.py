# Innovative Game: Cosmic Explorer
# This is a text-based adventure game with unique mechanics and storytelling.

import random
import json
import os
from config import config  # Import game configuration
from events import offer_quest, random_event  # Import event-related functions
from navigation import standard_navigation  # Import navigation functions
from ui import display_dashboard, display_event, display_choices  # Import UI functions

# Player stats initialized from config
player_stats = {
    "health": config.STARTING_HEALTH,
    "wealth": config.STARTING_WEALTH,
    "ship_condition": config.STARTING_SHIP_CONDITION,
    "fuel": config.STARTING_FUEL,
    "food": config.STARTING_FOOD
}

# Quest tracking
active_quest = None
turn_count = 0
milestones_reached = 0

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
            "food": config.STARTING_FOOD,
            "active_quest": None,
            "turn_count": 0
        }

def save_game(state):
    with open(config.SAVE_FILE_PATH, "w") as f:
        json.dump(state, f)
    print("Progress saved automatically.")

def reset_game():
    global player_stats, active_quest, turn_count
    player_stats = {
        "health": config.STARTING_HEALTH,
        "wealth": config.STARTING_WEALTH,
        "ship_condition": config.STARTING_SHIP_CONDITION,
        "fuel": config.STARTING_FUEL,
        "food": config.STARTING_FOOD
    }
    active_quest = None
    turn_count = 0
    new_state = {
        "health": player_stats['health'],
        "wealth": player_stats['wealth'],
        "ship_condition": player_stats['ship_condition'],
        "fuel": player_stats['fuel'],
        "food": player_stats['food'],
        "active_quest": active_quest,
        "turn_count": turn_count
    }
    save_game(new_state)
    print("Game reset. Starting a new adventure...")

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
        "fuel": saved_state.get("fuel", config.STARTING_FUEL),
        "food": saved_state.get("food", config.STARTING_FOOD)
    })
    active_quest = saved_state["active_quest"]
    turn_count = saved_state["turn_count"]
    display_dashboard(player_stats, active_quest, turn_count, config.MAX_TURNS)
    game_loop()

def game_loop():
    global active_quest, turn_count, milestones_reached
    while True:
        turn_count += 1
        if player_stats['health'] <= 0:
            display_event("Game Over: Your health has depleted. Your journey ends here.")
            if start_new_game_prompt():
                reset_game()
                display_dashboard(player_stats, active_quest, turn_count, config.MAX_TURNS)
                continue
            else:
                break
        if player_stats['ship_condition'] <= 0:
            display_event("Game Over: Your ship is destroyed. You're stranded in space.")
            if start_new_game_prompt():
                reset_game()
                display_dashboard(player_stats, active_quest, turn_count, config.MAX_TURNS)
                continue
            else:
                break
        if player_stats['fuel'] <= config.MINIMUM_FUEL_THRESHOLD:
            display_event("Game Over: You've run out of fuel. You're stranded in space.")
            if start_new_game_prompt():
                reset_game()
                display_dashboard(player_stats, active_quest, turn_count, config.MAX_TURNS)
                continue
            else:
                break
        if player_stats['wealth'] >= config.VICTORY_WEALTH_THRESHOLD:
            display_event(f"Victory: You've amassed great wealth and can retire as a legendary explorer of {config.GAME_NAME}!")
            if start_new_game_prompt():
                reset_game()
                display_dashboard(player_stats, active_quest, turn_count, config.MAX_TURNS)
                continue
            else:
                break
        if turn_count >= config.MAX_TURNS:
            display_event(f"Game Over: You've reached the maximum number of turns ({config.MAX_TURNS}). Your journey ends here.")
            if start_new_game_prompt():
                reset_game()
                display_dashboard(player_stats, active_quest, turn_count, config.MAX_TURNS)
                continue
            else:
                break

        # Adjusted event frequency for balanced gameplay
        event_chance = random.random() * 100
        if event_chance < config.QUEST_OFFER_CHANCE + 15 and not active_quest:  # Moderately increased chance for quests
            active_quest = offer_quest(player_stats, active_quest)
            if active_quest:
                continue
        elif event_chance < config.RANDOM_EVENT_CHANCE + 25:  # Moderately increased chance for random events
            random_event(player_stats)
        else:
            standard_navigation(player_stats)

        # Milestone feedback every 5 turns
        if turn_count % 5 == 0:
            milestones_reached += 1
            display_event(f"Milestone Reached: You've survived {turn_count} turns! Keep exploring the cosmos.")

        # Option to consume food for health recovery if health is low and food is available
        if player_stats['health'] < 50 and player_stats['food'] > 0:
            display_event("Your health is low. Would you like to consume food to recover?")
            display_choices(["Yes, consume 10 food to recover 20 health.", "No, conserve food supplies."])
            choice = input()
            if choice == '1' and player_stats['food'] >= 10:
                player_stats['food'] -= 10
                player_stats['health'] = min(player_stats['health'] + 20, config.STARTING_HEALTH)
                display_event("You consume food supplies. Health increased by 20!")
            else:
                display_event("You decide to conserve food supplies.")

        display_dashboard(player_stats, active_quest, turn_count, config.MAX_TURNS)
        # Automatically save progress after each action
        save_game({
            "health": player_stats['health'],
            "wealth": player_stats['wealth'],
            "ship_condition": player_stats['ship_condition'],
            "fuel": player_stats['fuel'],
            "food": player_stats['food'],
            "active_quest": active_quest,
            "turn_count": turn_count
        })

def start_new_game_prompt():
    display_choices(["Yes, start a new adventure.", "No, exit the game."])
    choice = input()
    return choice == '1'

if __name__ == '__main__':
    start_game()
