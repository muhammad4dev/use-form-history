import React from 'react';
import { useFormHistory } from 'use-form-history/react';

interface FormState {
    name: string;
    email: string;
    bio: string;
}

const initialFormState: FormState = {
    name: '',
    email: '',
    bio: '',
};

export function BasicFormExample() {
    const {
        state,
        setState,
        undo,
        redo,
        canUndo,
        canRedo,
        history
    } = useFormHistory<FormState>(initialFormState);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setState({
            ...state,
            [name]: value,
        });
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Basic Form with Undo/Redo</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                        name="name"
                        value={state.name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        placeholder="Enter your name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        name="email"
                        value={state.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        placeholder="Enter your email"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <textarea
                        name="bio"
                        value={state.bio}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        placeholder="Tell us about yourself"
                        rows={3}
                    />
                </div>

                <div className="flex gap-2 pt-4">
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                    >
                        Undo
                    </button>
                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                    >
                        Redo
                    </button>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                    History: {history.past.length} past, {history.future.length} future
                </div>
            </div>
        </div>
    );
}
