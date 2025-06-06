"""Test cases for the Flask API."""
import unittest
import json
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import after path is set
from api.app import app, socketio


class TestAPI(unittest.TestCase):
    """Test cases for the Flask API endpoints."""
    
    def setUp(self):
        """Set up test client."""
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        self.socketio_client = socketio.test_client(self.app)
    
    def tearDown(self):
        """Clean up after tests."""
        self.socketio_client.disconnect()
    
    def test_index_route(self):
        """Test that index route returns the game page."""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Cosmic Explorer', response.data)
    
    def test_get_game_state(self):
        """Test getting game state via API."""
        response = self.client.get('/api/game/state')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('player', data)
        self.assertIn('current_region', data)
    
    def test_perform_action_navigate(self):
        """Test navigation action via API."""
        response = self.client.post('/api/game/action',
                                  json={'action': 'navigate', 'target': 0})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('player', data)
        self.assertIn('current_region', data)
    
    def test_perform_action_scan(self):
        """Test scan action via API."""
        response = self.client.post('/api/game/action',
                                  json={'action': 'scan'})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('event', data)
    
    def test_websocket_connection(self):
        """Test WebSocket connection."""
        received = self.socketio_client.get_received()
        # Should receive initial game state on connection
        self.assertGreater(len(received), 0)
        self.assertEqual(received[0]['name'], 'game_state')
    
    def test_websocket_action(self):
        """Test sending action via WebSocket."""
        self.socketio_client.emit('game_action', {
            'action': 'scan'
        })
        received = self.socketio_client.get_received()
        # Find the response to our action
        action_response = None
        for msg in received:
            if msg['name'] == 'game_update':
                action_response = msg
                break
        self.assertIsNotNone(action_response)
    
    def test_invalid_action(self):
        """Test handling of invalid action."""
        response = self.client.post('/api/game/action',
                                  json={'action': 'invalid_action'})
        # Should still return 200 but with an error in the response
        self.assertEqual(response.status_code, 200)


if __name__ == '__main__':
    unittest.main()
