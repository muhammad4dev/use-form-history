import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormHistory } from '../src/react/useFormHistory';

describe('useFormHistory', () => {
    it('should initialize with initial state', () => {
        const { result } = renderHook(() =>
            useFormHistory({ name: '', email: '' })
        );

        expect(result.current.state).toEqual({ name: '', email: '' });
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
    });

    it('should update state', () => {
        const { result } = renderHook(() =>
            useFormHistory({ name: '' })
        );

        act(() => {
            result.current.setState({ name: 'John' });
        });

        expect(result.current.state.name).toBe('John');
    });

    it('should support functional state updates', () => {
        const { result } = renderHook(() =>
            useFormHistory({ count: 0 })
        );

        act(() => {
            result.current.setState(prev => ({ count: prev.count + 1 }));
        });

        expect(result.current.state.count).toBe(1);
    });

    it('should undo and redo', async () => {
        const { result } = renderHook(() =>
            useFormHistory({ name: '' }, { debounceMs: 100 })
        );

        act(() => {
            result.current.setState({ name: 'John' });
        });

        // Wait for debounce
        await new Promise(resolve => setTimeout(resolve, 150));

        act(() => {
            result.current.setState({ name: 'Jane' });
        });

        await new Promise(resolve => setTimeout(resolve, 150));

        act(() => {
            result.current.undo();
        });

        expect(result.current.state.name).toBe('John');
        expect(result.current.canRedo).toBe(true);

        act(() => {
            result.current.redo();
        });

        expect(result.current.state.name).toBe('Jane');
    });

    it('should pause and resume', () => {
        const { result } = renderHook(() =>
            useFormHistory({ count: 0 })
        );

        // Create initial snapshot with a change
        act(() => {
            result.current.setState({ count: 1 });
            result.current.snapshot();
        });

        expect(result.current.history.size).toBe(1);

        // Pause and try to create snapshot
        act(() => {
            result.current.pause();
            result.current.setState({ count: 2 });
            result.current.snapshot();
        });

        // Should not create snapshot while paused
        expect(result.current.history.size).toBe(1);
        expect(result.current.state.count).toBe(2); // State should still update

        // Resume and create snapshot
        act(() => {
            result.current.resume();
            result.current.setState({ count: 3 });
            result.current.snapshot();
        });

        // Should create snapshot after resume
        expect(result.current.history.size).toBe(2);
    });

    it('should clear history', async () => {
        const { result } = renderHook(() =>
            useFormHistory({ name: '' }, { debounceMs: 100 })
        );

        act(() => {
            result.current.setState({ name: 'John' });
        });

        await new Promise(resolve => setTimeout(resolve, 150));

        act(() => {
            result.current.clear();
        });

        expect(result.current.history.size).toBe(0);
        expect(result.current.canUndo).toBe(false);
    });

    it('should support jumpTo to navigate history', async () => {
        const { result } = renderHook(() =>
            useFormHistory({ value: 0 }, { debounceMs: 100 })
        );

        // Create history with multiple changes
        act(() => {
            result.current.setState({ value: 1 });
        });
        await new Promise(resolve => setTimeout(resolve, 150));

        act(() => {
            result.current.setState({ value: 2 });
        });
        await new Promise(resolve => setTimeout(resolve, 150));

        const historySize = result.current.history.size;
        expect(historySize).toBeGreaterThan(0);

        // Jump to first position
        act(() => {
            result.current.jumpTo(0);
        });

        expect(result.current.state.value).toBe(1);
        expect(result.current.history.position).toBe(0);
    });

    it('should handle invalid operations gracefully', () => {
        const { result } = renderHook(() =>
            useFormHistory({ value: 0 })
        );

        // Try undo/redo/jumpTo when not possible
        act(() => {
            result.current.undo();
            result.current.redo();
            result.current.jumpTo(999);
            result.current.jumpTo(-1);
        });

        // State should remain unchanged
        expect(result.current.state.value).toBe(0);
    });
});
