# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Integration tests for engine components
- Automated CI/CD pipeline with GitHub Actions
- Performance monitoring and metrics

### Changed
- Improved error messages for better debugging
- Updated dependencies to latest versions

### Fixed
- Memory leak in long-running agent sessions
- Race condition in concurrent workflow execution

## [1.4.0] - 2026-03-05

### Added
- **Phase 4: Persistence & Analytics**
  - IndexedDB database for real data persistence
  - Web Worker sandbox for isolated code execution
  - File System Access API integration (Chrome/Edge)
  - Analytics engine with historical metrics
  - Platform dashboard for system health monitoring
  - Analytics dashboard with cost trends and performance insights
  - Export/Import functionality for data backup and migration

### Changed
- State management now persists across page reloads
- Improved error handling in all engine components
- Enhanced security audit and .gitignore configuration

### Fixed
- State loss on page refresh
- Missing error boundaries in dashboard components

## [1.3.0] - 2026-03-04

### Added
- **Phase 3: Delivery Pipeline**
  - JavaScript sandbox with real code execution
  - CI/CD pipeline (Build → Test → Lint → Security → Review)
  - Pull Request generator with complete metadata
  - Traceability engine (REQ → US → TASK → commit → test → PR)
  - Disagreement resolver with consensus and voting
  - Delivery engine for end-to-end orchestration
  - Delivery dashboard for User Story → PR workflow

### Changed
- Unified execution interface across all phases
- Improved code validation and security scanning
- Enhanced traceability with full chain tracking

### Fixed
- Code execution timeout handling
- Traceability link generation

## [1.2.0] - 2026-03-03

### Added
- **Phase 2: Execution Layer**
  - Virtual file system with CRUD operations
  - Git manager with worktree support
  - Test runner with build and lint capabilities
  - Execution engine with unified interface
  - Execution dashboard for file browsing and editing
  - Commit workflow integration

### Changed
- Modularized execution components
- Improved file system abstraction
- Enhanced test execution reporting

### Fixed
- File path resolution issues
- Test result parsing errors

## [1.1.0] - 2026-03-02

### Added
- **Phase 1: Engine & UI**
  - Command center dashboard
  - Agent harness with orchestration
  - Model router with intelligent selection
  - Budget engine with multi-level tracking
  - Context engine with provenance tracking
  - Agent registry with 8 specialized roles
  - Workflow engine with predefined pipelines
  - Groq provider integration (with simulation fallback)
  - Project management interface
  - Work request intake system
  - Review and approval framework

### Changed
- Initial architecture implementation
- Core engine components

### Fixed
- Initial bugs and issues

## [1.0.0] - 2026-03-01

### Added
- Initial project setup
- Architecture documentation
- Master prompt and vision document
- Technology stack selection
- Repository structure

---

## Version History

### Versioning Scheme

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

### Release Process

1. Development happens on `main` branch
2. Features are developed in feature branches
3. Pull requests require review and approval
4. Releases are tagged with version numbers
5. Changelog is updated with each release

### Migration Guide

#### 1.3.0 → 1.4.0

**Breaking Changes:** None

**New Features:**
- Enable IndexedDB persistence (automatic)
- Configure analytics tracking (optional)

**Migration Steps:**
```bash
npm install
npm run build
```

No code changes required. State will be automatically persisted.

#### 1.2.0 → 1.3.0

**Breaking Changes:** None

**New Features:**
- Delivery pipeline available
- Traceability tracking enabled

**Migration Steps:**
```bash
npm install
npm run build
```

No code changes required.

#### 1.1.0 → 1.2.0

**Breaking Changes:** None

**New Features:**
- Execution layer available
- File system operations enabled

**Migration Steps:**
```bash
npm install
npm run build
```

No code changes required.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
