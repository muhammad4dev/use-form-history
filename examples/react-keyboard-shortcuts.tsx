import React from 'react';
import { useFormHistory, useKeyboardShortcuts } from 'use-form-history/react';

export function KeyboardShortcutsExample() {
    const { state, setState, undo, redo, canUndo, canRedo } = useFormHistory({
        text: ''
    });

    // Enable Ctrl+Z (Undo) and Ctrl+Y / Ctrl+Shift+Z (Redo)
    useKeyboardShortcuts(undo, redo);

    return (
        <div className="p-4 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Keyboard Shortcuts</h2>

            <div className="bg-blue-50 p-4 rounded mb-4 text-sm text-blue-800">
                <p>Type in the box below, then try:</p>
                <ul className="list-disc list-inside mt-2">
                    <li><strong>Ctrl+Z</strong> (or Cmd+Z) to Undo</li>
                    <li><strong>Ctrl+Y</strong> (or Cmd+Shift+Z) to Redo</li>
                </ul>
            </div>

            <textarea
                value={state.text}
                onChange={(e) => setState({ text: e.target.value })}
                className="w-full p-2 border rounded h-32"
                placeholder="Type here to test shortcuts..."
            />

            <div className="mt-2 flex gap-2">
                <button onClick={undo} disabled={!canUndo} className="text-sm text-gray-500">
                    Manual Undo
                </button>
                <button onClick={redo} disabled={!canRedo} className="text-sm text-gray-500">
                    Manual Redo
                </button>
            </div>
        </div>
    );
}
