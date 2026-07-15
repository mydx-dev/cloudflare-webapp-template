import { Hono } from 'hono';

export const apiRoutes = new Hono().get('/health', (c) => {
    return c.json({
        status: 'ok',
    });
});
