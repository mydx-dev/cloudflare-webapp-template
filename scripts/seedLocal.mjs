import { execFileSync, spawn } from 'node:child_process';
import net from 'node:net';
import { pathToFileURL } from 'node:url';

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
                return;
            }
        } catch {}

        await sleep(200);
    }

    throw new Error('Local Worker did not start.');
};

const updateRole = (user, persistTo) => {
    const sql =
        `UPDATE user SET role = '${user.role}' ` +
        `WHERE email = '${user.email}';`;

    const args = [
        'wrangler',
        'd1',
        'execute',
        'DB',
        '--local',
        '--command',
        sql,
    ];

    if (persistTo) {
        args.push('--persist-to', persistTo);
    }

    execFileSync('pnpm', args, {
        stdio: 'inherit',
    });

    console.log(`[seed] role: ${user.email} -> ${user.role}`);
};

export const seedUsers = async ({ baseUrl, persistTo }) => {
    for (const user of users) {
        const response = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                origin: baseUrl,
            },
            body: JSON.stringify({
                name: user.name,
                email: user.email,
                password,
            }),
        });

        if (response.ok) {
            console.log(`[seed] created: ${user.email}`);
        } else {
            const body = await response.json();

            if (body.code !== 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
                throw new Error(
                    `[seed] failed: ${user.email}: ${response.status} ${JSON.stringify(body)}`
                );
            }

            console.log(`[seed] already exists: ${user.email}`);
        }

        updateRole(user, persistTo);
    }

    console.log('[seed] completed');
};

const isExecutedDirectly =
    process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isExecutedDirectly) {
    const port = await getFreePort();
    const baseUrl = `http://127.0.0.1:${port}`;

    const worker = spawn(
        'pnpm',
        [
            'wrangler',
            'dev',
            '--ip',
            '127.0.0.1',
            '--port',
            String(port),
            '--var',
            `BETTER_AUTH_URL:${baseUrl}`,
            '--var',
            'SIGN_UP_ENABLED:true',
            '--var',
            `TRUSTED_ORIGINS:${baseUrl}`,
        ],
        {
            stdio: 'inherit',
        }
    );

    try {
        await waitForWorker(baseUrl);

        await seedUsers({
            baseUrl,
        });
    } finally {
        worker.kill('SIGTERM');
    }
}
