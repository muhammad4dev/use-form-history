import type { Snapshot, SnapshotMetadata, Patch } from './types';

/**
 * Factory for creating snapshots
 */
export class SnapshotFactory {
    private static counter = 0;

    /**
     * Create a new snapshot
     */
    static create(
        patch: Patch,
        metadata?: SnapshotMetadata
    ): Snapshot {
        return {
            id: this.generateId(),
            timestamp: Date.now(),
            patch,
            metadata,
        };
    }

    /**
     * Generate a unique snapshot ID
     */
    private static generateId(): string {
        return `snapshot_${Date.now()}_${this.counter++}`;
    }
}
