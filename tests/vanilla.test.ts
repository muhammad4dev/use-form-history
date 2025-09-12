import { describe, it, expect } from 'vitest';
import { createFormHistory } from '../src/vanilla';

describe('createFormHistory (Vanilla)', () => {
    it('should create history instance', () => {
        const history = createFormHistory({ name: '', email: '' });

        const state = history.getState();
        expect(state).toEqual({ name: '', email: '' });
        expect(history.canUndo()).toBe(false);
        expect(history.canRedo()).toBe(false);
    });

    it('should update state', () => {
        const history = createFormHistory({ name: '' });

        history.update({ name: 'John' });
        expect(history.getState().name).toBe('John');
    });

    it('should support functional updates', () => {
        const history = createFormHistory({ count: 0 });

        history.update(prev => ({ count: prev.count + 1 }));
        expect(history.getState().count).toBe(1);
    });

    it('should undo and redo', (done) => {
        const history = createFormHistory({ name: '' }, { debounceMs: 100 });

        history.update({ name: 'John' });

        setTimeout(() => {
            history.update({ name: 'Jane' });

            setTimeout(() => {
                const undone = history.undo();
                expect(undone?.name).toBe('John');
                expect(history.canRedo()).toBe(true);

                const redone = history.redo();
                expect(redone?.name).toBe('Jane');

                done();
            }, 150);
        }, 150);
    });

    it('should subscribe to changes', (done) => {
        const history = createFormHistory({ name: '' }, { debounceMs: 100 });

        const states: any[] = [];
        history.subscribe(state => states.push(state));

        history.update({ name: 'John' });

        setTimeout(() => {
            expect(states.length).toBeGreaterThan(0);
            expect(states[0]!.name).toBe('John');
            done();
        }, 150);
    });

    it('should unsubscribe', (done) => {
        const history = createFormHistory({ name: '' }, { debounceMs: 100 });

        let callCount = 0;
        const unsubscribe = history.subscribe(() => callCount++);

        history.update({ name: 'John' });

        setTimeout(() => {
            unsubscribe();
            history.update({ name: 'Jane' });

            setTimeout(() => {
                expect(callCount).toBe(1);
                done();
            }, 150);
        }, 150);
    });

    it('should destroy and cleanup', () => {
        const history = createFormHistory({ name: '' });
        history.snapshot({ name: 'John' });

        history.destroy();

        const info = history.getInfo();
        expect(info.size).toBe(0);
    });
});
