#!/usr/bin/env python3
"""
Test script for Save/Load functionality in Cosmic Explorer
Tests the save/load endpoints and verifies data integrity
"""

import requests
import json
import time
import sys

BASE_URL = "http://localhost:5000"
SESSION_ID = "test-session"

def test_save_load_system():
    """Test the complete save/load system"""
    print("🧪 Testing Cosmic Explorer Save/Load System")
    print("=" * 50)
    
    # 1. Start a new game
    print("\n1. Starting new game...")
    response = requests.post(f"{BASE_URL}/api/game/new", 
                           json={"session_id": SESSION_ID, "force_new": True})
    if response.status_code != 200:
        print(f"❌ Failed to start new game: {response.text}")
        return False
    
    game_state = response.json()["game_state"]
    print(f"✅ New game started - Turn: {game_state['turn_count']}, Wealth: {game_state['player_stats']['wealth']}")
    
    # 2. Make some changes to the game state
    print("\n2. Making some game actions...")
    # Navigate
    response = requests.post(f"{BASE_URL}/api/game/action/{SESSION_ID}",
                           json={"action": "navigate"})
    if response.status_code == 200:
        print("✅ Navigation successful")
    
    # Scan
    response = requests.post(f"{BASE_URL}/api/game/action/{SESSION_ID}",
                           json={"action": "event"})
    if response.status_code == 200:
        print("✅ Scan action successful")
    
    # 3. Get current game state
    print("\n3. Getting current game state...")
    response = requests.get(f"{BASE_URL}/api/game/state/{SESSION_ID}")
    if response.status_code != 200:
        print(f"❌ Failed to get game state: {response.text}")
        return False
    
    current_state = response.json()
    print(f"✅ Current state - Turn: {current_state['turn_count']}, Wealth: {current_state['player_stats']['wealth']}")
    
    # 4. Test save to different slots
    print("\n4. Testing save functionality...")
    for slot in [1, 2]:
        response = requests.post(f"{BASE_URL}/api/saves/{slot}",
                               json={"session_id": SESSION_ID})
        if response.status_code == 200:
            save_data = response.json()
            print(f"✅ Saved to slot {slot}: {save_data['metadata']['location']}")
        else:
            print(f"❌ Failed to save to slot {slot}: {response.text}")
    
    # 5. List all saves
    print("\n5. Listing all saves...")
    response = requests.get(f"{BASE_URL}/api/saves")
    if response.status_code == 200:
        saves_data = response.json()
        print(f"✅ Found {len(saves_data['saves'])} saves:")
        for save in saves_data['saves']:
            print(f"   Slot {save['slot']}: Turn {save['metadata']['turn_count']}, "
                  f"Location: {save['metadata']['location']}")
    else:
        print(f"❌ Failed to list saves: {response.text}")
    
    # 6. Test loading from a save
    print("\n6. Testing load functionality...")
    # First, make more changes
    for _ in range(3):
        requests.post(f"{BASE_URL}/api/game/action/{SESSION_ID}",
                     json={"action": "navigate"})
    
    # Get state before loading
    response = requests.get(f"{BASE_URL}/api/game/state/{SESSION_ID}")
    state_before_load = response.json()
    print(f"   State before load - Turn: {state_before_load['turn_count']}")
    
    # Load from slot 1
    response = requests.post(f"{BASE_URL}/api/load/1",
                           json={"session_id": SESSION_ID})
    if response.status_code == 200:
        loaded_data = response.json()
        loaded_state = loaded_data['game_state']
        print(f"✅ Loaded from slot 1 - Turn: {loaded_state['turn_count']}")
        
        # Verify the loaded state matches what was saved
        if loaded_state['turn_count'] < state_before_load['turn_count']:
            print("✅ Load correctly restored earlier game state")
        else:
            print("❌ Load did not restore the correct state")
    else:
        print(f"❌ Failed to load from slot 1: {response.text}")
    
    # 7. Test save slot info
    print("\n7. Testing individual save slot info...")
    response = requests.get(f"{BASE_URL}/api/saves/1")
    if response.status_code == 200:
        slot_info = response.json()
        print(f"✅ Slot 1 info: {slot_info['metadata']['location']} at turn {slot_info['metadata']['turn_count']}")
    else:
        print(f"❌ Failed to get slot 1 info: {response.text}")
    
    # 8. Test delete save
    print("\n8. Testing delete save...")
    response = requests.delete(f"{BASE_URL}/api/saves/2")
    if response.status_code == 200:
        print("✅ Successfully deleted save in slot 2")
    else:
        print(f"❌ Failed to delete save: {response.text}")
    
    # Verify deletion
    response = requests.get(f"{BASE_URL}/api/saves/2")
    if response.status_code == 404:
        print("✅ Confirmed slot 2 is empty")
    
    print("\n" + "=" * 50)
    print("🎉 Save/Load system test complete!")
    return True

if __name__ == "__main__":
    try:
        # Check if server is running
        response = requests.get(BASE_URL)
        if response.status_code != 200:
            print("❌ Server is not running at http://localhost:5000")
            print("   Please start the server with: python api/app.py")
            sys.exit(1)
        
        # Run the tests
        test_save_load_system()
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server at http://localhost:5000")
        print("   Please start the server with: python api/app.py")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)
