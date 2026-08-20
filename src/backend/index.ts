import { Hono } from 'hono';
import type { ApplyGlobalResponse } from 'hono/client';
import { api } from './presentation/api/api';
import { diMiddleware } from './presentation/middleware/diMiddleware';

const app = new Hono().use('*', diMiddleware).route('/api', api);

export type GlobalErrorResponses = {
    401: {
        json: {
            code: 'UNAUTHORIZED';
            message: string;
        };
    };
    403: {
        json: {
            code: 'FORBIDDEN';
            message: string;
        };
    };
    422: {
        json: {
            code: 'INVALID_INPUT';
            message: Array<{
                field: string;
                message: string;
            }>;
        };
    };
    500: {
        json: {
            code: 'INTERNAL_SERVER_ERROR';
            message: string;
        };
    };
};

export type AppType = ApplyGlobalResponse<typeof app, GlobalErrorResponses>;

export default app;
