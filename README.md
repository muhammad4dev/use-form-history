# use-form-history

> Lightweight undo/redo state manager for forms with intelligent snapshot management

[![npm version](https://img.shields.io/npm/v/use-form-history.svg)](https://www.npmjs.com/package/use-form-history)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/muhammad4dev/use-form-history/actions/workflows/ci.yml/badge.svg)](https://github.com/muhammad4dev/use-form-history/actions/workflows/ci.yml)

## The Problem

Adding "Undo" (Ctrl+Z) functionality to a complex React/Vue form is surprisingly hard. Libraries like Redux-Undo exist, but they are heavy and assume you are using Redux for everything. Most developers just don't implement Undo for standard forms, leading to frustrated users who accidentally delete content and can't get it back.

## The Solution

**use-form-history** is a framework-agnostic (with React-hook integration) library specifically designed for tracking changes in form inputs and contenteditable areas, independent of a global store.

### Key Features

✨ **Debounced snapshots** - Don't save every keystroke, save "bursts" of typing  
💾 **Diff-based storage** - Store changes, not the whole state (memory efficient)  
⏸️ **Pause/resume recording** - Don't record while dragging sliders  
📏 **Configurable history limits** - Control memory usage  
⚡ **Zero dependencies** - Lightweight and fast  
🔧 **Framework-agnostic core** - Works with React, Vue, Svelte, or vanilla JS  
⌨️ **Keyboard shortcuts** - Built-in Ctrl+Z/Ctrl+Y support  
🎯 **TypeScript first** - Full type safety

## Installation

```bash
# npm
npm install use-form-history

# pnpm
pnpm add use-form-history

# yarn
yarn add use-form-history
```

## Quick Start

### React Hook

```tsx
import { useFormHistory, useKeyboardShortcuts } from 'use-form-history/react';

function MyForm() {
  const { state, setState, undo, redo, canUndo, canRedo } = useFormHistory({
    name: '',
    email: '',
    bio: '',
  });

  // Enable Ctrl+Z / Ctrl+Y
  useKeyboardShortcuts(undo, redo);

  return (
    <div>
      <input
        value={state.name}
        onChange={(e) => setState({ ...state, name: e.target.value })}
        placeholder="Name"
      />
      <input
        value={state.email}
        onChange={(e) => setState({ ...state, email: e.target.value })}
        placeholder="Email"
      />
      <textarea
        value={state.bio}
        onChange={(e) => setState({ ...state, bio: e.target.value })}
        placeholder="Bio"
      />
      
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
    </div>
  );
}
```

### Vanilla JavaScript

```js
import { createFormHistory, bindFormHistory } from 'use-form-history/vanilla';

const history = createFormHistory({
  name: '',
  email: '',
}, {
  maxHistory: 50,
  debounceMs: 500,
});

// Option 1: Manual integration
document.getElementById('name').addEventListener('input', (e) => {
  history.update(prev => ({ ...prev, name: e.target.value }));
});

history.subscribe((state) => {
  document.getElementById('name').value = state.name;
});

// Option 2: Auto-bind to form
const form = document.querySelector('form');
const unbind = bindFormHistory(history, form);

// Undo/Redo
document.getElementById('undo').addEventListener('click', () => {
  history.undo();
});
```

## API Reference

### React Hooks

#### `useFormHistory<T>(initialState, options?)`

Main hook for form-level history.

```tsx
const {
  state,           // Current form state
  setState,        // Update state (creates debounced snapshot)
  snapshot,        // Create immediate snapshot (no debounce)
  undo,            // Undo to previous state
  redo,            // Redo to next state
  canUndo,         // Boolean: can undo?
  canRedo,         // Boolean: can redo?
  pause,           // Pause recording
  resume,          // Resume recording
  clear,           // Clear all history
  jumpTo,          // Jump to specific position
  history,         // History metadata
} = useFormHistory(initialState, {
  maxHistory: 50,       // Max snapshots to keep
  debounceMs: 500,      // Debounce delay
  excludeFields: [],    // Fields to exclude from tracking
  onSnapshot: (snap) => {}, // Snapshot callback
  onUndo: (snap) => {}, // Undo callback
  onRedo: (snap) => {}, // Redo callback
});
```

#### `useFieldHistory<T>(initialValue, options?)`

Hook for individual field tracking.

```tsx
const field = useFieldHistory('');

<input
  value={field.value}
  onChange={(e) => field.onChange(e.target.value)}
/>
<button onClick={field.undo}>Undo</button>
<button onClick={field.reset}>Reset</button>
```

#### `useKeyboardShortcuts(undo, redo, options?)`

Add Ctrl+Z/Ctrl+Y keyboard shortcuts.

```tsx
useKeyboardShortcuts(undo, redo, {
  enableUndo: true,
  enableRedo: true,
  preventDefault: true,
});
```

### Vanilla JavaScript

#### `createFormHistory<T>(initialState, options?)`

Create a form history instance.

```js
const history = createFormHistory(initialState, options);

history.getState()      // Get current state
history.update(state)   // Update state
history.undo()          // Undo
history.redo()          // Redo
history.canUndo()       // Check if can undo
history.canRedo()       // Check if can redo
history.pause()         // Pause recording
history.resume()        // Resume recording
history.clear()         // Clear history
history.jumpTo(pos)     // Jump to position
history.subscribe(cb)   // Subscribe to changes
history.destroy()       // Cleanup
```

#### `bindFormHistory(history, formElement)`

Auto-bind history to a DOM form.

```js
const unbind = bindFormHistory(history, formElement);
unbind(); // Remove bindings
```

### Core API

For advanced use cases, you can use the core `HistoryManager` directly:

```ts
import { HistoryManager } from 'use-form-history/core';

const manager = new HistoryManager(initialState, options);
manager.update(newState);
manager.undo();
manager.redo();
```

## Advanced Usage

### Exclude Fields from History

```tsx
const { state, setState } = useFormHistory({
  name: '',
  password: '',
}, {
  excludeFields: ['password'], // Don't track password changes
});
```

### Pause Recording During Interactions

```tsx
const { state, setState, pause, resume } = useFormHistory({ value: 0 });

<input
  type="range"
  value={state.value}
  onMouseDown={pause}       // Pause while dragging
  onMouseUp={resume}        // Resume when done
  onChange={(e) => setState({ value: Number(e.target.value) })}
/>
```

### History Metadata & Time Travel

```tsx
const { history, jumpTo } = useFormHistory(initialState);

// Show history timeline
history.snapshots.map((snapshot, index) => (
  <button key={snapshot.id} onClick={() => jumpTo(index)}>
    {new Date(snapshot.timestamp).toLocaleTimeString()}
  </button>
));
```

### Custom Callbacks

```tsx
useFormHistory(initialState, {
  onSnapshot: (snapshot) => {
    console.log('Snapshot created:', snapshot.metadata?.affectedFields);
  },
  onUndo: (snapshot) => {
    console.log('Undid to:', snapshot.timestamp);
  },
});
```

## Configuration Options

```ts
interface HistoryOptions {
  maxHistory?: number;          // Default: 50
  debounceMs?: number;          // Default: 500
  excludeFields?: string[];     // Default: []
  enableBranching?: boolean;    // Default: false (Git-like branching)
  onSnapshot?: (snapshot) => void;
  onUndo?: (snapshot) => void;
  onRedo?: (snapshot) => void;
  onClear?: () => void;
}
```

## Performance Considerations

### Memory Usage

- **Diff-based storage**: Only changed fields are stored, not entire state
- **Configurable limits**: Control memory with `maxHistory`
- **Debouncing**: Reduces snapshot frequency

### Optimization Tips

1. **Increase debounce** for text-heavy forms: `debounceMs: 1000`
2. **Reduce max history** for large forms: `maxHistory: 20`
3. **Exclude large fields**: Don't track file uploads or images
4. **Pause during interactions**: Pause while dragging or scrolling

## Bundle Size

- **Core**: ~2KB gzipped
- **React hooks**: ~3KB gzipped
- **Vanilla**: ~2.5KB gzipped

## Browser Support

All modern browsers (ES2020+):
- Chrome 80+
- Firefox 74+
- Safari 13.1+
- Edge 80+

## Migration from Redux-Undo

```tsx
// Before (Redux-Undo)
import undoable from 'redux-undo';
const reducer = undoable(myReducer);

// After (use-form-history)
import { useFormHistory } from 'use-form-history/react';
const { state, setState, undo, redo } = useFormHistory(initialState);
```

## Examples

See the [examples/](./examples/) directory for:
- Basic React form
- Contenteditable rich text editor
- Vanilla JavaScript integration
- Multi-step form with history

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Acknowledgments

Inspired by the challenges of implementing undo/redo in real-world applications.
