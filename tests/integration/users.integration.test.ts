import type { TestHelpers } from 'better-auth/plugins';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/backend/index';
import { user } from '../../src/backend/infrastructure/db/authSchema';
import { db } from '../../src/backend/infrastructure/db/database';
import { auth } from '../../src/backend/lib/auth/auth.mock';

describe('Users API', () => {
    let test: TestHelpers;

    beforeAll(async () => {
        const context = await auth.$context;
        test = context.test;
    });

    beforeEach(async () => {
        await db.delete(user).execute();
    });

    it('管理者はユーザー一覧を取得できる', async () => {
        const admin = test.createUser({
            email: `admin-${crypto.randomUUID()}@example.com`,
            name: 'Admin User',
            role: 'admin',
            banned: false,
        });

        const target = test.createUser({
            email: `target-${crypto.randomUUID()}@example.com`,
            name: 'Target User',
            role: 'user',
            banned: false,
        });

        await test.saveUser(admin);
        await test.saveUser(target);

        const headers = await test.getAuthHeaders({
            userId: admin.id,
        });

        const response = await app.request('/api/users', {
            headers,
        });

        expect(response.status).toBe(200);

        const result = await response.json<{
            users: Array<{
                id: string;
                email: string;
            }>;
        }>();

        expect(result.users).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: target.id,
                    email: target.email,
                }),
            ])
        );
    });

    it('一般ユーザーはユーザー一覧を取得できない', async () => {
        const user = test.createUser({
            email: `user-${crypto.randomUUID()}@example.com`,
            role: 'user',
            banned: false,
        });

        await test.saveUser(user);

        const headers = await test.getAuthHeaders({
            userId: user.id,
        });

        const response = await app.request('/api/users', {
            headers,
        });

        expect(response.status).toBe(403);

        await test.deleteUser(user.id);
    });

    it('未認証の場合はユーザー一覧を取得できない', async () => {
        const response = await app.request('/api/users');

        expect(response.status).toBe(401);
    });

    it('管理者はユーザー詳細とセッション一覧を取得できる', async () => {
        const admin = test.createUser({
            email: `admin-${crypto.randomUUID()}@example.com`,
            role: 'admin',
            banned: false,
        });

        const target = test.createUser({
            email: `detail-${crypto.randomUUID()}@example.com`,
            role: 'user',
            banned: false,
        });

        await test.saveUser(admin);
        await test.saveUser(target);

        await test.login({
            userId: target.id,
        });

        const adminHeaders = await test.getAuthHeaders({
            userId: admin.id,
        });

        const response = await app.request(`/api/users/${target.id}`, {
            headers: adminHeaders,
        });

        expect(response.status).toBe(200);

        const result = await response.json<{
            user: {
                id: string;
                email: string;
            };
            sessions: Array<{
                userId: string;
            }>;
        }>();

        expect(result.user).toMatchObject({
            id: target.id,
            email: target.email,
        });

        expect(result.sessions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    userId: target.id,
                }),
            ])
        );

        await test.deleteUser(target.id);
        await test.deleteUser(admin.id);
    });

    it('管理者はユーザーのロールを変更できる', async () => {
        const admin = test.createUser({
            email: `admin-${crypto.randomUUID()}@example.com`,
            role: 'admin',
            banned: false,
        });

        const target = test.createUser({
            email: `role-${crypto.randomUUID()}@example.com`,
            role: 'user',
            banned: false,
        });

        await test.saveUser(admin);
        await test.saveUser(target);

        const headers = await test.getAuthHeaders({
            userId: admin.id,
        });
        headers.set('content-type', 'application/json');

        const response = await app.request(`/api/users/${target.id}/role`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                role: 'admin',
            }),
        });

        expect(response.status).toBe(200);

        const detailResponse = await app.request(`/api/users/${target.id}`, {
            headers,
        });

        expect(detailResponse.status).toBe(200);

        const detail = await detailResponse.json<{
            user: {
                role: string;
            };
        }>();

        expect(detail.user.role).toBe('admin');

        await test.deleteUser(target.id);
        await test.deleteUser(admin.id);
    });

    it('管理者はユーザーをBANできる', async () => {
        const admin = test.createUser({
            email: `admin-${crypto.randomUUID()}@example.com`,
            role: 'admin',
            banned: false,
        });

        const target = test.createUser({
            email: `ban-${crypto.randomUUID()}@example.com`,
            role: 'user',
            banned: false,
        });

        await test.saveUser(admin);
        await test.saveUser(target);

        const headers = await test.getAuthHeaders({
            userId: admin.id,
        });
        headers.set('content-type', 'application/json');

        const response = await app.request(`/api/users/${target.id}/ban`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                banReason: 'policy violation',
            }),
        });

        expect(response.status).toBe(200);

        const detailResponse = await app.request(`/api/users/${target.id}`, {
            headers,
        });

        const detail = await detailResponse.json<{
            user: {
                banned: boolean;
                banReason: string | null;
            };
        }>();

        expect(detail.user.banned).toBe(true);
        expect(detail.user.banReason).toBe('policy violation');

        await test.deleteUser(target.id);
        await test.deleteUser(admin.id);
    });

    it('管理者はユーザーのセッションを失効できる', async () => {
        const admin = test.createUser({
            email: `admin-${crypto.randomUUID()}@example.com`,
            role: 'admin',
            banned: false,
        });

        const target = test.createUser({
            email: `session-${crypto.randomUUID()}@example.com`,
            role: 'user',
            banned: false,
        });

        await test.saveUser(admin);
        await test.saveUser(target);

        const targetLogin = await test.login({
            userId: target.id,
        });

        const adminHeaders = await test.getAuthHeaders({
            userId: admin.id,
        });
        adminHeaders.set('content-type', 'application/json');

        const response = await app.request(
            `/api/users/${target.id}/sessions/revoke`,
            {
                method: 'POST',
                headers: adminHeaders,
                body: JSON.stringify({
                    sessionToken: targetLogin.token,
                }),
            }
        );

        expect(response.status).toBe(200);

        const session = await auth.api.getSession({
            headers: targetLogin.headers,
        });

        expect(session).toBeNull();

        await test.deleteUser(target.id);
        await test.deleteUser(admin.id);
    });

    it('管理者はユーザーを削除できる', async () => {
        const admin = test.createUser({
            email: `admin-${crypto.randomUUID()}@example.com`,
            role: 'admin',
            banned: false,
        });

        const target = test.createUser({
            email: `delete-${crypto.randomUUID()}@example.com`,
            role: 'user',
            banned: false,
        });

        await test.saveUser(admin);
        await test.saveUser(target);

        const headers = await test.getAuthHeaders({
            userId: admin.id,
        });

        const response = await app.request(`/api/users/${target.id}`, {
            method: 'DELETE',
            headers,
        });

        expect(response.status).toBe(200);

        const detailResponse = await app.request(`/api/users/${target.id}`, {
            headers,
        });

        expect(detailResponse.status).toBe(404);

        await test.deleteUser(admin.id);
    });
});
