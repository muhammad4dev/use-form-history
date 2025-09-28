import { createFormHistory } from '../dist/vanilla/index.js';

// Initialize history
const history = createFormHistory({
    title: '',
    description: ''
}, {
    debounceMs: 300
});

// DOM Elements
const titleInput = document.getElementById('title');
const descInput = document.getElementById('description');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const logBtn = document.getElementById('logBtn');

// 1. Update history on input
titleInput.addEventListener('input', (e) => {
    history.update(prev => ({ ...prev, title: e.target.value }));
});

descInput.addEventListener('input', (e) => {
    history.update(prev => ({ ...prev, description: e.target.value }));
});

// 2. Subscribe to changes to update UI
history.subscribe((state) => {
    // Only update if value is different to avoid cursor jumping
    if (titleInput.value !== state.title) {
        titleInput.value = state.title;
    }
    if (descInput.value !== state.description) {
        descInput.value = state.description;
    }

    // Update button states
    undoBtn.disabled = !history.canUndo();
    redoBtn.disabled = !history.canRedo();
});

// 3. Bind controls
undoBtn.addEventListener('click', () => history.undo());
redoBtn.addEventListener('click', () => history.redo());
logBtn.addEventListener('click', () => console.log(history.getState()));

// Initial button state
undoBtn.disabled = true;
redoBtn.disabled = true;
