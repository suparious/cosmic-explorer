# Contributing to Cosmic Explorer

Thank you for your interest in contributing to Cosmic Explorer! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept feedback gracefully

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/cosmic-explorer.git
   cd cosmic-explorer
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/cosmic-explorer.git
   ```

## Development Setup

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # Development dependencies
   ```

3. **Copy environment configuration:**
   ```bash
   cp .env.example .env
   ```

4. **Run the game:**
   ```bash
   ./start_game.sh  # Or: python api/app.py
   ```

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/OWNER/cosmic-explorer/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - System information (OS, Python version, browser)

### Suggesting Features

1. Check if the feature has been suggested in [Issues](https://github.com/OWNER/cosmic-explorer/issues)
2. Create a new issue with the "enhancement" label
3. Describe the feature and why it would be useful
4. Include mockups or examples if applicable

### Code Contributions

1. **Find an issue to work on** or create one for your planned changes
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our coding standards
4. **Write or update tests** for your changes
5. **Test your changes** thoroughly
6. **Commit your changes** with clear, descriptive messages

## Coding Standards

### Python Code Style

- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/)
- Use 4 spaces for indentation
- Maximum line length: 100 characters
- Use type hints for function parameters and returns
- Write docstrings for all classes and functions

Example:
```python
def calculate_damage(
    attacker_power: int,
    defender_armor: int,
    critical_hit: bool = False
) -> int:
    """
    Calculate damage dealt in combat.
    
    Args:
        attacker_power: Base attack power
        defender_armor: Defense armor rating
        critical_hit: Whether this is a critical hit
        
    Returns:
        Final damage amount
    """
    base_damage = max(1, attacker_power - defender_armor)
    if critical_hit:
        base_damage *= 2
    return base_damage
```

### JavaScript Code Style

- Use ES6+ features
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable names
- Add JSDoc comments for functions
- Use 2 spaces for indentation

Example:
```javascript
/**
 * Render a particle effect at the given position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} type - Type of particle effect
 */
const renderParticle = (x, y, type) => {
  const particle = new Particle(x, y, type);
  particles.push(particle);
};
```

### CSS Code Style

- Use CSS variables for colors and common values
- Follow BEM naming convention for classes
- Keep selectors specific but not overly nested
- Group related properties

### Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Keep first line under 72 characters
- Reference issues and PRs (e.g., "Fix #123")
- Structure:
  ```
  Short summary of changes (max 72 chars)

  More detailed explanation if needed. Wrap at 72 chars.
  Explain the problem this commit solves.

  Fixes #123
  ```

## Testing

### Running Tests

```bash
# Run all tests
python -m pytest

# Run with coverage
python -m pytest --cov=.

# Run specific test file
python -m pytest tests/test_game.py

# Run tests in watch mode
python -m pytest-watch
```

### Writing Tests

- Write tests for new features
- Update tests when changing existing functionality
- Aim for at least 80% code coverage
- Test edge cases and error conditions

## Submitting Changes

1. **Update your feature branch:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request:**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Provide a clear title and description
   - Reference any related issues
   - Wait for review and address feedback

### Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated if needed
- [ ] Commit messages are clear
- [ ] Branch is up to date with main

## Development Tools

### Linting

```bash
# Python linting
flake8 .
black . --check

# JavaScript linting
eslint static/js/
```

### Formatting

```bash
# Format Python code
black .

# Format JavaScript
prettier --write "static/js/**/*.js"
```

## Project Structure

```
cosmic-explorer/
├── api/              # Flask backend
├── static/           # Frontend assets
│   ├── css/         # Stylesheets
│   ├── js/          # JavaScript files
│   └── sounds/      # Audio files
├── templates/        # HTML templates
├── tests/           # Test files
├── docs/            # Documentation
└── tools/           # Utility scripts
```

## Questions?

Feel free to:
- Open an issue for questions
- Join our Discord server (if available)
- Email the maintainers

Thank you for contributing to Cosmic Explorer! 🚀
