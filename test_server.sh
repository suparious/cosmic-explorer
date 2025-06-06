#!/bin/bash
# Quick test script to check if the server runs without errors

echo "🧪 Testing Cosmic Explorer startup..."
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# Check if in correct directory
if [ ! -f "api/app.py" ]; then
    echo "❌ Not in cosmic-explorer directory"
    exit 1
fi

# Activate venv if exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Try to start the server with a timeout
echo "🚀 Starting server (will auto-stop after 5 seconds)..."
timeout 5 python api/app.py &> server_test.log

# Check if server started successfully
if grep -q "wsgi starting up" server_test.log; then
    echo "✅ Server starts successfully!"
    echo ""
    echo "📝 Server log:"
    cat server_test.log
else
    echo "❌ Server failed to start"
    echo ""
    echo "📝 Error log:"
    cat server_test.log
fi

# Cleanup
rm -f server_test.log

echo ""
echo "Test complete. Run './start_game.sh' to play!"
