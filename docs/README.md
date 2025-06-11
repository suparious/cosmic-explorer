---
title: Cosmic Explorer Documentation
tags: [documentation, index, navigation]
created: 2025-06-10
updated: 2025-06-10
status: active
---

# 🚀 Cosmic Explorer Documentation

Welcome to the Cosmic Explorer documentation! This is your central hub for all technical documentation, guides, and references for the space exploration game.

## 📚 Documentation Structure

### 🏗️ [[Architecture]]
System design, technical decisions, and architectural patterns
- [[architecture/overview|System Overview]] - High-level architecture and design
- [[architecture/adrs/index|Architecture Decision Records]] - Key technical decisions
- [[architecture/diagrams/index|System Diagrams]] - Visual representations

### 📖 [[Guides]]
Step-by-step guides for developers and players
- [[guides/getting-started/index|Getting Started]] - Quick start and installation
- [[guides/development/index|Development Guide]] - Setting up the dev environment
- [[guides/deployment/index|Deployment Guide]] - Production deployment
- [[guides/troubleshooting/index|Troubleshooting]] - Common issues and solutions

### 🔧 [[Components]]
Technical documentation for system components
- [[components/backend/index|Backend Systems]] - Python game engine and API
- [[components/frontend/index|Frontend Architecture]] - JavaScript UI and rendering
- [[components/game-systems/index|Game Systems]] - Core gameplay mechanics

### 📋 [[References]]
API documentation and technical references
- [[references/api/index|API Reference]] - REST and WebSocket endpoints
- [[references/game-mechanics|Game Mechanics]] - Detailed gameplay systems
- [[references/glossary|Glossary]] - Terms and definitions
- [[references/roadmap|Development Roadmap]] - Future features and plans

### 🗄️ [[Archive]]
Historical documentation and status updates
- [[archive/index|Archive Index]] - Preserved original documentation

## 🚀 Quick Links

### For Developers
- [Set up development environment](guides/development/setup.md)
- [API endpoints reference](references/api/endpoints.md)
- [Frontend architecture guide](components/frontend/architecture.md)
- [Testing guide](guides/development/testing.md)

### For Players
- [Getting started guide](guides/getting-started/first-game.md)
- [Game mechanics overview](references/game-mechanics.md)
- [Troubleshooting common issues](guides/troubleshooting/common-issues.md)

### For Contributors
- [Contributing guidelines](../CONTRIBUTING.md)
- [Code style guide](guides/development/code-style.md)
- [Documentation standards](guides/development/documentation.md)

## 📊 Project Status

| Component | Status | Documentation |
|-----------|---------|---------------|
| Web UI | ✅ Complete | [[components/frontend/index]] |
| Game Engine | ✅ Active | [[components/backend/game-engine]] |
| Save System | ✅ Working | [[components/game-systems/save-system]] |
| Pod System | ✅ Complete | [[components/game-systems/pod-augmentations]] |
| Music Engine | ✅ Implemented | [[components/frontend/audio-system]] |
| Star Map | 🚧 Partial | [[components/frontend/star-map]] |
| Multiplayer | ❌ Planned | [[references/roadmap#multiplayer]] |

## 🔍 Search Documentation

Use Obsidian's search (Cmd/Ctrl + Shift + F) to find specific topics across all documentation.

### Common Searches
- `tag:#api` - All API-related documentation
- `tag:#frontend` - Frontend documentation
- `tag:#backend` - Backend documentation
- `tag:#guide` - All guides
- `tag:#troubleshooting` - Problem solutions

## 📝 Documentation Standards

All documentation follows these standards:
- **Obsidian-compatible** markdown with wikilinks
- **Frontmatter metadata** on every document
- **Cross-references** between related topics
- **Living documentation** that evolves with the code

See [[guides/development/documentation]] for contribution guidelines.

## 🛠️ Tools & Resources

- **Development Tools**: [[references/tools]]
- **Dependencies**: [[references/dependencies]]
- **Changelog**: [[../CHANGELOG.md]]
- **License**: [[../LICENSE]]

---

*Last updated: 2025-06-10*
