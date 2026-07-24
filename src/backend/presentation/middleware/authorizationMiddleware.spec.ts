import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authorizationMiddleware } from './authorizationMiddleware';

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

const createPermissionApp = () => {
    const app = new Hono<{ Bindings: Env }>();
    app.use('/admin/*', authorizationMiddleware({ user: ['update'] }));
    app.get('/admin/users', (c) => c.json({ status: 'ok' }));

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

describe('authorizationMiddleware', () => {
    it('未認証の場合は 401 を返す', async () => {
        getSessionMock.mockResolvedValue(null);

        const res = await createPermissionApp().request(
            '/admin/users',
            {},
            {} as Env
        );

        expect(res.status).toBe(401);
        expect(userHasPermissionMock).not.toHaveBeenCalled();
    });

    it('権限がない場合は 403 を返す', async () => {
        userHasPermissionMock.mockResolvedValue({
            success: false,
        });

        const res = await createPermissionApp().request(
            '/admin/users',
            {},
            {} as Env
        );

        expect(res.status).toBe(403);
        expect(await res.json()).toEqual({ message: 'Forbidden' });
    });

    it('権限がある場合は後続の handler を実行する', async () => {
        const res = await createPermissionApp().request(
            '/admin/users',
            {},
            {} as Env
        );

        expect(res.status).toBe(200);
        expect(userHasPermissionMock).toHaveBeenCalledWith({
            headers: expect.any(Headers),
            body: {
                permissions: { user: ['update'] },
            },
        });
    });
});
