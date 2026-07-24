import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
    root: fileURLToPath(new URL('./src/frontend', import.meta.url)),

    plugins: [react(), tailwindcss()],

    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8787',
                changeOrigin: true,
            },
        },
    },

    build: {
        outDir: fileURLToPath(new URL('./dist', import.meta.url)),
        emptyOutDir: true,
    },

    resolve: {
        alias: [
            {
                find: /^@\//,
                replacement:
                    fileURLToPath(new URL('./src/frontend', import.meta.url)) +
                    '/',
            },
        ],
    },

    optimizeDeps: {
        include: ['better-auth/client/plugins', 'better-auth/plugins/access'],
    },
});
