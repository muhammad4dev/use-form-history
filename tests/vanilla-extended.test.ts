import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFormHistory, bindFormHistory } from '../src/vanilla';

describe('Vanilla JS - Extended', () => {
    describe('createFormHistory - advanced features', () => {
        it('should handle callbacks', () => new Promise<void>(resolve => {
            const onSnapshot = vi.fn();
            const onUndo = vi.fn();
            const onRedo = vi.fn();

            const history = createFormHistory({ value: 0 }, {
                debounceMs: 100,
                onSnapshot,
                onUndo,
                onRedo,
            });

            history.update({ value: 1 });

            setTimeout(() => {
                expect(onSnapshot).toHaveBeenCalled();

                history.undo();
                expect(onUndo).toHaveBeenCalled();

                history.redo();
                expect(onRedo).toHaveBeenCalled();

                resolve();
            }, 200); // Increased to account for 100ms debounce + buffer
        }));

        it('should support maxHistory option', () => {
            const history = createFormHistory({ count: 0 }, { maxHistory: 3 });

            for (let i = 1; i <= 5; i++) {
                history.update({ count: i });
                history.snapshot();
            }

            const info = history.getInfo();
            expect(info.size).toBe(3);
        });

        it('should support excludeFields option', () => {
            const history = createFormHistory(
                { name: '', password: '' },
                { excludeFields: ['password'] }
            );

            history.update({ name: 'John', password: 'secret1' });
            history.snapshot();
            history.update({ name: 'John', password: 'secret2' });
            history.snapshot();

            // Password changes should not create snapshots
            const info = history.getInfo();
            expect(info.size).toBe(1); // Only one snapshot for name change
        });

        it('should pause and resume', () => {
            const history = createFormHistory({ value: 0 });

            history.pause();
            history.update({ value: 1 });
            history.snapshot();

            expect(history.getInfo().size).toBe(0);

            history.resume();
            history.update({ value: 2 });
            history.snapshot();

            expect(history.getInfo().size).toBe(1);
        });

        it('should support multiple subscribers', () => new Promise<void>((resolve, reject) => {
            const history = createFormHistory({ count: 0 }, { debounceMs: 50 });

            const states1: any[] = [];
            const states2: any[] = [];

            history.subscribe(state => states1.push(state));
            history.subscribe(state => states2.push(state));

            history.update({ count: 1 });

            setTimeout(() => {
                try {
                    expect(states1.length).toBeGreaterThan(0);
                    expect(states2.length).toBeGreaterThan(0);
                    expect(states1[states1.length - 1]!.count).toBe(1);
                    expect(states2[states2.length - 1]!.count).toBe(1);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }, 300);
        }));

        it('should handle unsubscribe correctly', () => new Promise<void>((resolve, reject) => {
            const history = createFormHistory({ value: 0 }, { debounceMs: 50 });

            let callCount = 0;
            const unsubscribe = history.subscribe(() => callCount++);

            history.update({ value: 1 });

            setTimeout(() => {
                const countBeforeUnsub = callCount;
                unsubscribe();

                history.update({ value: 2 });

                setTimeout(() => {
                    try {
                        // Count should not increase after unsubscribe
                        expect(callCount).toBe(countBeforeUnsub);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                }, 300);
            }, 300);
        }));
    });

    describe('bindFormHistory', () => {
        let form: HTMLFormElement;

        beforeEach(() => {
            // Create a test form
            form = document.createElement('form');
            form.innerHTML = `
        <input type="text" name="username" value="" />
        <input type="email" name="email" value="" />
        <input type="checkbox" name="subscribe" />
        <input type="text" name="comment" value="" />
      `;
            document.body.appendChild(form);
        });

        afterEach(() => {
            document.body.removeChild(form);
        });

        it('should bind form inputs to history', () => {
            const history = createFormHistory({
                username: '',
                email: '',
                subscribe: false,
                comment: '',
            });

            bindFormHistory(history, form);

            const usernameInput = form.querySelector('[name="username"]') as HTMLInputElement;
            usernameInput.value = 'john_doe';
            usernameInput.dispatchEvent(new Event('input', { bubbles: true }));

            expect(history.getState().username).toBe('john_doe');
        });

        it('should handle checkbox inputs', () => {
            const history = createFormHistory({
                username: '',
                email: '',
                subscribe: false,
                comment: '',
            });

            bindFormHistory(history, form);

            const checkbox = form.querySelector('[name="subscribe"]') as HTMLInputElement;
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('input', { bubbles: true }));

            expect(history.getState().subscribe).toBe(true);
        });

        it('should update form when state changes', () => new Promise<void>((resolve, reject) => {
            const history = createFormHistory({
                username: '',
                email: '',
                subscribe: false,
                comment: '',
            }, {
                onSnapshot: () => {
                    // Wait for snapshot to trigger subscription
                    setTimeout(() => {
                        try {
                            const usernameInput = form.querySelector('[name="username"]') as HTMLInputElement;
                            const emailInput = form.querySelector('[name="email"]') as HTMLInputElement;
                            const checkbox = form.querySelector('[name="subscribe"]') as HTMLInputElement;
                            const commentInput = form.querySelector('[name="comment"]') as HTMLTextAreaElement;

                            expect(usernameInput.value).toBe('jane_doe');
                            expect(emailInput.value).toBe('jane@example.com');
                            expect(checkbox.checked).toBe(true);
                            expect(commentInput.value).toBe('Hello');
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    }, 500);
                }
            });

            bindFormHistory(history, form);

            // Use update + snapshot for immediate state change and form sync
            history.update({
                username: 'jane_doe',
                email: 'jane@example.com',
                subscribe: true,
                comment: 'Hello',
            });
            history.snapshot();
        }));

        it('should cleanup on unbind', () => {
            const history = createFormHistory({
                username: '',
                email: '',
                subscribe: false,
                comment: '',
            });

            const unbind = bindFormHistory(history, form);

            const usernameInput = form.querySelector('[name="username"]') as HTMLInputElement;
            usernameInput.value = 'test1';
            usernameInput.dispatchEvent(new Event('input', { bubbles: true }));

            expect(history.getState().username).toBe('test1');

            // Unbind and try again
            unbind();

            usernameInput.value = 'test2';
            usernameInput.dispatchEvent(new Event('input', { bubbles: true }));

            // State should not update after unbind
            expect(history.getState().username).toBe('test1');
        });

        it('should handle inputs without name attribute', () => {
            const extraInput = document.createElement('input');
            extraInput.type = 'text';
            extraInput.value = 'no name';
            form.appendChild(extraInput);

            const history = createFormHistory({
                username: '',
                email: '',
                subscribe: false,
                comment: '',
            });

            // Should not throw error
            expect(() => {
                bindFormHistory(history, form);
                extraInput.dispatchEvent(new Event('input', { bubbles: true }));
            }).not.toThrow();
        });

        it('should handle undefined values in state', () => {
            const history = createFormHistory({
                username: 'test',
                email: undefined as any,
                subscribe: false,
                comment: '',
            });

            bindFormHistory(history, form);

            const emailInput = form.querySelector('[name="email"]') as HTMLInputElement;
            // Should convert undefined to empty string
            expect(emailInput.value).toBe('');
        });
    });
});
