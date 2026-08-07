import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [
        cloudflareTest({
            wrangler: {
                configPath: './wrangler.jsonc',
            },
        }),
    ],
    test: {
        exclude: [
            '**/*.integration.test.ts',
            '**/*.integration.spec.ts',
            'node_modules/**',
        ],
        coverage: {
            provider: 'istanbul',
        },
    },
});
