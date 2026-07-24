import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import app from '../../index';

const setupAuthTables = async () => {
    await env.DB.batch([
        env.DB.prepare('PRAGMA foreign_keys = ON'),
        env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS "user" (
                id text PRIMARY KEY NOT NULL,
                name text NOT NULL,
                email text NOT NULL,
                email_verified integer DEFAULT false NOT NULL,
                image text,
                created_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
                updated_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
            )
        `),
        env.DB.prepare(
            'CREATE UNIQUE INDEX IF NOT EXISTS user_email_unique ON "user" (email)'
        ),
        env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS account (
                id text PRIMARY KEY NOT NULL,
                account_id text NOT NULL,
                provider_id text NOT NULL,
                user_id text NOT NULL,
                access_token text,
                refresh_token text,
                id_token text,
                access_token_expires_at integer,
                refresh_token_expires_at integer,
                scope text,
                password text,
                created_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
                updated_at integer NOT NULL,
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE cascade
            )
        `),
        env.DB.prepare(
            'CREATE INDEX IF NOT EXISTS account_userId_idx ON account (user_id)'
        ),
        env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS session (
                id text PRIMARY KEY NOT NULL,
                expires_at integer NOT NULL,
                token text NOT NULL,
                created_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
                updated_at integer NOT NULL,
                ip_address text,
                user_agent text,
                user_id text NOT NULL,
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE cascade
            )
        `),
        env.DB.prepare(
            'CREATE UNIQUE INDEX IF NOT EXISTS session_token_unique ON session (token)'
        ),
        env.DB.prepare(
            'CREATE INDEX IF NOT EXISTS session_userId_idx ON session (user_id)'
        ),
        env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS verification (
                id text PRIMARY KEY NOT NULL,
                identifier text NOT NULL,
                value text NOT NULL,
                expires_at integer NOT NULL,
                created_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
                updated_at integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
            )
        `),
        env.DB.prepare(
            'CREATE INDEX IF NOT EXISTS verification_identifier_idx ON verification (identifier)'
        ),
        env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS jwks (
                id text PRIMARY KEY NOT NULL,
                public_key text NOT NULL,
                private_key text NOT NULL,
                created_at integer NOT NULL,
                expires_at integer
            )
        `),
    ]);
};

const authRequest = (path: string, body: Record<string, unknown>) => {
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
        env
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
    beforeAll(setupAuthTables);

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

        const signUpRes = await authRequest('/sign-up/email', {
            name: 'Reset User',
            email,
            password: oldPassword,
        });
        expect(signUpRes.status).toBe(200);

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
    });
});
