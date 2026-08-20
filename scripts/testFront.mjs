import { execFileSync, spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import net from 'node:net';
import { seedUsers } from './seedLocal.mjs';

const persistTo = '.wrangler/test-front';

const getFreePort = () =>
    new Promise((resolve, reject) => {
        const server = net.createServer();

        server.once('error', reject);

        server.listen(0, '127.0.0.1', () => {
            const address = server.address();

            if (!address || typeof address === 'string') {
                server.close();
                reject(new Error('Failed to get free port.'));
                return;
            }

            server.close(() => resolve(address.port));
        });
    });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForWorker = async (baseUrl) => {
    for (let i = 0; i < 50; i++) {
        try {
            const response = await fetch(`${baseUrl}/api/health`);

            if (response.ok) {
                console.log('[test:front] Worker ready');
                return;
            }
        } catch {}

        await sleep(200);
    }

    throw new Error('[test:front] Worker did not start.');
};

const stop = (child) => {
    if (!child.pid) {
        return;
    }

    try {
        child.kill('SIGTERM');
    } catch {}
};

rmSync(persistTo, {
    recursive: true,
    force: true,
});

execFileSync(
    'pnpm',
    [
        'wrangler',
        'd1',
        'migrations',
        'apply',
        'DB',
        '--local',
        '--persist-to',
        persistTo,
    ],
    {
        stdio: 'inherit',
    }
);

const seedWorkerPort = await getFreePort();
const seedWorkerOrigin = `http://127.0.0.1:${seedWorkerPort}`;

const seedWorker = spawn(
    'pnpm',
    [
        'wrangler',
        'dev',
        '--ip',
        '127.0.0.1',
        '--port',
        String(seedWorkerPort),
        '--persist-to',
        persistTo,
        '--var',
        `BETTER_AUTH_URL:${seedWorkerOrigin}`,
        '--var',
        'SIGN_UP_ENABLED:true',
        '--var',
        `TRUSTED_ORIGINS:${seedWorkerOrigin}`,
    ],
    {
        stdio: 'inherit',
    }
);

try {
    await waitForWorker(seedWorkerOrigin);

    await seedUsers({
        baseUrl: seedWorkerOrigin,
        persistTo,
    });
} finally {
    stop(seedWorker);
}

const workerPort = await getFreePort();
const frontPort = await getFreePort();

const workerOrigin = `http://127.0.0.1:${workerPort}`;
const frontOrigin = `http://127.0.0.1:${frontPort}`;

const worker = spawn(
    'pnpm',
    [
        'wrangler',
        'dev',
        '--ip',
        '127.0.0.1',
        '--port',
        String(workerPort),
        '--persist-to',
        persistTo,
        '--var',
        `BETTER_AUTH_URL:${workerOrigin}`,
        '--var',
        'SIGN_UP_ENABLED:false',
        '--var',
        `TRUSTED_ORIGINS:${frontOrigin}`,
    ],
    {
        stdio: 'inherit',
    }
);

try {
    await waitForWorker(workerOrigin);

    const vitest = spawn(
        'pnpm',
        ['vitest', 'run', '--config', 'vitest.browser.config.ts'],
        {
            stdio: 'inherit',
            env: {
                ...process.env,
                TEST_FRONT_PORT: String(frontPort),
                TEST_API_URL: workerOrigin,
            },
        }
    );

    const exitCode = await new Promise((resolve) => {
        vitest.once('exit', resolve);
    });

    if (exitCode !== 0) {
        process.exitCode = exitCode ?? 1;
    }
} finally {
    stop(worker);
}
