#!/bin/bash
# Startup script for Cosmic Explorer Graphical Edition

echo "🚀 Starting Cosmic Explorer Graphical Edition..."
echo ""

# Check Python version
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
REQUIRED_VERSION="3.8"

if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 8) else 1)" 2>/dev/null; then
    echo "❌ Python $REQUIRED_VERSION or higher is required. You have Python $PYTHON_VERSION"
    exit 1
fi

echo "✅ Python $PYTHON_VERSION detected"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo ""
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import flask" 2>/dev/null; then
    echo ""
    echo "Installing dependencies..."
    pip install -r requirements.txt --quiet
else
    echo "Dependencies already installed"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "Creating .env file from example..."
    cp .env.example .env
fi

# Create saves directory if it doesn't exist
if [ ! -d "saves" ]; then
    mkdir -p saves
fi

# Start the game server
echo ""
echo "✨ Launching game server..."
echo "📍 Open your browser and navigate to: http://$(hostname):5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run the Flask app
python api/app.py
