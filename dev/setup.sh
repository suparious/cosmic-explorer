#!/bin/bash
# Setup development environment

echo "🚀 Setting up Cosmic Explorer development environment..."
echo ""

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
REQUIRED_VERSION="3.8"

if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 8) else 1)" 2>/dev/null; then
    echo "❌ Python 3.8+ is required. Found: $PYTHON_VERSION"
    exit 1
fi

echo "✅ Python version: $PYTHON_VERSION"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo ""
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo ""
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo ""
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo ""
echo "Installing production dependencies..."
pip install -r requirements.txt

echo ""
echo "Installing development dependencies..."
pip install -r requirements-dev.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "Creating .env file from example..."
    cp .env.example .env
fi

# Create saves directory if it doesn't exist
if [ ! -d "saves" ]; then
    echo ""
    echo "Creating saves directory..."
    mkdir saves
fi

# Install pre-commit hooks
echo ""
echo "Installing pre-commit hooks..."
pre-commit install

# Make scripts executable
echo ""
echo "Making scripts executable..."
chmod +x dev/*.sh
chmod +x start_game.sh
chmod +x test_server.sh

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "To activate the environment in the future, run:"
echo "  source venv/bin/activate"
echo ""
echo "Available development commands:"
echo "  ./dev/lint.sh    - Run linters"
echo "  ./dev/format.sh  - Format code"
echo "  ./dev/test.sh    - Run tests"
echo "  ./start_game.sh  - Start the game"
