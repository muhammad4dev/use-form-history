import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'dist/',
                'examples/',
                '**/*.config.ts',
                '**/*.d.ts',
                'src/core/types.ts',
            ],
            thresholds: {
                lines: 90,
                functions: 90,
                branches: 85,
                statements: 90,
            },
        },
    },
});
