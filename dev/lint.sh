#!/bin/bash
# Lint Python and JavaScript code

echo "🔍 Running Python linters..."
echo ""

# Check if in virtual environment
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "⚠️  Warning: Not in virtual environment. Activating venv..."
    source venv/bin/activate 2>/dev/null || {
        echo "❌ Failed to activate venv. Please run: source venv/bin/activate"
        exit 1
    }
fi

# Run flake8
echo "Running flake8..."
flake8 . --config=.flake8 --statistics

# Run black in check mode
echo ""
echo "Running black..."
black . --check --diff

# Run mypy
echo ""
echo "Running mypy..."
mypy . --config-file=pyproject.toml

# Check JavaScript if eslint is available
if command -v eslint &> /dev/null; then
    echo ""
    echo "🔍 Running JavaScript linters..."
    eslint static/js/
else
    echo ""
    echo "ℹ️  ESLint not found. Skipping JavaScript linting."
fi

echo ""
echo "✅ Linting complete!"
