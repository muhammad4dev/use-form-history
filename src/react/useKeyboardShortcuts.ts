import { useEffect, useCallback } from 'react';

export interface KeyboardShortcutsOptions {
    /** Enable Ctrl+Z/Cmd+Z for undo */
    enableUndo?: boolean;
    /** Enable Ctrl+Y/Cmd+Shift+Z for redo */
    enableRedo?: boolean;
    /** Prevent default browser behavior */
    preventDefault?: boolean;
}

/**
 * Hook to add keyboard shortcuts for undo/redo
 * 
 * @example
 * ```tsx
 * const { state, undo, redo } = useFormHistory(initialState);
 * useKeyboardShortcuts({ undo, redo });
 * ```
 */
export function useKeyboardShortcuts(
    undo: () => void,
    redo: () => void,
    options: KeyboardShortcutsOptions = {}
) {
    const {
        enableUndo = true,
        enableRedo = true,
        preventDefault = true,
    } = options;

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? event.metaKey : event.ctrlKey;

        if (!modifier) return;

        // Undo: Ctrl+Z or Cmd+Z
        if (enableUndo && event.key === 'z' && !event.shiftKey) {
            if (preventDefault) {
                event.preventDefault();
            }
            undo();
            return;
        }

        // Redo: Ctrl+Y or Ctrl+Shift+Z (Windows) or Cmd+Shift+Z (Mac)
        if (enableRedo) {
            if (
                event.key === 'y' ||
                (event.key === 'z' && event.shiftKey)
            ) {
                if (preventDefault) {
                    event.preventDefault();
                }
                redo();
                return;
            }
        }
    }, [undo, redo, enableUndo, enableRedo, preventDefault]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
}
