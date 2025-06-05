import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Game configuration defaults with the ability to override via environment variables
class GameConfig:
    # Game metadata
    GAME_NAME = os.getenv('GAME_NAME', 'Cosmic Explorer')
    GAME_VERSION = os.getenv('GAME_VERSION', '0.1.0')
    
    # Player starting stats
    STARTING_HEALTH = int(os.getenv('STARTING_HEALTH', 100))
    STARTING_WEALTH = int(os.getenv('STARTING_WEALTH', 500))
    STARTING_SHIP_CONDITION = int(os.getenv('STARTING_SHIP_CONDITION', 100))
    STARTING_FUEL = int(os.getenv('STARTING_FUEL', 100))
    STARTING_FOOD = int(os.getenv('STARTING_FOOD', 50))  # New stat for food supplies
    
    # Game victory and loss conditions
    VICTORY_WEALTH_THRESHOLD = int(os.getenv('VICTORY_WEALTH_THRESHOLD', 2000))
    MINIMUM_FUEL_THRESHOLD = int(os.getenv('MINIMUM_FUEL_THRESHOLD', 0))
    
    # Event probabilities (as percentages)
    QUEST_OFFER_CHANCE = float(os.getenv('QUEST_OFFER_CHANCE', 30))
    RANDOM_EVENT_CHANCE = float(os.getenv('RANDOM_EVENT_CHANCE', 60))
    FUEL_CONSUMPTION_RATE = int(os.getenv('FUEL_CONSUMPTION_RATE', 5))
    
    # Difficulty settings
    DIFFICULTY_LEVEL = os.getenv('DIFFICULTY_LEVEL', 'Medium')
    MAX_TURNS = int(os.getenv('MAX_TURNS', 50))
    
    # Save file location
    SAVE_FILE_PATH = os.getenv('SAVE_FILE_PATH', '/scratch-space/new_game_folder/save_game.json')
    
    # WebSocket and server settings for future UI integration
    WEBSOCKET_HOST = os.getenv('WEBSOCKET_HOST', 'localhost')
    WEBSOCKET_PORT = int(os.getenv('WEBSOCKET_PORT', 8765))
    DATA_SERVICE_URL = os.getenv('DATA_SERVICE_URL', 'http://localhost:8000/api')

# Access configuration for use in the game
config = GameConfig()
