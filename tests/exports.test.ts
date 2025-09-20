import { describe, it, expect } from 'vitest';

describe('Package Exports', () => {
    describe('Main entry point', () => {
        it('should export core modules', async () => {
            const mainExports = await import('../src/index');

            expect(mainExports.HistoryManager).toBeDefined();
            expect(mainExports.DiffEngine).toBeDefined();
            expect(mainExports.SnapshotFactory).toBeDefined();
        });

        it('should export React hooks', async () => {
            const mainExports = await import('../src/index');

            expect(mainExports.useFormHistory).toBeDefined();
            expect(mainExports.useFieldHistory).toBeDefined();
            expect(mainExports.FormHistoryProvider).toBeDefined();
            expect(mainExports.useFormHistoryContext).toBeDefined();
            expect(mainExports.useKeyboardShortcuts).toBeDefined();
        });

        it('should export vanilla JS API', async () => {
            const mainExports = await import('../src/index');

            expect(mainExports.createFormHistory).toBeDefined();
            expect(mainExports.bindFormHistory).toBeDefined();
        });
    });

    describe('Core entry point', () => {
        it('should export core classes', async () => {
            const coreExports = await import('../src/core/index');

            expect(coreExports.HistoryManager).toBeDefined();
            expect(coreExports.DiffEngine).toBeDefined();
            expect(coreExports.SnapshotFactory).toBeDefined();
        });
    });

    describe('React entry point', () => {
        it('should export React hooks', async () => {
            const reactExports = await import('../src/react/index');

            expect(reactExports.useFormHistory).toBeDefined();
            expect(reactExports.useFieldHistory).toBeDefined();
            expect(reactExports.FormHistoryProvider).toBeDefined();
            expect(reactExports.useFormHistoryContext).toBeDefined();
            expect(reactExports.useKeyboardShortcuts).toBeDefined();
        });
    });

    describe('Vanilla entry point', () => {
        it('should export vanilla API', async () => {
            const vanillaExports = await import('../src/vanilla/index');

            expect(vanillaExports.createFormHistory).toBeDefined();
            expect(vanillaExports.bindFormHistory).toBeDefined();
        });
    });
});
