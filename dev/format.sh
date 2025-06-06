#!/bin/bash
# Format Python and JavaScript code

echo "✨ Formatting code..."
echo ""

# Check if in virtual environment
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "⚠️  Warning: Not in virtual environment. Activating venv..."
    source venv/bin/activate 2>/dev/null || {
        echo "❌ Failed to activate venv. Please run: source venv/bin/activate"
        exit 1
    }
fi

# Format Python with black
echo "Formatting Python files with black..."
black . --line-length=100

# Sort imports with isort
echo ""
echo "Sorting imports with isort..."
isort . --profile black --line-length 100

# Format JavaScript if prettier is available
if command -v prettier &> /dev/null; then
    echo ""
    echo "Formatting JavaScript files with prettier..."
    prettier --write "static/js/**/*.js" "static/css/**/*.css"
else
    echo ""
    echo "ℹ️  Prettier not found. Skipping JavaScript formatting."
    echo "   Install with: npm install -g prettier"
fi

echo ""
echo "✅ Formatting complete!"
