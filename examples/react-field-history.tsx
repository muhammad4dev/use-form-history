import React from 'react';
import { useFieldHistory } from 'use-form-history/react';

export function FieldHistoryExample() {
    // Track a single field independently
    const note = useFieldHistory('', {
        debounceMs: 500
    });

    return (
        <div className="p-4 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Single Field History</h2>
            <p className="mb-4 text-gray-600">
                This textarea has its own independent undo/redo stack, separate from any form.
            </p>

            <div className="space-y-2">
                <textarea
                    value={note.value}
                    onChange={(e) => note.onChange(e.target.value)}
                    className="w-full p-2 border rounded h-40"
                    placeholder="Type some notes..."
                />

                <div className="flex justify-between items-center">
                    <div className="space-x-2">
                        <button
                            onClick={note.undo}
                            disabled={!note.canUndo}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded disabled:opacity-50"
                        >
                            Undo
                        </button>
                        <button
                            onClick={note.redo}
                            disabled={!note.canRedo}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded disabled:opacity-50"
                        >
                            Redo
                        </button>
                    </div>

                    <button
                        onClick={note.reset}
                        className="text-red-600 text-sm hover:underline"
                    >
                        Reset
                    </button>
                </div>

                <div className="text-xs text-gray-400">
                    {note.isDirty ? 'Unsaved changes' : 'Saved'}
                </div>
            </div>
        </div>
    );
}
