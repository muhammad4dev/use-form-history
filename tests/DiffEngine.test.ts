import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiffEngine } from '../src/core/DiffEngine';

describe('DiffEngine', () => {
    describe('createPatch', () => {
        it('should detect simple value changes', () => {
            const oldState = { name: 'John', age: 25 };
            const newState = { name: 'Jane', age: 25 };

            const patch = DiffEngine.createPatch(oldState, newState);

            expect(patch.type).toBe('update');
            expect(patch.changes).toEqual({ name: 'Jane' });
            expect(patch.previous).toEqual({ name: 'John' });
        });

        it('should detect nested object changes', () => {
            const oldState = { user: { name: 'John', address: { city: 'NYC' } } };
            const newState = { user: { name: 'John', address: { city: 'LA' } } };

            const patch = DiffEngine.createPatch(oldState, newState);

            expect(patch.changes).toEqual({ 'user.address.city': 'LA' });
            expect(patch.previous).toEqual({ 'user.address.city': 'NYC' });
        });

        it('should detect array changes', () => {
            const oldState = { items: [1, 2, 3] };
            const newState = { items: [1, 2, 4] };

            const patch = DiffEngine.createPatch(oldState, newState);

            expect(patch.changes.items).toEqual([1, 2, 4]);
        });

        it('should handle added fields', () => {
            const oldState = { name: 'John' };
            const newState = { name: 'John', email: 'john@test.com' };

            const patch = DiffEngine.createPatch(oldState, newState);

            expect(patch.changes.email).toBe('john@test.com');
        });

        it('should handle removed fields', () => {
            const oldState = { name: 'John', email: 'john@test.com' };
            const newState = { name: 'John' };

            const patch = DiffEngine.createPatch(oldState, newState);

            expect(patch.changes.email).toBeUndefined();
        });

        it('should exclude specified fields', () => {
            const oldState = { name: 'John', password: 'secret' };
            const newState = { name: 'Jane', password: 'newsecret' };

            const patch = DiffEngine.createPatch(oldState, newState, ['password']);

            expect(patch.changes).toEqual({ name: 'Jane' });
            expect(patch.changes.password).toBeUndefined();
        });

        it('should handle no changes', () => {
            const state = { name: 'John', age: 25 };
            const patch = DiffEngine.createPatch(state, state);

            expect(Object.keys(patch.changes).length).toBe(0);
        });

        it('should handle null values', () => {
            const oldState: any = { name: 'John', value: null };
            const newState: any = { name: 'John', value: 'something' };

            const patch = DiffEngine.createPatch(oldState, newState);

            expect(patch.changes.value).toBe('something');
            expect(patch.previous?.value).toBeNull();
        });

        it('should handle arrays with excludeFields', () => {
            const oldState = { tags: [1, 2, 3], ids: [4, 5, 6] };
            const newState = { tags: [1, 2, 4], ids: [4, 5, 7] };

            const patch = DiffEngine.createPatch(oldState, newState, ['tags']);

            expect(patch.changes.ids).toEqual([4, 5, 7]);
            expect(patch.changes.tags).toBeUndefined();
        });

        it('should handle type changes from object to primitive', () => {
            const oldState: any = { user: { name: 'John' } };
            const newState: any = { user: null };

            const patch = DiffEngine.createPatch(oldState, newState);

            expect(patch.changes.user).toBeNull();
            expect(patch.previous?.user).toEqual({ name: 'John' });
        });

        it('should handle excluded fields with primitive values', () => {
            const oldState = { name: 'John', ignored: 'old' };
            const newState = { name: 'John', ignored: 'new' };

            const patch = DiffEngine.createPatch(oldState, newState, ['ignored']);

            expect(patch.changes.ignored).toBeUndefined();
            expect(Object.keys(patch.changes).length).toBe(0);
        });
    });

    describe('applyPatch', () => {
        it('should apply simple patch', () => {
            const state = { name: 'John', age: 25 };
            const patch = {
                type: 'update' as const,
                changes: { name: 'Jane' },
                previous: { name: 'John' },
            };

            const result = DiffEngine.applyPatch(state, patch);

            expect(result.name).toBe('Jane');
            expect(result.age).toBe(25);
        });

        it('should apply nested patch', () => {
            const state = { user: { name: 'John', age: 25 } };
            const patch = {
                type: 'update' as const,
                changes: { 'user.age': 26 },
                previous: { 'user.age': 25 },
            };

            const result = DiffEngine.applyPatch(state, patch);

            expect(result.user.age).toBe(26);
            expect(result.user.name).toBe('John');
        });

        it('should not mutate original state', () => {
            const state = { name: 'John' };
            const patch = {
                type: 'update' as const,
                changes: { name: 'Jane' },
                previous: { name: 'John' },
            };

            DiffEngine.applyPatch(state, patch);

            expect(state.name).toBe('John');
        });

        it('should apply replace patch', () => {
            const state = { name: 'John', age: 25 };
            const patch = {
                type: 'replace' as const,
                changes: { name: 'Jane', age: 30, email: 'jane@test.com' },
                previous: {},
            };

            const result = DiffEngine.applyPatch(state, patch);

            expect(result).toEqual({ name: 'Jane', age: 30, email: 'jane@test.com' });
            // Replace patch returns the changes directly
            expect(result).toBe(patch.changes);
        });

        it('should handle undefined values (delete operation)', () => {
            const state = { name: 'John', email: 'john@test.com', age: 25 };
            const patch = {
                type: 'update' as const,
                changes: { email: undefined },
                previous: { email: 'john@test.com' },
            };

            const result = DiffEngine.applyPatch(state, patch);

            expect(result.email).toBeUndefined();
            expect('email' in result).toBe(false);
            expect(result.name).toBe('John');
        });

        it('should handle arrays in deepClone', () => {
            const state = { users: [{ name: 'John' }, { name: 'Jane' }] };
            const patch = {
                type: 'update' as const,
                changes: { 'users': [{ name: 'John' }, { name: 'Jane' }, { name: 'Bob' }] },
                previous: { 'users': [{ name: 'John' }, { name: 'Jane' }] },
            };

            const result = DiffEngine.applyPatch(state, patch);

            expect(result.users).toHaveLength(3);
            expect(result.users[2].name).toBe('Bob');
            expect(result.users).not.toBe(state.users);
        });
    });

    describe('reversePatch', () => {
        it('should reverse a patch', () => {
            const patch = {
                type: 'update' as const,
                changes: { name: 'Jane' },
                previous: { name: 'John' },
            };

            const reversed = DiffEngine.reversePatch(patch);

            expect(reversed.changes).toEqual({ name: 'John' });
            expect(reversed.previous).toEqual({ name: 'Jane' });
        });
    });
});
