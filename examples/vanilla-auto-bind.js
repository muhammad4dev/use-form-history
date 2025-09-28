import { createFormHistory, bindFormHistory } from '../dist/vanilla/index.js';

const initialState = {
    username: '',
    role: 'user',
    notifications: false
};

// Create history instance
const history = createFormHistory(initialState);

// Auto-bind to the form element
const form = document.getElementById('myForm');
const unbind = bindFormHistory(history, form);

// Setup controls
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

undoBtn.addEventListener('click', () => history.undo());
redoBtn.addEventListener('click', () => history.redo());

// Update button states on change
history.subscribe(() => {
    undoBtn.disabled = !history.canUndo();
    redoBtn.disabled = !history.canRedo();
});

// Initial state
undoBtn.disabled = true;
redoBtn.disabled = true;

// Keyboard shortcuts (simple implementation)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        history.undo();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        history.redo();
    }
});
