#!/bin/bash
# Startup script for Cosmic Explorer Graphical Edition

echo "🚀 Starting Cosmic Explorer Graphical Edition..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install/update requirements
echo "Installing dependencies..."
pip install -r requirements.txt --quiet

# Start the game server
echo ""
echo "✨ Launching game server..."
echo "📍 Open your browser and navigate to: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run the Flask app
python api/app.py
