import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authenticationMiddleware } from './authenticationMiddleware';

const { createAuthMock, getSessionMock, userHasPermissionMock } = vi.hoisted(
    () => ({
        createAuthMock: vi.fn(),
        getSessionMock: vi.fn(),
        userHasPermissionMock: vi.fn(),
    })
);

vi.mock('../../lib/auth/createAuth', () => ({
    createAuth: createAuthMock,
}));

const createProtectedApp = () => {
    const app = new Hono<{ Bindings: Env }>();
    app.use('/protected/*', authenticationMiddleware);
    app.get('/protected/ping', (c) => c.json({ status: 'ok' }));

    return app;
};

beforeEach(() => {
    getSessionMock.mockResolvedValue({
        session: { id: 'session-1' },
        user: { id: 'user-1', role: 'user' },
    });
    userHasPermissionMock.mockResolvedValue({
        success: true,
    });
    createAuthMock.mockReturnValue({
        api: {
            getSession: getSessionMock,
            userHasPermission: userHasPermissionMock,
        },
    });
});

describe('authenticationMiddleware', () => {
    it('セッションがない場合は 401 を返す', async () => {
        getSessionMock.mockResolvedValue(null);

        const res = await createProtectedApp().request(
            '/protected/ping',
            {},
            {} as Env
        );

        expect(res.status).toBe(401);
        expect(await res.json()).toEqual({ message: 'Unauthorized' });
    });

    it('セッションがある場合は後続の handler を実行する', async () => {
        const res = await createProtectedApp().request(
            '/protected/ping',
            {},
            {} as Env
        );

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ status: 'ok' });
    });
});
