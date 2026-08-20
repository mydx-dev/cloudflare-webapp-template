import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../../types/app-env';
import { unauthorizedErrorResponse } from '../http/unauthorizedErrorResponse';

export const authenticationMiddleware = createMiddleware<AppEnv>(
    async (c, next) => {
        const auth = c.var.di.get('auth');

        const session = await auth.api.getSession({
            headers: c.req.raw.headers,
        });

        if (!session) {
            return unauthorizedErrorResponse(c);
        }

        c.set('user', session.user);
        c.set('session', session.session);

        await next();
    }
);
