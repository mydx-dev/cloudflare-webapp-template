import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppEnv } from '../../types/app-env';
import { authenticationMiddleware } from './authenticationMiddleware';
import { authorizationMiddleware } from './authorizationMiddleware';

const getSessionMock = vi.fn();
const userHasPermissionMock = vi.fn();

const createPermissionApp = () => {
    const app = new Hono<AppEnv>();
    app.use('*', async (c, next) => {
        c.set('di', {
            get: () => ({
                api: {
                    getSession: getSessionMock,
                    userHasPermission: userHasPermissionMock,
                },
            }),
        } as unknown as AppEnv['Variables']['di']);
        await next();
    });
    app.use('/users/*', authenticationMiddleware);
    app.use('/users/*', authorizationMiddleware({ user: ['update'] }));
    app.get('/users/:id', (c) => c.json({ status: 'ok' }));

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
});

describe('authorizationMiddleware', () => {
    it('未認証の場合は 401 を返す', async () => {
        getSessionMock.mockResolvedValue(null);

        const res = await createPermissionApp().request(
            '/users/user-1',
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
            '/users/user-1',
            {},
            {} as Env
        );

        expect(res.status).toBe(403);
        expect(await res.json()).toEqual({ message: 'Forbidden' });
    });

    it('権限がある場合は後続の handler を実行する', async () => {
        const res = await createPermissionApp().request(
            '/users/user-1',
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
