import { execSync, spawn } from 'node:child_process';

const port = 8787;
const baseUrl = `http://127.0.0.1:${port}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const killPort = () => {
    try {
        const pid = execSync(`lsof -ti :${port}`, {
            encoding: 'utf8',
        }).trim();

        if (!pid) {
            return;
        }

        for (const processId of pid.split('\n')) {
            process.kill(Number(processId), 'SIGTERM');
        }

        console.log(`[test:front] stopped process on :${port}`);
    } catch {
        // 何も起動していなければ何もしない
    }
};

const waitForWorker = async () => {
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

    throw new Error('Worker did not start.');
};

killPort();

const worker = spawn(
    'pnpm',
    [
        'wrangler',
        'dev',
        '--port',
        '--var',
        'TRUSTED_ORIGINS:http://localhost:5173,http://localhost:63315',
        String(port),
    ],
    {
        stdio: 'inherit',
    }
);

try {
    await waitForWorker();

    const vitest = spawn(
        'pnpm',
        ['vitest', 'run', '--config', 'vitest.browser.config.ts'],
        {
            stdio: 'inherit',
        }
    );

    const exitCode = await new Promise((resolve) => {
        vitest.once('exit', resolve);
    });

    if (exitCode !== 0) {
        process.exitCode = exitCode ?? 1;
    }
} finally {
    worker.kill('SIGTERM');
}
