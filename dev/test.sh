#!/bin/bash
# Run tests with coverage

echo "🧪 Running tests..."
echo ""

# Check if in virtual environment
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "⚠️  Warning: Not in virtual environment. Activating venv..."
    source venv/bin/activate 2>/dev/null || {
        echo "❌ Failed to activate venv. Please run: source venv/bin/activate"
        exit 1
    }
fi

# Install test dependencies if needed
if ! python -c "import pytest" 2>/dev/null; then
    echo "Installing test dependencies..."
    pip install -r requirements-dev.txt
fi

# Run tests with coverage
echo "Running pytest with coverage..."
python -m pytest tests/ \
    --cov=. \
    --cov-report=html \
    --cov-report=term-missing \
    -v

# Check if tests passed
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All tests passed!"
    echo "📊 Coverage report generated in htmlcov/index.html"
else
    echo ""
    echo "❌ Some tests failed!"
    exit 1
fi
