.PHONY: help setup run test lint format clean install dev-install

# Default target
help:
	@echo "Cosmic Explorer - Available commands:"
	@echo ""
	@echo "  make setup       - Set up development environment"
	@echo "  make run         - Run the game"
	@echo "  make test        - Run tests with coverage"
	@echo "  make lint        - Run linters"
	@echo "  make format      - Format code"
	@echo "  make clean       - Clean up generated files"
	@echo "  make install     - Install production dependencies"
	@echo "  make dev-install - Install development dependencies"
	@echo ""

# Set up development environment
setup:
	@./dev/setup.sh

# Run the game
run:
	@./start_game.sh

# Run tests
test:
	@./dev/test.sh

# Run linters
lint:
	@./dev/lint.sh

# Format code
format:
	@./dev/format.sh

# Install production dependencies
install:
	pip install -r requirements.txt

# Install development dependencies  
dev-install:
	pip install -r requirements.txt
	pip install -r requirements-dev.txt

# Clean up generated files
clean:
	@echo "Cleaning up..."
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete
	@find . -type f -name "*.pyo" -delete
	@find . -type f -name "*.pyd" -delete
	@find . -type f -name ".coverage" -delete
	@find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	@rm -rf build/ dist/ 2>/dev/null || true
	@echo "✅ Cleanup complete"
