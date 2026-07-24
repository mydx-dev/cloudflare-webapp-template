import { Hono } from 'hono';
import { authHandler } from '../handler/authHandler';
import { authenticationMiddleware } from '../middleware/authenticationMiddleware';

export const api = new Hono<{ Bindings: Env }>();
api.on(['GET', 'POST'], '/auth/*', authHandler);

api.get('/health', (c) => {
    return c.json({
        status: 'ok',
    });
});

api.use('/*', authenticationMiddleware);
