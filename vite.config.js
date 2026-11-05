import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    build: {
        chunkSizeWarningLimit: 800,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('lodash')) {
                            return 'vendor-lodash';
                        }
                        if (id.includes('@headlessui')) {
                            return 'vendor-ui';
                        }
                        if (id.includes('axios') || id.includes('qs')) {
                            return 'vendor-http';
                        }
                    }
                },
            },
        },
    },
});
