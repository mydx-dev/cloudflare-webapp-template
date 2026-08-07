import { spawn } from 'node:child_process';

const port = 8791;
const url = `http://127.0.0.1:${port}`;

const worker = spawn(
    'pnpm',
    [
        'wrangler',
        'dev',
        'src/backend/infrastructure/db/seedLocalRunner.ts',
        '--local',
        '--port',
        String(port),
        '--show-interactive-dev-session=false',
    ],
    {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true,
    }
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
    let response;

    for (let attempt = 0; attempt < 30; attempt += 1) {
        try {
            response = await fetch(url);
            break;
        } catch {
            await sleep(200);
        }
    }

    if (!response) {
        throw new Error('Local seed worker did not start.');
    }

    if (!response.ok) {
        throw new Error(
            `Local seed failed: ${response.status} ${await response.text()}`
        );
    }

    console.log(await response.text());
} finally {
    worker.kill('SIGTERM');
}
