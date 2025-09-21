# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-04

### Added
- Initial release
- Core history management with `HistoryManager`
- Diff-based storage engine with `DiffEngine`
- Debounced snapshot creation
- Undo/redo functionality
- Pause/resume recording
- Configurable history limits
- React hooks: `useFormHistory`,` useFieldHistory`
- React Context: `FormHistoryProvider` and `useFormHistoryContext`
- Keyboard shortcuts support via `useKeyboardShortcuts`
- Vanilla JavaScript API with `createFormHistory`
- DOM form binding with `bindFormHistory`
- Field exclusion support
- History metadata and timestamps
- Time travel with `jumpTo`
- TypeScript type definitions
- Comprehensive test suite
- Zero runtime dependencies
