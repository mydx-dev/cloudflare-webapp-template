import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import app from '../../src/backend/index';
import { auth } from '../../src/backend/lib/auth/auth.mock';

const authRequest = (
    path: string,
    body: Record<string, unknown>,
    testEnv: Env = env
) => {
    return app.request(
        `/api/auth${path}`,
        {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                origin: 'http://localhost:5173',
            },
            body: JSON.stringify(body),
        },
        testEnv
    );
};

const getSession = (cookie: string) => {
    return app.request(
        '/api/auth/get-session',
        {
            headers: {
                cookie,
            },
        },
        env
    );
};

const findPasswordResetToken = async (email: string) => {
    const verification = await env.DB.prepare(
        'SELECT identifier FROM verification WHERE value = (SELECT id FROM "user" WHERE email = ?) AND identifier LIKE ? ORDER BY created_at DESC LIMIT 1'
    )
        .bind(email, 'reset-password:%')
        .first<{ identifier: string }>();

    return verification?.identifier.replace('reset-password:', '');
};

describe('Auth API', () => {
    it('公開登録が無効な場合、メールアドレスによる登録を拒否する', async () => {
        const email = `disabled-${crypto.randomUUID()}@example.com`;
        const res = await authRequest('/sign-up/email', {
            name: 'Disabled Sign Up User',
            email,
            password: 'password-123',
        });

        expect(res.status).toBe(400);

        const user = await env.DB.prepare(
            'SELECT id FROM "user" WHERE email = ?'
        )
            .bind(email)
            .first();
        expect(user).toBeNull();
    });

    it('未登録メールアドレスへのパスワード再設定リクエストも成功レスポンスを返す', async () => {
        const res = await authRequest('/request-password-reset', {
            email: 'unknown@example.com',
            redirectTo: '/reset-password',
        });

        expect(res.status).toBe(200);
        expect(await res.json()).toMatchObject({
            status: true,
        });
    });

    it('パスワード再設定後に既存セッションが失効する', async () => {
        const email = `reset-${crypto.randomUUID()}@example.com`;
        const oldPassword = 'old-password-123';
        const newPassword = 'new-password-123';

        const context = await auth.$context;
        const test = context.test;

        const admin = test.createUser({
            email: `admin-${crypto.randomUUID()}@example.com`,
            name: 'Admin User',
            role: 'admin',
            banned: false,
        });

        await test.saveUser(admin);

        const adminHeaders = await test.getAuthHeaders({
            userId: admin.id,
        });

        await auth.api.createUser({
            headers: adminHeaders,
            body: {
                name: 'Reset User',
                email,
                password: oldPassword,
                role: 'user',
            },
        });

        const signInRes = await authRequest('/sign-in/email', {
            email,
            password: oldPassword,
        });

        expect(signInRes.status).toBe(200);

        const cookie = signInRes.headers.get('set-cookie');
        expect(cookie).toBeTruthy();

        const sessionBeforeReset = await getSession(cookie ?? '');

        expect(sessionBeforeReset.status).toBe(200);
        expect(await sessionBeforeReset.json()).toMatchObject({
            user: {
                email,
            },
        });

        const resetRequestRes = await authRequest('/request-password-reset', {
            email,
            redirectTo: '/reset-password',
        });

        expect(resetRequestRes.status).toBe(200);

        const token = await findPasswordResetToken(email);
        expect(token).toBeTruthy();

        const resetRes = await authRequest('/reset-password', {
            newPassword,
            token,
        });

        expect(resetRes.status).toBe(200);

        const sessionAfterReset = await getSession(cookie ?? '');

        expect(sessionAfterReset.status).toBe(200);
        expect(await sessionAfterReset.json()).toBeNull();

        await test.deleteUser(admin.id);
    });
});
