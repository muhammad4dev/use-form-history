// Core exports
export { HistoryManager, DiffEngine, SnapshotFactory } from './core';
export type { Snapshot, SnapshotMetadata, Patch, HistoryOptions, HistoryInfo } from './core';

// React exports (optional peer dependency)
export {
    useFormHistory,
    useFieldHistory,
    FormHistoryProvider,
    useFormHistoryContext,
    useKeyboardShortcuts,
} from './react';
export type {
    UseFormHistoryReturn,
    UseFieldHistoryReturn,
    KeyboardShortcutsOptions,
} from './react';

// Vanilla exports
export { createFormHistory, bindFormHistory } from './vanilla';
export type { FormHistory } from './vanilla';
