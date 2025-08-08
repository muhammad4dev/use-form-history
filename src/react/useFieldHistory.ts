import { useState, useCallback, useRef, useEffect } from 'react';
import { HistoryManager } from '../core/HistoryManager';
import type { HistoryOptions } from '../core/types';

export interface UseFieldHistoryReturn<T> {
    /** Current field value */
    value: T;
    /** Change handler for inputs */
    onChange: (value: T) => void;
    /** Undo to previous value */
    undo: () => void;
    /** Redo to next value */
    redo: () => void;
    /** Can undo */
    canUndo: boolean;
    /** Can redo */
    canRedo: boolean;
    /** Reset to initial value */
    reset: () => void;
}

/**
 * React hook for field-level history
 * 
 * @example
 * ```tsx
 * const name = useFieldHistory('');
 * 
 * <input
 *   value={name.value}
 *   onChange={(e) => name.onChange(e.target.value)}
 * />
 * <button onClick={name.undo} disabled={!name.canUndo}>Undo</button>
 * ```
 */
export function useFieldHistory<T>(
    initialValue: T,
    options?: HistoryOptions
): UseFieldHistoryReturn<T> {
    const managerRef = useRef<HistoryManager<{ value: T }>>();
    const initialValueRef = useRef(initialValue);
    const [, forceUpdate] = useState({});

    // Initialize history manager
    if (!managerRef.current) {
        managerRef.current = new HistoryManager({ value: initialValue }, options);
    }

    const manager = managerRef.current;

    const triggerUpdate = useCallback(() => {
        forceUpdate({});
    }, []);

    const onChange = useCallback((value: T) => {
        manager.update({ value });
        triggerUpdate();
    }, [manager, triggerUpdate]);

    const undo = useCallback(() => {
        const newState = manager.undo();
        if (newState !== null) {
            triggerUpdate();
        }
    }, [manager, triggerUpdate]);

    const redo = useCallback(() => {
        const newState = manager.redo();
        if (newState !== null) {
            triggerUpdate();
        }
    }, [manager, triggerUpdate]);

    const reset = useCallback(() => {
        manager.clear();
        manager.update({ value: initialValueRef.current });
        triggerUpdate();
    }, [manager, triggerUpdate]);

    useEffect(() => {
        return () => {
            manager.destroy();
        };
    }, [manager]);

    const info = manager.getInfo();

    return {
        value: manager.getCurrentState().value,
        onChange,
        undo,
        redo,
        canUndo: info.canUndo,
        canRedo: info.canRedo,
        reset,
    };
}
