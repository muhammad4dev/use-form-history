import type { Patch } from './types';

/**
 * Lightweight diff engine for calculating patches between states
 */
export class DiffEngine {
    /**
     * Create a patch representing changes from oldState to newState
     */
    static createPatch<T>(oldState: T, newState: T, excludeFields: string[] = []): Patch {
        const changes: Record<string, unknown> = {};
        const previous: Record<string, unknown> = {};

        this.diffObjects(oldState, newState, '', changes, previous, excludeFields);

        return {
            type: Object.keys(changes).length > 0 ? 'update' : 'replace',
            changes,
            previous,
        };
    }

    /**
     * Apply a patch to a state to get the new state
     */
    static applyPatch<T>(state: T, patch: Patch): T {
        if (patch.type === 'replace') {
            return patch.changes as T;
        }

        const newState = this.deepClone(state);

        for (const path in patch.changes) {
            this.setValueAtPath(newState, path, patch.changes[path]);
        }

        return newState;
    }

    /**
     * Reverse a patch (for undo operations)
     */
    static reversePatch(patch: Patch): Patch {
        return {
            type: patch.type,
            changes: patch.previous || {},
            previous: patch.changes,
        };
    }

    /**
     * Deep clone an object
     */
    private static deepClone<T>(obj: T): T {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj.getTime()) as unknown as T;
        }

        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item)) as unknown as T;
        }

        if (obj instanceof Object) {
            const cloned: Record<string, unknown> = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    cloned[key] = this.deepClone((obj as Record<string, unknown>)[key]);
                }
            }
            return cloned as unknown as T;
        }

        return obj;
    }

    /**
     * Recursively diff two objects
     */
    private static diffObjects(
        oldObj: unknown,
        newObj: unknown,
        path: string,
        changes: Record<string, unknown>,
        previous: Record<string, unknown>,
        excludeFields: string[]
    ): void {
        // Handle primitives and null
        if (oldObj === newObj) {
            return;
        }

        if (
            oldObj === null ||
            newObj === null ||
            typeof oldObj !== 'object' ||
            typeof newObj !== 'object'
        ) {
            if (!this.isFieldExcluded(path, excludeFields)) {
                changes[path] = newObj;
                previous[path] = oldObj;
            }
            return;
        }

        // Handle arrays
        if (Array.isArray(oldObj) && Array.isArray(newObj)) {
            if (JSON.stringify(oldObj) !== JSON.stringify(newObj)) {
                if (!this.isFieldExcluded(path, excludeFields)) {
                    changes[path] = newObj;
                    previous[path] = oldObj;
                }
            }
            return;
        }

        // Handle objects
        const oldObjRecord = oldObj as Record<string, unknown>;
        const newObjRecord = newObj as Record<string, unknown>;
        const allKeys = new Set([...Object.keys(oldObjRecord), ...Object.keys(newObjRecord)]);

        for (const key of allKeys) {
            const newPath = path ? `${path}.${key}` : key;
            const oldValue = oldObjRecord[key];
            const newValue = newObjRecord[key];

            if (oldValue !== newValue) {
                if (
                    typeof oldValue === 'object' &&
                    oldValue !== null &&
                    typeof newValue === 'object' &&
                    newValue !== null &&
                    !Array.isArray(oldValue) &&
                    !Array.isArray(newValue)
                ) {
                    // Recursively diff nested objects
                    this.diffObjects(oldValue, newValue, newPath, changes, previous, excludeFields);
                } else {
                    if (!this.isFieldExcluded(newPath, excludeFields)) {
                        changes[newPath] = newValue;
                        previous[newPath] = oldValue;
                    }
                }
            }
        }
    }

    /**
     * Set a value at a nested path in an object
     */
    private static setValueAtPath(obj: unknown, path: string, value: unknown): void {
        const keys = path.split('.');
        let current = obj as Record<string, unknown>;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i]!;
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key] as Record<string, unknown>;
        }

        const lastKey = keys[keys.length - 1]!;
        if (value === undefined) {
            delete current[lastKey];
        } else {
            current[lastKey] = value;
        }
    }

    /**
     * Check if a field path should be excluded
     */
    private static isFieldExcluded(path: string, excludeFields: string[]): boolean {
        return excludeFields.some(excluded => {
            if (excluded.endsWith('*')) {
                const prefix = excluded.slice(0, -1);
                return path.startsWith(prefix);
            }
            return path === excluded;
        });
    }
}
