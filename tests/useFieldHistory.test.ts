import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFieldHistory } from '../src/react/useFieldHistory';

describe('useFieldHistory', () => {
    it('should initialize with initial value', () => {
        const { result } = renderHook(() =>
            useFieldHistory('initial')
        );

        expect(result.current.value).toBe('initial');
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
    });

    it('should update value via onChange', () => {
        const { result } = renderHook(() =>
            useFieldHistory('')
        );

        act(() => {
            result.current.onChange('new value');
        });

        expect(result.current.value).toBe('new value');
    });

    it('should support undo and redo', async () => {
        const { result } = renderHook(() =>
            useFieldHistory('', { debounceMs: 100 })
        );

        act(() => {
            result.current.onChange('first');
        });

        await new Promise(resolve => setTimeout(resolve, 150));

        act(() => {
            result.current.onChange('second');
        });

        await new Promise(resolve => setTimeout(resolve, 150));

        expect(result.current.canUndo).toBe(true);

        act(() => {
            result.current.undo();
        });

        expect(result.current.value).toBe('first');
        expect(result.current.canRedo).toBe(true);

        act(() => {
            result.current.redo();
        });

        expect(result.current.value).toBe('second');
    });

    it('should reset to initial value', async () => {
        const { result } = renderHook(() =>
            useFieldHistory('initial', { debounceMs: 100 })
        );

        act(() => {
            result.current.onChange('changed');
        });

        await new Promise(resolve => setTimeout(resolve, 150));

        expect(result.current.value).toBe('changed');

        act(() => {
            result.current.reset();
        });

        // Reset clears history and returns to initial value
        expect(result.current.value).toBe('initial');
        expect(result.current.canUndo).toBe(false);
    });

    it('should handle numeric values', async () => {
        const { result } = renderHook(() =>
            useFieldHistory(0, { debounceMs: 100 })
        );

        // First create a change to establish history
        act(() => {
            result.current.onChange(5);
        });

        await new Promise(resolve => setTimeout(resolve, 150));

        act(() => {
            result.current.onChange(42);
        });

        await new Promise(resolve => setTimeout(resolve, 150));

        expect(result.current.value).toBe(42);
        expect(result.current.canUndo).toBe(true);

        act(() => {
            result.current.undo();
        });

        expect(result.current.value).toBe(5);
    });

    it('should handle boolean values', async () => {
        const { result } = renderHook(() =>
            useFieldHistory(false, { debounceMs: 100 })
        );

        act(() => {
            result.current.onChange(true);
        });

        await new Promise(resolve => setTimeout(resolve, 150));

        expect(result.current.value).toBe(true);

        act(() => {
            result.current.undo();
        });

        expect(result.current.value).toBe(false);
    });

    it('should handle undo when no history exists', () => {
        const { result } = renderHook(() =>
            useFieldHistory('initial')
        );

        // Try to undo when there's no history
        act(() => {
            result.current.undo();
        });

        // Value should remain unchanged
        expect(result.current.value).toBe('initial');
        expect(result.current.canUndo).toBe(false);
    });

    it('should handle redo when no forward history exists', () => {
        const { result } = renderHook(() =>
            useFieldHistory('initial')
        );

        // Try to redo when there's no forward history
        act(() => {
            result.current.redo();
        });

        // Value should remain unchanged
        expect(result.current.value).toBe('initial');
        expect(result.current.canRedo).toBe(false);
    });
});
