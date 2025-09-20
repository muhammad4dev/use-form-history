import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../src/react/useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
    it('should call undo on Ctrl+Z', () => {
        const undo = vi.fn();
        const redo = vi.fn();

        renderHook(() => useKeyboardShortcuts(undo, redo));

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            bubbles: true,
        });

        document.dispatchEvent(event);

        expect(undo).toHaveBeenCalledTimes(1);
        expect(redo).not.toHaveBeenCalled();
    });

    it('should call redo on Ctrl+Y', () => {
        const undo = vi.fn();
        const redo = vi.fn();

        renderHook(() => useKeyboardShortcuts(undo, redo));

        const event = new KeyboardEvent('keydown', {
            key: 'y',
            ctrlKey: true,
            bubbles: true,
        });

        document.dispatchEvent(event);

        expect(redo).toHaveBeenCalledTimes(1);
        expect(undo).not.toHaveBeenCalled();
    });

    it('should call redo on Ctrl+Shift+Z', () => {
        const undo = vi.fn();
        const redo = vi.fn();

        renderHook(() => useKeyboardShortcuts(undo, redo));

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            shiftKey: true,
            bubbles: true,
        });

        document.dispatchEvent(event);

        expect(redo).toHaveBeenCalledTimes(1);
        expect(undo).not.toHaveBeenCalled();
    });

    it('should not call handlers when undo is disabled', () => {
        const undo = vi.fn();
        const redo = vi.fn();

        renderHook(() => useKeyboardShortcuts(undo, redo, { enableUndo: false }));

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            bubbles: true,
        });

        document.dispatchEvent(event);

        expect(undo).not.toHaveBeenCalled();
    });

    it('should not call handlers when redo is disabled', () => {
        const undo = vi.fn();
        const redo = vi.fn();

        renderHook(() => useKeyboardShortcuts(undo, redo, { enableRedo: false }));

        const event = new KeyboardEvent('keydown', {
            key: 'y',
            ctrlKey: true,
            bubbles: true,
        });

        document.dispatchEvent(event);

        expect(redo).not.toHaveBeenCalled();
    });

    it('should not trigger without modifier key', () => {
        const undo = vi.fn();
        const redo = vi.fn();

        renderHook(() => useKeyboardShortcuts(undo, redo));

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            bubbles: true,
        });

        document.dispatchEvent(event);

        expect(undo).not.toHaveBeenCalled();
    });

    it('should cleanup event listener on unmount', () => {
        const undo = vi.fn();
        const redo = vi.fn();

        const { unmount } = renderHook(() => useKeyboardShortcuts(undo, redo));

        unmount();

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            bubbles: true,
        });

        document.dispatchEvent(event);

        expect(undo).not.toHaveBeenCalled();
    });

    it('should respect preventDefault option', () => {
        const undo = vi.fn();
        const redo = vi.fn();

        renderHook(() => useKeyboardShortcuts(undo, redo, { preventDefault: true }));

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            bubbles: true,
        });

        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

        document.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(undo).toHaveBeenCalled();
    });

    it('should not preventDefault when option is false', () => {
        const undo = vi.fn();
        const redo = vi.fn();

        renderHook(() => useKeyboardShortcuts(undo, redo, { preventDefault: false }));

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
        });

        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

        document.dispatchEvent(event);

        expect(preventDefaultSpy).not.toHaveBeenCalled();
        expect(undo).toHaveBeenCalled();
    });
});
