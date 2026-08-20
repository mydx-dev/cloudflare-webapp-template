import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppEnv } from '../../types/app-env';
import { authenticationMiddleware } from './authenticationMiddleware';

const getSessionMock = vi.fn();

const createProtectedApp = () => {
    const app = new Hono<AppEnv>();
    app.use('*', async (c, next) => {
        c.set('di', {
            get: () => ({
                api: {
                    getSession: getSessionMock,
                },
            }),
        } as unknown as AppEnv['Variables']['di']);
        await next();
    });
    app.use('/protected/*', authenticationMiddleware);
    app.get('/protected/ping', (c) => c.json({ status: 'ok' }));

    return app;
};

beforeEach(() => {
    getSessionMock.mockResolvedValue({
        session: { id: 'session-1' },
        user: { id: 'user-1', role: 'user' },
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
        expect(await res.json()).toEqual({
            code: 'UNAUTHORIZED',
            message: 'You are not authorized to access this resource.',
        });
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
