import { spawn } from 'node:child_process';

const port = 8791;
const baseUrl = `http://127.0.0.1:${port}`;

const users = [
    {
        name: 'Local Admin',
        email: 'admin@example.com',
        role: 'admin',
    },
    {
        name: 'Local Manager',
        email: 'manager@example.com',
        role: 'manager',
    },
    {
        name: 'Local User',
        email: 'user@example.com',
        role: 'user',
    },
];

const password = 'Password123!';

const worker = spawn(
    'pnpm',
    [
        'wrangler',
        'dev',
        '--port',
        String(port),
        '--var',
        'SIGN_UP_ENABLED:true',
    ],
    {
        stdio: ['ignore', 'inherit', 'inherit'],
    }
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForWorker = async () => {
    for (let i = 0; i < 30; i++) {
        try {
            const response = await fetch(`${baseUrl}/api/health`);

            if (response.ok) {
                return;
            }
        } catch {}

        await sleep(200);
    }

    throw new Error('Local Worker did not start.');
};

const signUp = async (user) => {
    const response = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            origin: 'http://localhost:5173',
        },
        body: JSON.stringify({
            name: user.name,
            email: user.email,
            password,
        }),
    });

    if (response.ok) {
        console.log(`[seed] created: ${user.email}`);
        return;
    }

    const body = await response.text();

    if (!response.ok) {
        throw new Error(
            `[seed] failed: ${user.email}: ${response.status} ${body}`
        );
    }
    // 既存ユーザーなら冪等なので継続
    console.log(`[seed] response: ${response.status} ${body}`);
};

const updateRole = async (user) => {
    const sql =
        `UPDATE user SET role = '${user.role}' ` +
        `WHERE email = '${user.email}';`;

    const process = spawn(
        'pnpm',
        ['wrangler', 'd1', 'execute', 'DB', '--local', '--command', sql],
        {
            stdio: 'inherit',
        }
    );

    await new Promise((resolve, reject) => {
        process.once('exit', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Failed to set role: ${user.email}`));
            }
        });
    });

    console.log(`[seed] role: ${user.email} -> ${user.role}`);
};

try {
    await waitForWorker();

    for (const user of users) {
        await signUp(user);
        await updateRole(user);
    }

    console.log('[seed] completed');
} finally {
    worker.kill('SIGTERM');
}
