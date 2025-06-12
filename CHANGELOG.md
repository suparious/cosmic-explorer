# Changelog

All notable changes to Cosmic Explorer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Visual Event System - enemies, merchants, and encounters are now visible!
  - Enemy ship rendering with unique designs (pirates, aliens, rogue AI)
  - Real-time combat visuals with projectiles and explosions
  - Damage numbers and health bars
  - Merchant ships that dock at trading posts
  - Visual indicators for events (warnings, trade, salvage)
  - Enemy AI with movement and attack patterns
- Comprehensive development documentation and tooling
- Test suite with pytest
- Modern Python packaging with pyproject.toml
- Development scripts for linting, formatting, and testing
- Contributing guidelines
- EditorConfig for consistent code style
- Improved .gitignore file
- Modal debug helper tool for troubleshooting UI issues
- Emergency modal recovery commands

### Changed
- Renamed .env-example to .env.example (standard naming)
- Reorganized documentation into proper folders
- Updated README.md with clearer structure
- Enhanced modal validation to prevent empty choice modals
- Improved game initialization flow with better error handling

### Fixed
- Critical bug: Choice modal appearing with no choices on new game start
- Modal close button not functioning properly
- Modal close button position (now correctly positioned top-right)
- Project structure improvements
- Better separation of concerns
- Socket event validation to prevent invalid modal triggers

## [0.1.0] - 2024-01-15

### Added
- Initial release of Cosmic Explorer Graphical Edition
- Web-based interface with Canvas rendering
- Real-time WebSocket communication
- Visual effects and particle systems
- Sound effects and music system
- Pod augmentation system
- Food consumption mechanics
- Save/load functionality
- Multiple regions and locations
- Quest system
- Trading system
- Combat mechanics
- Inventory management

### Changed
- Transformed from ASCII terminal game to web-based graphical game
- Enhanced UI with glassmorphism design
- Added smooth animations and transitions

### Deprecated
- Terminal UI (moved to legacy status)

## [0.0.1] - 2024-01-01

### Added
- Initial ASCII terminal version
- Basic game mechanics
- Text-based interface
- Simple navigation system

[Unreleased]: https://github.com/username/cosmic-explorer/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/username/cosmic-explorer/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/username/cosmic-explorer/releases/tag/v0.0.1
