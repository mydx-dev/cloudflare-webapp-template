import { Hono } from 'hono';
import { authHandler } from '../handler/authHandler';

export const api = new Hono();
api.on(['GET', 'POST'], '/auth/*', authHandler);

api.get('/health', (c) => {
    return c.json({
        status: 'ok',
    });
});
