import { Hono } from 'hono';
import { api } from './presentation/api/api';
import { diMiddleware } from './presentation/middleware/diMiddleware';

const app = new Hono();

app.use('*', diMiddleware);
app.route('/api', api);
export type AppType = typeof app;

export default app;
