import { HistoryManager } from '../core/HistoryManager';
import type { HistoryOptions, HistoryInfo } from '../core/types';

export interface FormHistory<T> {
    /** Get current state */
    getState: () => T;
    /** Update state (debounced) */
    update: (newState: T | ((prev: T) => T)) => void;
    /** Create immediate snapshot */
    snapshot: () => void;
    /** Undo to previous state */
    undo: () => T | null;
    /** Redo to next state */
    redo: () => T | null;
    /** Check if can undo */
    canUndo: () => boolean;
    /** Check if can redo */
    canRedo: () => boolean;
    /** Pause recording */
    pause: () => void;
    /** Resume recording */
    resume: () => void;
    /** Clear all history */
    clear: () => void;
    /** Jump to specific position */
    jumpTo: (position: number) => T | null;
    /** Get history info */
    getInfo: () => HistoryInfo;
    /** Subscribe to state changes */
    subscribe: (callback: (state: T) => void) => () => void;
    /** Destroy and cleanup */
    destroy: () => void;
}

/**
 * Create a form history instance (framework-agnostic)
 * 
 * @example
 * ```js
 * const history = createFormHistory({ name: '', email: '' }, {
 *   maxHistory: 50,
 *   debounceMs: 500,
 * });
 * 
 * history.update({ name: 'John', email: 'john@example.com' });
 * history.undo();
 * history.redo();
 * ```
 */
export function createFormHistory<T>(
    initialState: T,
    options?: HistoryOptions
): FormHistory<T> {
    const subscribers = new Set<(state: T) => void>();

    // Forward declaration for use in closures
    let wrappedManagerRef: HistoryManager<T>;

    const notifySubscribers = () => {
        const state = wrappedManagerRef.getCurrentState();
        subscribers.forEach(callback => callback(state));
    };

    // Wrap callbacks to notify subscribers
    const wrappedOptions: HistoryOptions = {
        ...options,
        onSnapshot: (snapshot) => {
            options?.onSnapshot?.(snapshot);
            notifySubscribers();
        },
        onUndo: (snapshot) => {
            options?.onUndo?.(snapshot);
            notifySubscribers();
        },
        onRedo: (snapshot) => {
            options?.onRedo?.(snapshot);
            notifySubscribers();
        },
    };

    // Initialize with wrapped options
    const wrappedManager = wrappedManagerRef = new HistoryManager(initialState, wrappedOptions);

    return {
        getState: () => wrappedManager.getCurrentState(),

        update: (newState: T | ((prev: T) => T)) => {
            const state = typeof newState === 'function'
                ? (newState as (prev: T) => T)(wrappedManager.getCurrentState())
                : newState;
            wrappedManager.update(state);
        },

        snapshot: () => {
            wrappedManager.snapshot(wrappedManager.getCurrentState());
        },

        undo: () => wrappedManager.undo(),

        redo: () => wrappedManager.redo(),

        canUndo: () => wrappedManager.canUndo(),

        canRedo: () => wrappedManager.canRedo(),

        pause: () => wrappedManager.pause(),

        resume: () => wrappedManager.resume(),

        clear: () => wrappedManager.clear(),

        jumpTo: (position: number) => wrappedManager.jumpTo(position),

        getInfo: () => wrappedManager.getInfo(),

        subscribe: (callback: (state: T) => void) => {
            subscribers.add(callback);
            // Return unsubscribe function
            return () => {
                subscribers.delete(callback);
            };
        },

        destroy: () => {
            wrappedManager.destroy();
            subscribers.clear();
        },
    };
}

/**
 * Helper to bind form history to DOM form element
 * 
 * @example
 * ```js
 * const history = createFormHistory({ name: '', email: '' });
 * const unbind = bindFormHistory(history, document.querySelector('form'));
 * ```
 */
export function bindFormHistory<T extends Record<string, unknown>>(
    history: FormHistory<T>,
    formElement: HTMLFormElement
): () => void {
    const handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type, checked } = target;

        if (!name) return;

        history.update(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const updateForm = (state: T) => {
        const elements = formElement.elements;
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i] as HTMLInputElement;
            const { name, type } = element;

            if (name && name in state) {
                if (type === 'checkbox') {
                    element.checked = Boolean(state[name]);
                } else {
                    element.value = String(state[name] ?? '');
                }
            }
        }
    };

    // Listen to form inputs
    formElement.addEventListener('input', handleInput);

    // Subscribe to history changes
    const unsubscribe = history.subscribe(updateForm);

    // Initial sync
    updateForm(history.getState());

    // Return cleanup function
    return () => {
        formElement.removeEventListener('input', handleInput);
        unsubscribe();
    };
}
