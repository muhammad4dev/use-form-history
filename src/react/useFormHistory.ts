import { useRef, useState, useCallback, useEffect } from 'react';
import { HistoryManager } from '../core/HistoryManager';
import type { HistoryOptions, HistoryInfo } from '../core/types';

export interface UseFormHistoryReturn<T> {
    /** Current form state */
    state: T;
    /** Update state (debounced snapshot) */
    setState: (newState: T | ((prev: T) => T)) => void;
    /** Immediately create a snapshot */
    snapshot: () => void;
    /** Undo to previous state */
    undo: () => void;
    /** Redo to next state */
    redo: () => void;
    /** Can undo */
    canUndo: boolean;
    /** Can redo */
    canRedo: boolean;
    /** Pause history recording */
    pause: () => void;
    /** Resume history recording */
    resume: () => void;
    /** Clear all history */
    clear: () => void;
    /** Jump to specific position */
    jumpTo: (position: number) => void;
    /** History information */
    history: HistoryInfo;
}

/**
 * React hook for form-level history with undo/redo
 * 
 * @example
 * ```tsx
 * const { state, setState, undo, redo, canUndo, canRedo } = useFormHistory({
 *   name: '',
 *   email: '',
 * });
 * ```
 */
export function useFormHistory<T>(
    initialState: T,
    options?: HistoryOptions
): UseFormHistoryReturn<T> {
    const managerRef = useRef<HistoryManager<T>>();
    const [, forceUpdate] = useState({});

    // Initialize history manager
    if (!managerRef.current) {
        managerRef.current = new HistoryManager(initialState, options);
    }

    const manager = managerRef.current;

    // Force re-render
    const triggerUpdate = useCallback(() => {
        forceUpdate({});
    }, []);

    // State setter
    const setState = useCallback((newState: T | ((prev: T) => T)) => {
        const state = typeof newState === 'function'
            ? (newState as (prev: T) => T)(manager.getCurrentState())
            : newState;

        manager.update(state);
        triggerUpdate();
    }, [manager, triggerUpdate]);

    // Snapshot (immediate, no debounce)
    const snapshot = useCallback(() => {
        manager.snapshot(manager.getCurrentState());
        triggerUpdate();
    }, [manager, triggerUpdate]);

    // Undo
    const undo = useCallback(() => {
        const newState = manager.undo();
        if (newState !== null) {
            triggerUpdate();
        }
    }, [manager, triggerUpdate]);

    // Redo
    const redo = useCallback(() => {
        const newState = manager.redo();
        if (newState !== null) {
            triggerUpdate();
        }
    }, [manager, triggerUpdate]);

    // Pause
    const pause = useCallback(() => {
        manager.pause();
    }, [manager]);

    // Resume
    const resume = useCallback(() => {
        manager.resume();
    }, [manager]);

    // Clear
    const clear = useCallback(() => {
        manager.clear();
        triggerUpdate();
    }, [manager, triggerUpdate]);

    // Jump to position
    const jumpTo = useCallback((position: number) => {
        const newState = manager.jumpTo(position);
        if (newState !== null) {
            triggerUpdate();
        }
    }, [manager, triggerUpdate]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            manager.destroy();
        };
    }, [manager]);

    const info = manager.getInfo();

    return {
        state: manager.getCurrentState(),
        setState,
        snapshot,
        undo,
        redo,
        canUndo: info.canUndo,
        canRedo: info.canRedo,
        pause,
        resume,
        clear,
        jumpTo,
        history: info,
    };
}
