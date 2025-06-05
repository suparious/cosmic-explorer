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
    "max_ship_condition": config.STARTING_SHIP_CONDITION,  # Track maximum ship condition
    "fuel": config.STARTING_FUEL,
    "food": config.STARTING_FOOD,
    "has_flight_pod": False  # Track flight pod ownership
}

# Quest tracking
active_quest = None
turn_count = 0
milestones_reached = 0
at_repair_location = False  # Track if player is at a location where repairs are possible

def load_game():
    try:
        with open(config.SAVE_FILE_PATH, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "health": config.STARTING_HEALTH,
            "wealth": config.STARTING_WEALTH,
            "ship_condition": config.STARTING_SHIP_CONDITION,
            "max_ship_condition": config.STARTING_SHIP_CONDITION,
            "fuel": config.STARTING_FUEL,
            "food": config.STARTING_FOOD,
            "has_flight_pod": False,
            "active_quest": None,
            "turn_count": 0,
            "at_repair_location": False
        }

def save_game(state):
    with open(config.SAVE_FILE_PATH, "w") as f:
        json.dump(state, f)
    print("Progress saved automatically.")

def reset_game():
    global player_stats, active_quest, turn_count, at_repair_location
    player_stats = {
        "health": config.STARTING_HEALTH,
        "wealth": config.STARTING_WEALTH,
        "ship_condition": config.STARTING_SHIP_CONDITION,
        "max_ship_condition": config.STARTING_SHIP_CONDITION,
        "fuel": config.STARTING_FUEL,
        "food": config.STARTING_FOOD,
        "has_flight_pod": False
    }
    active_quest = None
    turn_count = 0
    at_repair_location = False
    new_state = {
        "health": player_stats['health'],
        "wealth": player_stats['wealth'],
        "ship_condition": player_stats['ship_condition'],
        "max_ship_condition": player_stats['max_ship_condition'],
        "fuel": player_stats['fuel'],
        "food": player_stats['food'],
        "has_flight_pod": player_stats['has_flight_pod'],
        "active_quest": active_quest,
        "turn_count": turn_count,
        "at_repair_location": at_repair_location
    }
    save_game(new_state)
    print("Game reset. Starting a new adventure...")

def start_game():
    global player_stats, active_quest, turn_count, at_repair_location
    print(f'Welcome to {config.GAME_NAME}! (Version: {config.GAME_VERSION})')
    print('Your journey through the stars begins now...')
    print('You are on board your spaceship, ready to explore the unknown.')
    # Load saved progress
    saved_state = load_game()
    player_stats.update({
        "health": saved_state["health"],
        "wealth": saved_state["wealth"],
        "ship_condition": saved_state["ship_condition"],
        "max_ship_condition": saved_state.get("max_ship_condition", config.STARTING_SHIP_CONDITION),
        "fuel": saved_state.get("fuel", config.STARTING_FUEL),
        "food": saved_state.get("food", config.STARTING_FOOD),
        "has_flight_pod": saved_state.get("has_flight_pod", False)
    })
    active_quest = saved_state["active_quest"]
    turn_count = saved_state["turn_count"]
    at_repair_location = saved_state.get("at_repair_location", False)
    display_dashboard(player_stats, active_quest, turn_count, config.MAX_TURNS)
    game_loop()

def upgrade_ship():
    global player_stats
    cost = 300
    if player_stats['wealth'] >= cost:
        player_stats['wealth'] -= cost
        player_stats['max_ship_condition'] += 20
        player_stats['ship_condition'] = player_stats['max_ship_condition']
        display_event(f"Ship upgraded! Spent {cost} wealth. Maximum ship condition increased by 20 to {player_stats['max_ship_condition']} and fully restored.")
        display_dashboard(player_stats, active_quest, turn_count, config.MAX_TURNS)
    else:
        display_event("Insufficient wealth to upgrade ship. You need at least 300 wealth.")

def repair_ship():
    global player_stats
    cost = 100
    if not at_repair_location:
        display_event("You need to be at a planet or outpost to repair your ship.")
        return
    if player_stats['wealth'] >= cost:
        player_stats['wealth'] -= cost
        player_stats['ship_condition'] = player_stats['max_ship_condition']
        display_event(f"Ship repaired at outpost! Spent {cost} wealth. Ship condition restored to {player_stats['ship_condition']}.")
        display_dashboard(player_stats, active_quest, turn_count, config.MAX_TURNS)
    else:
        display_event("Insufficient wealth to repair ship. You need at least 100 wealth.")

def buy_flight_pod():
    global player_stats
    cost = 500
    if player_stats['wealth'] >= cost:
        player_stats['wealth'] -= cost
        player_stats['has_flight_pod'] = True
        display_event(f"Flight pod purchased for {cost} wealth! You can now use it if your ship is destroyed to reach safety.")
        display_dashboard(player_stats, active_quest, turn_count, config.MAX_TURNS)
    else:
        display_event("Insufficient wealth to buy a flight pod. You need at least 500 wealth.")

def use_flight_pod():
    global player_stats
    display_event("Your ship is destroyed, but you have a flight pod. What would you like to do?")
    display_choices(["Go to nearest planet or outpost (risky journey)", "Do nothing (wait for rescue)"])
    choice = input()
    if choice == '1':
        # Add risk to flight pod journey
        risk_chance = random.random()
        if risk_chance < 0.2:  # 20% chance of failure
            player_stats['health'] -= 20
            display_event("The journey in the flight pod was harsh! Cosmic radiation and tight quarters take a toll. Health decreased by 20.")
            if player_stats['health'] <= 0:
                display_event("Game Over: The flight pod journey was too much. Your health has depleted.")
                return False
        else:
            display_event("You safely reach the nearest outpost in your flight pod. A chance for a new beginning!")
        
        # Offer to buy a new ship if journey successful or health still above 0
        if player_stats['health'] > 0:
            display_event("At the outpost, you can purchase a new ship. What would you like to do?")
            display_choices(["Purchase a new ship (400 wealth, restores ship condition)", "Do nothing (wait for other opportunities)"])
            ship_choice = input()
            if ship_choice == '1' and player_stats['wealth'] >= 400:
                player_stats['wealth'] -= 400
                player_stats['ship_condition'] = player_stats['max_ship_condition']
                display_event("New ship purchased for 400 wealth! Your ship condition is fully restored. Ready to explore again!")
                display_dashboard(player_stats, active_quest, turn_count, config.MAX_TURNS)
                return True
            else:
                if player_stats['wealth'] < 400:
                    display_event("Insufficient wealth to buy a new ship. You need at least 400 wealth.")
                else:
                    display_event("You decide to wait for other opportunities at the outpost.")
                return False
    else:
        display_event("You decide to wait for rescue in the wreckage. Unfortunately, no help arrives in time.")
        return False
    return False

def game_loop():
    global active_quest, turn_count, milestones_reached, at_repair_location
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
            if player_stats['has_flight_pod']:
                if use_flight_pod():
                    continue  # Continue game if new ship is purchased
                else:
                    if player_stats['health'] <= 0:
                        if start_new_game_prompt():
                            reset_game()
                            display_dashboard(player_stats, active_quest, turn_count, config.MAX_TURNS)
                            continue
                    else:
                        display_event("Game Over: No further options available after using the flight pod.")
                    break
            else:
                if start_new_game_prompt():
                    reset_game()
                    display_dashboard(player_stats, active_quest, turn_count, config.MAX_TURNS)
                    continue
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
            at_repair_location = standard_navigation(player_stats)  # Update repair location status based on navigation

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
                display_dashboard(player_stats, active_quest, turn_count, config.MAX_TURNS)
            else:
                display_event("You decide to conserve food supplies.")

        # Option to upgrade ship, repair ship (if at location), or buy flight pod if wealth is sufficient and conditions are met
        if player_stats['wealth'] >= 100:
            display_event("You have enough wealth to spend. What would you like to do?")
            choices = ["Upgrade ship (300 wealth, +20 max ship condition)"]
            if at_repair_location:
                choices.append("Repair ship (100 wealth, restores to max condition)")
            if not player_stats['has_flight_pod']:
                choices.append("Buy flight pod (500 wealth)")
            choices.append("Do nothing")
            display_choices(choices)
            choice = input()
            if choice == '1' and player_stats['wealth'] >= 300:
                upgrade_ship()
                continue  # Skip further dashboard display since upgrade_ship already does it
            elif choice == '2' and at_repair_location and player_stats['wealth'] >= 100:
                repair_ship()
                continue  # Skip further dashboard display since repair_ship already does it
            elif choice == '2' and not at_repair_location and not player_stats['has_flight_pod'] and player_stats['wealth'] >= 500:
                buy_flight_pod()
                continue  # Skip further dashboard display since buy_flight_pod already does it
            elif choice == '3' and not player_stats['has_flight_pod'] and player_stats['wealth'] >= 500:
                buy_flight_pod()
                continue  # Skip further dashboard display since buy_flight_pod already does it
            else:
                display_event("You decide to do nothing with your wealth for now.")

        display_dashboard(player_stats, active_quest, turn_count, config.MAX_TURNS)
        # Automatically save progress after each action
        save_game({
            "health": player_stats['health'],
            "wealth": player_stats['wealth'],
            "ship_condition": player_stats['ship_condition'],
            "max_ship_condition": player_stats['max_ship_condition'],
            "fuel": player_stats['fuel'],
            "food": player_stats['food'],
            "has_flight_pod": player_stats['has_flight_pod'],
            "active_quest": active_quest,
            "turn_count": turn_count,
            "at_repair_location": at_repair_location
        })

def start_new_game_prompt():
    display_choices(["Yes, start a new adventure.", "No, exit the game."])
    choice = input()
    return choice == '1'

if __name__ == '__main__':
    start_game()
