/**
 * Core types for the form history library
 */

/**
 * Represents a single change in the history stack
 */
export interface Snapshot {
    /** Unique identifier for this snapshot */
    id: string;
    /** Timestamp when snapshot was created */
    timestamp: number;
    /** Diff patch representing changes from previous state */
    patch: Patch;
    /** Optional metadata about the change */
    metadata?: SnapshotMetadata;
}

/**
 * Metadata associated with a snapshot
 */
export interface SnapshotMetadata {
    /** Fields that were changed */
    affectedFields?: string[];
    /** Optional description of the change */
    description?: string;
    /** Custom user data */
    [key: string]: unknown;
}

/**
 * Represents a change between two states
 */
export interface Patch {
    /** Type of change operation */
    type: 'update' | 'replace';
    /** Changed values (field path -> new value) */
    changes: Record<string, unknown>;
    /** Previous values (for undo) */
    previous?: Record<string, unknown>;
}

/**
 * Configuration options for HistoryManager
 */
export interface HistoryOptions {
    /** Maximum number of snapshots to keep (default: 50) */
    maxHistory?: number;
    /** Debounce delay in milliseconds (default: 500) */
    debounceMs?: number;
    /** Callback when a snapshot is created */
    onSnapshot?: (snapshot: Snapshot) => void;
    /** Callback when undo is performed */
    onUndo?: (snapshot: Snapshot) => void;
    /** Callback when redo is performed */
    onRedo?: (snapshot: Snapshot) => void;
    /** Callback when history is cleared */
    onClear?: () => void;
    /** Fields to exclude from history tracking */
    excludeFields?: string[];
    /** Enable branching history (like Git) */
    enableBranching?: boolean;
}

/**
 * History state information
 */
export interface HistoryInfo {
    /** Current position in history stack */
    position: number;
    /** Total number of snapshots */
    size: number;
    /** Can undo to previous state */
    canUndo: boolean;
    /** Can redo to next state */
    canRedo: boolean;
    /** Is recording paused */
    isPaused: boolean;
    /** All snapshots (read-only) */
    snapshots: ReadonlyArray<Snapshot>;
}
