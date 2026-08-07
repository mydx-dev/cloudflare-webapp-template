import { Hono } from 'hono';
import { auth } from '../../lib/auth/auth';
import type { AppEnv } from '../../types/app-env';
import { invitations } from './invitations';
import { users } from './users';

export const api = new Hono<AppEnv>();
api.on(['GET', 'POST'], '/auth/*', async (c) => {
    return auth.handler(c.req.raw);
});

api.get('/health', (c) => {
    return c.json({
        status: 'ok',
    });
});

api.route('/users', users);
api.route('/invitations', invitations);
