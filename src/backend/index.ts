import { Hono } from 'hono';
import { apiRoutes } from './presentation/api/apiRoutes';
import { authMiddleware } from './presentation/middleware/authMiddleware';

const app = new Hono<{ Bindings: Env }>();
app.on(['GET', 'POST'], '/api/auth/*', authMiddleware);
app.route('/api', apiRoutes);
export type AppType = typeof app;

export default app;
