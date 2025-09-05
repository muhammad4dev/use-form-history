import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HistoryManager } from '../src/core/HistoryManager';

describe('HistoryManager', () => {
    let manager: HistoryManager<any>;

    beforeEach(() => {
        manager = new HistoryManager({ name: '', email: '' });
    });

    describe('initialization', () => {
        it('should initialize with empty history', () => {
            const info = manager.getInfo();
            expect(info.size).toBe(0);
            expect(info.position).toBe(-1);
            expect(info.canUndo).toBe(false);
            expect(info.canRedo).toBe(false);
        });

        it('should store initial state', () => {
            const state = manager.getCurrentState();
            expect(state).toEqual({ name: '', email: '' });
        });
    });

    describe('update and snapshots', () => {
        it('should create snapshot on update', (done) => {
            manager.update({ name: 'John', email: 'john@test.com' });

            setTimeout(() => {
                const info = manager.getInfo();
                expect(info.size).toBe(1);
                expect(info.canUndo).toBe(true);
                done();
            }, 600);
        });

        it('should debounce rapid updates', (done) => {
            manager.update({ name: 'J', email: '' });
            manager.update({ name: 'Jo', email: '' });
            manager.update({ name: 'John', email: '' });

            setTimeout(() => {
                const info = manager.getInfo();
                expect(info.size).toBe(1); // Only one snapshot
                done();
            }, 600);
        });

        it('should create immediate snapshot', () => {
            manager.snapshot({ name: 'John', email: '' });

            const info = manager.getInfo();
            expect(info.size).toBe(1);
        });

        it('should call onSnapshot callback', (done) => {
            const callback = vi.fn();
            const mgr = new HistoryManager({ name: '' }, {
                onSnapshot: callback,
            });

            mgr.update({ name: 'John' });

            setTimeout(() => {
                expect(callback).toHaveBeenCalled();
                done();
            }, 600);
        });
    });

    describe('undo/redo', () => {
        beforeEach(() => {
            manager.snapshot({ name: 'John', email: 'john@test.com' });
            manager.snapshot({ name: 'Jane', email: 'jane@test.com' });
        });

        it('should undo to previous state', () => {
            const result = manager.undo();
            expect(result?.name).toBe('John');
            expect(manager.canUndo()).toBe(true);
        });

        it('should undo multiple times', () => {
            manager.undo();
            const result = manager.undo();
            expect(result?.name).toBe('');
            expect(manager.canUndo()).toBe(false);
        });

        it('should redo after undo', () => {
            manager.undo();
            const result = manager.redo();
            expect(result?.name).toBe('Jane');
            expect(manager.canRedo()).toBe(false);
        });

        it('should not undo when at start', () => {
            manager.undo();
            manager.undo();
            const result = manager.undo();
            expect(result).toBeNull();
        });

        it('should not redo when at end', () => {
            const result = manager.redo();
            expect(result).toBeNull();
        });
    });

    describe('pause/resume', () => {
        it('should not create snapshots when paused', (done) => {
            manager.pause();
            manager.update({ name: 'John', email: '' });

            setTimeout(() => {
                const info = manager.getInfo();
                expect(info.size).toBe(0);
                expect(info.isPaused).toBe(true);
                done();
            }, 600);
        });

        it('should resume creating snapshots after resume', (done) => {
            manager.pause();
            manager.update({ name: 'John', email: '' });
            manager.resume();
            manager.update({ name: 'Jane', email: '' });

            setTimeout(() => {
                const info = manager.getInfo();
                expect(info.size).toBe(1);
                expect(info.isPaused).toBe(false);
                done();
            }, 600);
        });
    });

    describe('history limits', () => {
        it('should respect maxHistory limit', () => {
            const mgr = new HistoryManager({ count: 0 }, { maxHistory: 3 });

            for (let i = 1; i <= 5; i++) {
                mgr.snapshot({ count: i });
            }

            const info = mgr.getInfo();
            expect(info.size).toBe(3);
        });
    });

    describe('clear', () => {
        it('should clear all history', () => {
            manager.snapshot({ name: 'John', email: '' });
            manager.snapshot({ name: 'Jane', email: '' });

            manager.clear();

            const info = manager.getInfo();
            expect(info.size).toBe(0);
            expect(info.position).toBe(-1);
        });
    });

    describe('jumpTo', () => {
        beforeEach(() => {
            manager.snapshot({ name: 'A', email: '' });
            manager.snapshot({ name: 'B', email: '' });
            manager.snapshot({ name: 'C', email: '' });
        });

        it('should jump to specific position', () => {
            const result = manager.jumpTo(0);
            expect(result?.name).toBe('A');
        });

        it('should handle invalid positions', () => {
            const result = manager.jumpTo(10);
            expect(result).toBeNull();
        });
    });
});
