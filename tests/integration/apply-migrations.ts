import type { readD1Migrations } from '@cloudflare/vitest-pool-workers/';
import { applyD1Migrations } from 'cloudflare:test';
import { env } from 'cloudflare:workers';

export const testEnv = env as typeof env & {
    TEST_MIGRATIONS: Awaited<ReturnType<typeof readD1Migrations>>;
};

await applyD1Migrations(testEnv.DB, testEnv.TEST_MIGRATIONS);
