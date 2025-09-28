# Comprehensive Examples for use-form-history

## React Examples

### 1. Basic Form ([react-basic-form.tsx](file:///home/m/Projects/use-form-history/examples/react-basic-form.tsx))
Demonstrates the core `useFormHistory` hook with a simple form (Name, Email, Bio).
- **Key Features**: `state`, `setState`, `undo`, `redo`.
- **Usage**: Shows how to wire up inputs and buttons.

### 2. Advanced Configuration ([react-advanced-config.tsx](file:///home/m/Projects/use-form-history/examples/react-advanced-config.tsx))
Showcases more complex scenarios and configuration options.
- **Debouncing**: Different debounce times for text vs other inputs.
- **Field Exclusion**: How to exclude sensitive fields (like `secretKey`) from history.
- **Pause/Resume**: Pausing recording while dragging a slider.
- **Time Travel**: Using `jumpTo` to navigate history.

### 3. Single Field History ([react-field-history.tsx](file:///home/m/Projects/use-form-history/examples/react-field-history.tsx))
Demonstrates `useFieldHistory` for tracking a single input independently of a larger form.
- **Use Case**: Independent undo/redo stacks for specific text areas (like a comment box).

### 4. Keyboard Shortcuts ([react-keyboard-shortcuts.tsx](file:///home/m/Projects/use-form-history/examples/react-keyboard-shortcuts.tsx))
Shows how to easily add Ctrl+Z / Ctrl+Y support using `useKeyboardShortcuts`.

## Vanilla JS Examples

### 5. Basic Integration ([vanilla-basic.html](file:///home/m/Projects/use-form-history/examples/vanilla-basic.html))
Demonstrates manual integration using `createFormHistory`.
- **Manual Updates**: Calling `history.update()` on input events.
- **Subscriptions**: Updating the DOM when history changes via `history.subscribe()`.

### 6. Auto-Binding ([vanilla-auto-bind.html](file:///home/m/Projects/use-form-history/examples/vanilla-auto-bind.html))
Demonstrates the `bindFormHistory` helper.
- **Automation**: Automatically tracks all inputs in a `<form>` element.
- **Two-way binding**: Updates history on input, and updates DOM on undo/redo.

## How to Run
These examples are intended to be used as reference or copied into a project.
- **React**: Copy the [.tsx](file:///home/m/Projects/use-form-history/examples/react-basic-form.tsx) files into a React project.
- **Vanilla**: Open the [.html](file:///home/m/Projects/use-form-history/examples/vanilla-basic.html) files in a browser (served via a local server to support ES modules).