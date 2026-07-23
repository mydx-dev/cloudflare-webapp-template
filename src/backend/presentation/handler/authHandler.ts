import { Handler } from 'hono';
import { createAuth } from '../../lib/auth/createAuth';

export const authHandler: Handler = (c) => {
    const baseURL = new URL(c.req.url).origin;
    const auth = createAuth(c.env, baseURL);

    return auth.handler(c.req.raw);
};
