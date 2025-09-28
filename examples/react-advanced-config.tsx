import React from 'react';
import { useFormHistory } from 'use-form-history/react';

interface ComplexState {
    title: string;
    content: string;
    category: string;
    volume: number; // Example of a field we might want to pause recording for
    secretKey: string; // Example of an excluded field
}

const initialState: ComplexState = {
    title: '',
    content: '',
    category: 'general',
    volume: 50,
    secretKey: '',
};

export function AdvancedConfigExample() {
    const {
        state,
        setState,
        undo,
        redo,
        canUndo,
        canRedo,
        pause,
        resume,
        jumpTo,
        history
    } = useFormHistory<ComplexState>(initialState, {
        debounceMs: 1000, // Slower debounce for text heavy fields
        maxHistory: 20,   // Limit history size
        excludeFields: ['secretKey'], // Don't track secretKey changes
        onSnapshot: (snap) => console.log('Snapshot saved:', snap),
        onUndo: (snap) => console.log('Undid to:', snap),
    });

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Advanced Configuration</h2>

            <div className="grid gap-6">
                {/* Text fields with 1s debounce */}
                <div className="space-y-2">
                    <input
                        value={state.title}
                        onChange={(e) => setState({ ...state, title: e.target.value })}
                        placeholder="Title (1s debounce)"
                        className="w-full p-2 border rounded"
                    />
                    <textarea
                        value={state.content}
                        onChange={(e) => setState({ ...state, content: e.target.value })}
                        placeholder="Content (1s debounce)"
                        className="w-full p-2 border rounded h-32"
                    />
                </div>

                {/* Slider with pause/resume */}
                <div className="p-4 bg-gray-50 rounded">
                    <label className="block text-sm font-medium mb-2">
                        Volume (Pause recording while dragging)
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={state.volume}
                        onMouseDown={pause}
                        onMouseUp={resume}
                        onChange={(e) => setState({ ...state, volume: Number(e.target.value) })}
                        className="w-full"
                    />
                    <div className="text-right text-sm">{state.volume}%</div>
                </div>

                {/* Excluded field */}
                <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                    <label className="block text-sm font-medium mb-2">
                        Secret Key (Excluded from history)
                    </label>
                    <input
                        value={state.secretKey}
                        onChange={(e) => setState({ ...state, secretKey: e.target.value })}
                        className="w-full p-2 border rounded"
                    />
                </div>

                {/* Controls */}
                <div className="flex gap-2 border-t pt-4">
                    <button onClick={undo} disabled={!canUndo} className="btn">Undo</button>
                    <button onClick={redo} disabled={!canRedo} className="btn">Redo</button>
                </div>

                {/* Time Travel / History Visualization */}
                <div className="mt-6">
                    <h3 className="font-bold mb-2">History Timeline</h3>
                    <div className="flex flex-wrap gap-2">
                        {history.snapshots.map((snap, idx) => (
                            <button
                                key={snap.id}
                                onClick={() => jumpTo(idx)}
                                className={`px-2 py-1 text-xs rounded border ${idx === history.currentIndex ? 'bg-blue-500 text-white' : 'bg-white'
                                    }`}
                                title={new Date(snap.timestamp).toLocaleTimeString()}
                            >
                                {idx === 0 ? 'Init' : `Snap ${idx}`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
