import { describe, it, expect } from 'vitest';
import { createFormHistory } from '../src/vanilla';

describe('Vanilla API - Uncovered Functions', () => {
    it('should support jumpTo function', () => {
        const history = createFormHistory({ count: 0 });

        // Create snapshots
        history.update({ count: 1 });
        history.snapshot();
        history.update({ count: 2 });
        history.snapshot();
        history.update({ count: 3 });
        history.snapshot();

        // Jump to position 1 (second snapshot: count: 2)
        const result = history.jumpTo(1);
        expect(result?.count).toBe(2);
        expect(history.getState().count).toBe(2);

        // Jump to position 0 (first snapshot: count: 1)
        const result2 = history.jumpTo(0);
        expect(result2?.count).toBe(1);
    });

    it('should handle destroy cleanup', () => {
        const history = createFormHistory({ value: 'test' });
        let subscribeCalled = false;

        const unsubscribe = history.subscribe(() => {
            subscribeCalled = true;
        });

        // Destroy should cleanup
        history.destroy();

        // Try to trigger snapshot after destroy
        history.update({ value: 'changed' });
        history.snapshot();

        // Subscriber should not be called after destroy
        expect(subscribeCalled).toBe(false);
    });

    it('should test all core functions are callable', () => {
        const history = createFormHistory({ value: 0 });

        // Test that all functions exist and are callable
        expect(typeof history.getState).toBe('function');
        expect(typeof history.update).toBe('function');
        expect(typeof history.snapshot).toBe('function');
        expect(typeof history.undo).toBe('function');
        expect(typeof history.redo).toBe('function');
        expect(typeof history.canUndo).toBe('function');
        expect(typeof history.canRedo).toBe('function');
        expect(typeof history.pause).toBe('function');
        expect(typeof history.resume).toBe('function');
        expect(typeof history.clear).toBe('function');
        expect(typeof history.jumpTo).toBe('function');
        expect(typeof history.getInfo).toBe('function');
        expect(typeof history.subscribe).toBe('function');
        expect(typeof history.destroy).toBe('function');

        // Actually call each function to ensure coverage
        expect(history.getState()).toEqual({ value: 0 });

        // Create initial state + snapshot
        history.update({ value: 1 });
        history.snapshot();

        expect(history.canUndo()).toBe(true);
        expect(history.canRedo()).toBe(false);

        const undo = history.undo();
        expect(undo?.value).toBe(0);

        const redo = history.redo();
        expect(redo?.value).toBe(1);

        history.pause();
        history.resume();

        const info = history.getInfo();
        expect(info.size).toBeGreaterThan(0);

        // jumpTo position 0 returns to first snapshot (value: 1)
        const jumped = history.jumpTo(0);
        expect(jumped?.value).toBe(1);

        history.clear();
        expect(history.getInfo().size).toBe(0);

        const unsub = history.subscribe(() => { });
        unsub(); // Test unsubscribe

        history.destroy();
    });
});
