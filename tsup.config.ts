import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        'core/index': 'src/core/index.ts',
        'react/index': 'src/react/index.ts',
        'vanilla/index': 'src/vanilla/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: {
        resolve: true,
    },
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: false,
    external: ['react'],
    bundle: true,
});
