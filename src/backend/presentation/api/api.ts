import { Hono } from 'hono';
import type { AppEnv } from '../../types/app-env';
import { authHandler } from '../handler/authHandler';
import { users } from './users';

export const api = new Hono<AppEnv>();
api.on(['GET', 'POST'], '/auth/*', authHandler);

api.get('/health', (c) => {
    return c.json({
        status: 'ok',
    });
});

api.route('/users', users);
