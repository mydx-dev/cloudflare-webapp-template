import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import app from '../../index';

describe('Auth API', () => {
    beforeAll(async () => {
        await env.DB.batch([
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
        ]);
    });

    it('未登録メールアドレスへのパスワード再設定リクエストも成功レスポンスを返す', async () => {
        const res = await app.request(
            '/api/auth/request-password-reset',
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    origin: 'http://localhost:5173',
                },
                body: JSON.stringify({
                    email: 'unknown@example.com',
                    redirectTo: '/reset-password',
                }),
            },
            env
        );

        expect(res.status).toBe(200);
        expect(await res.json()).toMatchObject({
            status: true,
        });
    });
});
