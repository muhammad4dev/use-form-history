import { describe, it, expect } from 'vitest';
import { DiffEngine } from '../src/core/DiffEngine';
import { HistoryManager } from '../src/core/HistoryManager';

describe('Edge Cases and Additional Coverage', () => {
    describe('DiffEngine edge cases', () => {
        it('should clone Date objects correctly', () => {
            const state = { date: new Date('2024-01-01'), name: 'test' };
            const patch = DiffEngine.createPatch(state, { ...state, name: 'updated' });

            // When we apply the patch, dates should be properly deep cloned
            const result = DiffEngine.applyPatch(state, patch);
            expect(result.name).toBe('updated');
            expect(result.date).toBeInstanceOf(Date);
        });

        it('should handle null values', () => {
            const patch = DiffEngine.createPatch({ value: null }, { value: 'test' });
            expect(patch.changes.value).toBe('test');
        });

        it('should handle undefined  in objects', () => {
            const patch = DiffEngine.createPatch({ a: 1, b: 2 }, { a: 1 });
            expect(patch.changes.b).toBeUndefined();
        });

        it('should handle wildcard field exclusion', () => {
            // Test nested wildcard exclusion
            const patch = DiffEngine.createPatch(
                { user: { name: 'John', id: 1 }, admin: { name: 'Boss', id: 2 } },
                { user: { name: 'Jane', id: 1 }, admin: { name: 'Chief', id: 2 } },
                ['user.*']
            );

            // user.name should be excluded due to wildcard
            expect(patch.changes['user.name']).toBeUndefined();
            // admin.name should not be excluded
            expect(patch.changes['admin.name']).toBe('Chief');
        });

        it('should handle deeply nested objects', () => {
            const old = { a: { b: { c: { d: 1 } } } };
            const newObj = { a: { b: { c: { d: 2 } } } };

            const patch = DiffEngine.createPatch(old, newObj);
            expect(patch.changes['a.b.c.d']).toBe(2);

            const result = DiffEngine.applyPatch(old, patch);
            expect(result.a.b.c.d).toBe(2);
        });

        it('should handle creating new nested paths', () => {
            const state = { a: {} };
            const patch = {
                type: 'update' as const,
                changes: { 'a.b.c': 123 },
                previous: {},
            };

            const result = DiffEngine.applyPatch(state, patch);
            expect(result.a).toBeDefined();
        });
    });

    describe('HistoryManager edge cases', () => {
        it('should handle enableBranching option', () => {
            const manager = new HistoryManager({ count: 0 }, { enableBranching: true });

            manager.snapshot({ count: 1 });
            manager.snapshot({ count: 2 });
            manager.undo();
            manager.snapshot({ count: 3 });

            const info = manager.getInfo();
            expect(info.size).toBe(3); // Should keep branch
        });

        it('should handle jumpTo with invalid positions', () => {
            const manager = new HistoryManager({ count: 0 });

            manager.snapshot({ count: 1 });

            expect(manager.jumpTo(-2)).toBeNull();
            expect(manager.jumpTo(10)).toBeNull();
        });

        it('should handle redo when nothing to redo', () => {
            const manager = new HistoryManager({ count: 0 });
            manager.snapshot({ count: 1 });

            const result = manager.redo();
            expect(result).toBeNull();
        });

        it('should handle undo when nothing undone yet', () => {
            const manager = new HistoryManager({ count: 0 });
            manager.snapshot({ count: 1 });

            // Undo once
            manager.undo();
            // Try to undo again
            const result = manager.undo();
            expect(result).toBeNull();
        });

        it('should handle destroying with pending debounce', () => {
            const manager = new HistoryManager({ count: 0 }, { debounceMs: 100 });

            manager.update({ count: 1 });
            manager.destroy(); // Should cleanup debounce timer

            const info = manager.getInfo();
            expect(info.size).toBe(0);
        });

        it('should flush pending changes on getCurrentState', () => {
            const manager = new HistoryManager({ count: 0 }, { debounceMs: 100 });

            manager.update({ count: 1 });
            const state = manager.getCurrentState(); // Should flush

            expect(state.count).toBe(1);
        });

        it('should flush pending changes on undo', () => {
            const manager = new HistoryManager({ count: 0 }, { debounceMs: 100 });

            manager.snapshot({ count: 1 });
            manager.update({ count: 2 });
            manager.undo(); // Should flush pending change first

            expect(manager.getCurrentState().count).toBe(1);
        });

        it('should flush pending changes on jumpTo', () => {
            const manager = new HistoryManager({ count: 0 }, { debounceMs: 100 });

            manager.snapshot({ count: 1 });
            manager.update({ count: 2 });
            manager.jumpTo(0); // Should flush pending

            expect(manager.getCurrentState().count).toBe(1);
        });

        it('should call onClear callback', () => {
            let called = false;
            const manager = new HistoryManager({ count: 0 }, {
                onClear: () => { called = true; }
            });

            manager.snapshot({ count: 1 });
            manager.clear();

            expect(called).toBe(true);
        });

        it('should handle excluded fields in snapshots', () => {
            const manager = new HistoryManager(
                { name: '', password: '' },
                { excludeFields: ['password'] }
            );

            manager.snapshot({ name: 'John', password: 'secret1' });
            manager.snapshot({ name: 'John', password: 'secret2' });

            const info = manager.getInfo();
            // Only one snapshot since password changes are excluded
            expect(info.size).toBe(1);
        });
    });
});
