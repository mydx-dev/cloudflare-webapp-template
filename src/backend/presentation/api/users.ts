import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { UserNotFoundError } from '../../domain/user/User.errors';
import type { AppEnv } from '../../types/app-env';
import { authenticationMiddleware } from '../middleware/authenticationMiddleware';
import { authorizationMiddleware } from '../middleware/authorizationMiddleware';
import { diMiddleware } from '../middleware/diMiddleware';

const listUsersQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    page: z.coerce.number().int().min(1).optional(),
    searchField: z.enum(['email', 'name']).optional(),
    searchValue: z.string().trim().optional(),
    status: z.enum(['active', 'banned']).optional(),
});

const userIdParamSchema = z.object({
    id: z.string().min(1),
});

const setRoleBodySchema = z.object({
    role: z.enum(['user', 'manager', 'admin']),
});

const banUserBodySchema = z.object({
    banExpiresIn: z.number().int().positive().optional(),
    banReason: z.string().trim().min(1).max(500).optional(),
});

const revokeUserSessionBodySchema = z.object({
    sessionToken: z.string().min(1),
});

export const users = new Hono<AppEnv>()
    .use('*', diMiddleware)
    .use('*', authenticationMiddleware)
    .get(
        '/',
        zValidator('query', listUsersQuerySchema),
        authorizationMiddleware({ user: ['list'] }),
        async (c) => {
            const query = c.req.valid('query');
            const result = await c.var.di.get('listUserUseCase').execute({
                headers: c.req.raw.headers,
                limit: query.limit,
                offset: query.offset,
                page: query.page,
                searchField: query.searchField,
                searchValue: query.searchValue,
                status: query.status,
            });

            return c.json(result);
        }
    )
    .get(
        '/:id',
        zValidator('param', userIdParamSchema),
        authorizationMiddleware({ user: ['get'], session: ['list'] }),
        async (c) => {
            const { id } = c.req.valid('param');
            const result = await c.var.di.get('detailUserUseCase').execute({
                headers: c.req.raw.headers,
                userId: id,
            });

            return c.json(result);
        }
    )
    .patch(
        '/:id/role',
        zValidator('param', userIdParamSchema),
        zValidator('json', setRoleBodySchema),
        authorizationMiddleware({ user: ['set-role'] }),
        async (c) => {
            const { id } = c.req.valid('param');
            const { role } = c.req.valid('json');
            const result = await c.var.di.get('setUserRoleUseCase').execute({
                headers: c.req.raw.headers,
                role,
                userId: id,
            });

            return c.json(result);
        }
    )
    .post(
        '/:id/ban',
        zValidator('param', userIdParamSchema),
        zValidator('json', banUserBodySchema),
        authorizationMiddleware({ user: ['ban'] }),
        async (c) => {
            const { id } = c.req.valid('param');
            const body = c.req.valid('json');
            const result = await c.var.di.get('banUserUseCase').execute({
                banExpiresIn: body.banExpiresIn,
                banReason: body.banReason,
                headers: c.req.raw.headers,
                userId: id,
            });

            return c.json(result);
        }
    )
    .post(
        '/:id/unban',
        zValidator('param', userIdParamSchema),
        authorizationMiddleware({ user: ['ban'] }),
        async (c) => {
            const { id } = c.req.valid('param');
            const result = await c.var.di.get('unbanUserUseCase').execute({
                headers: c.req.raw.headers,
                userId: id,
            });

            return c.json(result);
        }
    )
    .delete(
        '/:id',
        zValidator('param', userIdParamSchema),
        authorizationMiddleware({ user: ['delete'] }),
        async (c) => {
            const { id } = c.req.valid('param');
            const result = await c.var.di.get('deleteUserUseCase').execute({
                headers: c.req.raw.headers,
                userId: id,
            });

            return c.json(result);
        }
    )
    .post(
        '/:id/sessions/revoke',
        zValidator('json', revokeUserSessionBodySchema),
        authorizationMiddleware({ session: ['revoke'] }),
        async (c) => {
            const { sessionToken } = c.req.valid('json');
            const result = await c.var.di
                .get('revokeUserSessionUseCase')
                .execute({
                    headers: c.req.raw.headers,
                    sessionToken,
                });

            return c.json(result);
        }
    )
    .onError((error, c) => {
        if (error instanceof UserNotFoundError) {
            return c.json(
                {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found.',
                },
                404
            );
        }

        return c.json(
            {
                error: 'Internal Server Error',
            },
            500
        );
    });
