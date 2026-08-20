import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            browser: {
                enabled: true,
                provider: playwright(),
                instances: [{ browser: 'chromium' }],
                headless: true,
                api: {
                    host: '127.0.0.1',
                    port: Number(process.env.TEST_FRONT_PORT),
                    strictPort: true,
                },
            },
        },
        server: {
            proxy: {
                '/api': {
                    target: process.env.TEST_API_URL,
                    changeOrigin: true,
                },
            },
        },
    })
);
