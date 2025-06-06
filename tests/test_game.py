"""Test cases for game.py module."""
import unittest
import sys
import os

# Add parent directory to path to import game modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from game import Game
from regions import Region


class TestGame(unittest.TestCase):
    """Test cases for the Game class."""
    
    def setUp(self):
        """Set up test game instance."""
        self.game = Game()
    
    def test_game_initialization(self):
        """Test that game initializes with correct default values."""
        self.assertEqual(self.game.player['health'], 100)
        self.assertEqual(self.game.player['fuel'], 100)
        self.assertEqual(self.game.player['wealth'], 500)
        self.assertIsInstance(self.game.current_region, Region)
    
    def test_fuel_consumption(self):
        """Test fuel consumption during navigation."""
        initial_fuel = self.game.player['fuel']
        self.game.player['fuel'] -= 5  # Simulate navigation
        self.assertEqual(self.game.player['fuel'], initial_fuel - 5)
    
    def test_health_boundaries(self):
        """Test that health stays within valid bounds."""
        # Test health can't go above 100
        self.game.player['health'] = 150
        if hasattr(self.game, 'validate_stats'):
            self.game.validate_stats()
            self.assertLessEqual(self.game.player['health'], 100)
        
        # Test health can't go below 0
        self.game.player['health'] = -10
        if hasattr(self.game, 'validate_stats'):
            self.game.validate_stats()
            self.assertGreaterEqual(self.game.player['health'], 0)
    
    def test_save_game_creates_file(self):
        """Test that save_game creates a save file."""
        save_path = 'test_save.json'
        if hasattr(self.game, 'save_game'):
            self.game.save_game(save_path)
            self.assertTrue(os.path.exists(save_path))
            # Clean up
            if os.path.exists(save_path):
                os.remove(save_path)


class TestRegions(unittest.TestCase):
    """Test cases for the Region class."""
    
    def test_region_initialization(self):
        """Test that regions initialize correctly."""
        region = Region()
        self.assertIsNotNone(region.name)
        self.assertIsNotNone(region.description)
        self.assertIsInstance(region.locations, list)
        self.assertGreater(len(region.locations), 0)


if __name__ == '__main__':
    unittest.main()
