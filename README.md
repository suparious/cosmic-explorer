# Cosmic Explorer

A sci-fi adventure game set in the vastness of space, where you explore the cosmos, manage resources, and make critical decisions to survive and thrive as a legendary explorer.

## How to Play

1. **Setup**: Ensure you have Python 3.11 installed (as specified in `.python-version`). Create a virtual environment and install dependencies from `requirements.txt`:
   ```
   pyenv install 3.11
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. **Run the Game**: Start the game by running `game.py`:
   ```
   python game.py
   ```
3. **Gameplay**: Make choices through numbered options to navigate, explore planets, undertake quests, and manage resources. Your goal is to amass wealth (reach 2000 credits for victory) while surviving challenges like ship damage, fuel depletion, and health loss.
4. **Controls**: Input numbers (e.g., `1`, `2`) to select options presented during gameplay.

## User Interface (UI) Elements

- **Dashboard**: Displays your current stats at the top of the terminal:
  - **Health**: Your physical condition (green).
  - **Wealth**: Credits for purchases and upgrades (yellow).
  - **Ship Condition**: Current/max durability of your ship (blue).
  - **Fuel**: Remaining fuel with a visual gauge (red).
  - **Food Supplies**: Resources to recover health (green).
  - **Active Quest**: Current mission if accepted (magenta).
  - **Turn**: Current turn out of maximum allowed (cyan).
- **ASCII Art**:
  - **Ship Avatar**: Visual representation of your ship’s condition (right side, blue). Shows damage with `*` symbols and a "[Pod]" label if you own a flight pod.
  - **Player Avatar**: Represents your health (right side, green), with `*` for injuries, and shows wealth as credits.
- **Event Text**: Narrative updates and choices appear below the dashboard (white text).

## Current Features

- **Core Gameplay Loop**: Navigate space, encounter random events, accept quests, and make choices that impact your stats.
- **Resource Management**: Track health, wealth, ship condition, fuel, and food supplies. Use food to recover health when low.
- **Wealth System**: Earn wealth through events and quests. Spend it on:
  - **Ship Upgrades** (300 wealth): Increase maximum ship condition permanently.
  - **Ship Repairs** (100 wealth): Restore ship condition to maximum, available only at planets/outposts.
  - **Flight Pod** (500 wealth): A one-time purchase for a lifeline if your ship is destroyed.
- **Flight Pod Mechanic**: If your ship is destroyed, use the pod to attempt a risky journey to an outpost (20% chance of health loss). At the outpost, buy a new ship (400 wealth) to continue.
- **Visual UI**: Terminal-based UI with colors, animations, and ASCII art for immersion using the `blessed` library.
- **Save/Load System**: Progress is automatically saved after each action to `save_game.json` and loaded on startup.
- **New Game Option**: Restart with fresh stats after game over or victory.

## What We Need to Do Next

- **Enhanced Quest System**: Add multi-stage quests with deeper narratives and varied rewards.
- **Flight Pod Expansion**: Implement proactive use of the flight pod for travel to outposts even when the ship isn’t destroyed, adding strategic exploration options.
- **Ship Variety**: Introduce different ship types with unique stats or abilities when purchasing a new ship at outposts.
- **Docker Compose Environment**: Set up a development and deployment environment with three components:
  - **Game Engine**: The current text-based game logic.
  - **Data Service(s)**: Backend for storing game state, leaderboards, or shared data.
  - **UI**: A graphical or web-based interface using WebSocket communication for real-time updates.
- **Balancing**: Fine-tune event frequencies, costs, and resource depletion rates for optimal difficulty.
- **Additional Visuals**: Expand ASCII art or UI elements for events, planets, and outposts to enhance immersion.

## Contributing

This game is under active development. Feedback and ideas are welcome! Please test the game, report bugs, or suggest features by contacting the developer.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
