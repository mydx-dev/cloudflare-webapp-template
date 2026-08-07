import type { MiddlewareHandler } from 'hono';
import { AppEnv } from '../../types/app-env';

export const authenticationMiddleware: MiddlewareHandler<AppEnv> = async (
    c,
    next
) => {
    const auth = c.var.di.get('auth');
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    if (!session) {
        return c.json(
            {
                message: 'Unauthorized',
            },
            401
        );
    }

    c.set('user', session.user);
    c.set('session', session.session);

    await next();
};
