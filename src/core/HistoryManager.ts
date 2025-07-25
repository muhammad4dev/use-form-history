import { DiffEngine } from './DiffEngine';
import { SnapshotFactory } from './Snapshot';
import type { Snapshot, HistoryOptions, HistoryInfo, SnapshotMetadata } from './types';

/**
 * Central history management system
 */
export class HistoryManager<T = unknown> {
    private history: Snapshot[] = [];
    private position = -1;
    private currentState: T;
    private isPaused = false;
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;
    private pendingState: T | null = null;

    private readonly options: Required<HistoryOptions>;

    constructor(initialState: T, options: HistoryOptions = {}) {
        this.currentState = DiffEngine['deepClone'](initialState);

        this.options = {
            maxHistory: options.maxHistory ?? 50,
            debounceMs: options.debounceMs ?? 500,
            onSnapshot: options.onSnapshot ?? (() => { }),
            onUndo: options.onUndo ?? (() => { }),
            onRedo: options.onRedo ?? (() => { }),
            onClear: options.onClear ?? (() => { }),
            excludeFields: options.excludeFields ?? [],
            enableBranching: options.enableBranching ?? false,
        };
    }

    /**
     * Update the current state (creates a snapshot after debounce)
     */
    update(newState: T, metadata?: SnapshotMetadata): void {
        if (this.isPaused) {
            this.currentState = DiffEngine['deepClone'](newState);
            return;
        }

        this.pendingState = DiffEngine['deepClone'](newState);

        // Clear existing debounce timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Set new debounce timer
        this.debounceTimer = setTimeout(() => {
            if (this.pendingState) {
                this.createSnapshot(this.pendingState, metadata);
                this.pendingState = null;
            }
            this.debounceTimer = null;
        }, this.options.debounceMs);
    }

    /**
     * Immediately create a snapshot without debouncing
     */
    snapshot(newState: T, metadata?: SnapshotMetadata): void {
        // Clear any pending debounced snapshot and process it first
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
            if (this.pendingState) {
                this.createSnapshot(this.pendingState, metadata);
                this.pendingState = null;
            }
        }
        this.createSnapshot(DiffEngine['deepClone'](newState), metadata);
    }

    /**
     * Internal method to create a snapshot
     */
    private createSnapshot(newState: T, metadata?: SnapshotMetadata): void {
        const patch = DiffEngine.createPatch(
            this.currentState,
            newState,
            this.options.excludeFields
        );

        // Don't create snapshot if nothing changed
        if (Object.keys(patch.changes).length === 0) {
            return;
        }

        const snapshot = SnapshotFactory.create(patch, {
            ...metadata,
            affectedFields: Object.keys(patch.changes),
        });

        // If we're not at the end of history, remove everything after current position
        if (!this.options.enableBranching && this.position < this.history.length - 1) {
            this.history = this.history.slice(0, this.position + 1);
        }

        // Add new snapshot
        this.history.push(snapshot);
        this.position++;

        // Enforce max history limit
        if (this.history.length > this.options.maxHistory) {
            const removeCount = this.history.length - this.options.maxHistory;
            this.history.splice(0, removeCount);
            this.position -= removeCount;
        }

        this.currentState = newState;
        this.options.onSnapshot(snapshot);
    }

    /**
     * Undo to previous state
     */
    undo(): T | null {
        if (!this.canUndo()) {
            return null;
        }

        // Flush any pending debounced snapshot
        this.flushPending();

        const currentSnapshot = this.history[this.position];
        if (!currentSnapshot) {
            return null;
        }

        const reversePatch = DiffEngine.reversePatch(currentSnapshot.patch);
        this.currentState = DiffEngine.applyPatch(this.currentState, reversePatch);
        this.position--;

        this.options.onUndo(currentSnapshot);
        return this.currentState;
    }

    /**
     * Redo to next state
     */
    redo(): T | null {
        if (!this.canRedo()) {
            return null;
        }

        this.position++;
        const snapshot = this.history[this.position];
        if (!snapshot) {
            return null;
        }

        this.currentState = DiffEngine.applyPatch(this.currentState, snapshot.patch);
        this.options.onRedo(snapshot);
        return this.currentState;
    }

    /**
     * Check if undo is possible
     */
    canUndo(): boolean {
        return this.position >= 0;
    }

    /**
     * Check if redo is possible
     */
    canRedo(): boolean {
        return this.position < this.history.length - 1;
    }

    /**
     * Pause history recording
     */
    pause(): void {
        this.isPaused = true;
    }

    /**
     * Resume history recording
     */
    resume(): void {
        this.isPaused = false;
    }

    /**
     * Clear all history
     */
    clear(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        this.pendingState = null;
        this.history = [];
        this.position = -1;
        this.options.onClear();
    }

    /**
     * Get current state
     */
    getCurrentState(): T {
        this.flushPending();
        return DiffEngine['deepClone'](this.currentState);
    }

    /**
     * Get history information
     */
    getInfo(): HistoryInfo {
        return {
            position: this.position,
            size: this.history.length,
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            isPaused: this.isPaused,
            snapshots: [...this.history],
        };
    }

    /**
     * Jump to a specific position in history
     */
    jumpTo(position: number): T | null {
        if (position < -1 || position >= this.history.length) {
            return null;
        }

        this.flushPending();

        // Reconstruct state at target position
        let state = DiffEngine['deepClone'](this.currentState);

        // Undo to start
        while (this.position >= 0) {
            const snapshot = this.history[this.position];
            if (snapshot) {
                const reversePatch = DiffEngine.reversePatch(snapshot.patch);
                state = DiffEngine.applyPatch(state, reversePatch);
            }
            this.position--;
        }

        // Redo to target position
        while (this.position < position) {
            this.position++;
            const snapshot = this.history[this.position];
            if (snapshot) {
                state = DiffEngine.applyPatch(state, snapshot.patch);
            }
        }

        this.currentState = state;
        return DiffEngine['deepClone'](this.currentState);
    }

    /**
     * Flush any pending debounced snapshot
     */
    private flushPending(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
            if (this.pendingState) {
                const state = this.pendingState;
                this.pendingState = null;
                this.createSnapshot(state);
            }
        }
    }

    /**
     * Destroy the history manager and cleanup
     */
    destroy(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        this.clear();
    }
}
