import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import {
    InvalidInvitationRoleError,
    InvalidInvitationTokenError,
    InvitationAlreadyAcceptedError,
    InvitationExpiredError,
    InvitationNotFoundError,
    InvitationRevokedError,
    InviterMismatchError,
} from '../../domain/invitation/Invitation.errors';
import type { AppEnv } from '../../types/app-env';
import { authenticationMiddleware } from '../middleware/authenticationMiddleware';
import { authorizationMiddleware } from '../middleware/authorizationMiddleware';
import { diMiddleware } from '../middleware/diMiddleware';

export const invitations = new Hono<AppEnv>()
    .use('*', diMiddleware)
    .post(
        '/accept',
        zValidator(
            'json',
            z.object({
                token: z.string().min(1),
                name: z.string().min(1),
                password: z.string().min(1),
            })
        ),
        async (c) => {
            const { token, name, password } = c.req.valid('json');

            const result = await c.var.di
                .get('acceptInvitationUseCase')
                .execute(token, name, password);

            return c.json(result);
        }
    )
    .use('*', authenticationMiddleware)
    .get(
        '/',
        zValidator('query', z.object({})),
        authorizationMiddleware({ invitation: ['list'] }),
        async (c) => {
            const auth = c.var.di.get('auth');
            const session = await auth.api.getSession({
                headers: c.req.raw.headers,
            });

            const user = session?.user;
            if (!user) {
                return c.json(
                    {
                        message: 'Unauthorized',
                    },
                    401
                );
            }
            const result = await c.var.di
                .get('listInvitationUseCase')
                .execute(user.id);

            return c.json(result);
        }
    )
    .get(
        '/:invitationId',
        zValidator('param', z.object({ invitationId: z.string().min(1) })),
        authorizationMiddleware({ invitation: ['read'] }),
        async (c) => {
            const invitationId = c.req.param('invitationId');

            const session = await c.var.di.get('auth').api.getSession({
                headers: c.req.raw.headers,
            });

            const user = session?.user;
            if (!user) {
                return c.json({ message: 'Unauthorized' }, 401);
            }

            const result = await c.var.di
                .get('detailInvitationUseCase')
                .execute(invitationId, user.id);

            if (!result) {
                return c.json(
                    {
                        message: 'Invitation not found',
                    },
                    404
                );
            }

            return c.json(result);
        }
    )
    .post(
        '/:invitationId/revoke',
        zValidator('param', z.object({ invitationId: z.string().min(1) })),
        authorizationMiddleware({ invitation: ['revoke'] }),
        async (c) => {
            const { invitationId } = c.req.valid('param');

            const session = await c.var.di.get('auth').api.getSession({
                headers: c.req.raw.headers,
            });

            const user = session?.user;
            if (!user) {
                return c.json({ message: 'Unauthorized' }, 401);
            }

            const result = await c.var.di
                .get('revokeInvitationUseCase')
                .execute(invitationId, user.id);

            return c.json(result);
        }
    )
    .post(
        '/',
        zValidator(
            'json',
            z.object({
                email: z.string().email(),
                role: z.enum(['admin', 'user']),
            })
        ),
        authorizationMiddleware({ invitation: ['create'] }),
        async (c) => {
            const session = await c.var.di.get('auth').api.getSession({
                headers: c.req.raw.headers,
            });

            const user = session?.user;
            if (!user) {
                return c.json({ message: 'Unauthorized' }, 401);
            }

            const { email, role } = c.req.valid('json');

            const result = await c.var.di
                .get('newInvitationUseCase')
                .execute(user.id, email, role);

            return c.json(result, 201);
        }
    )
    .post(
        '/:invitationId/resend',
        zValidator(
            'param',
            z.object({
                invitationId: z.string().min(1),
            })
        ),
        authorizationMiddleware({ invitation: ['resend'] }),
        async (c) => {
            const session = await c.var.di.get('auth').api.getSession({
                headers: c.req.raw.headers,
            });

            const user = session?.user;
            if (!user) {
                return c.json({ message: 'Unauthorized' }, 401);
            }

            const { invitationId } = c.req.valid('param');

            const result = await c.var.di
                .get('resendInvitationUseCase')
                .execute(invitationId, user.id);

            return c.json(result);
        }
    )
    .onError((error, c) => {
        if (error instanceof InvitationNotFoundError) {
            return c.json(
                {
                    code: 'INVITATION_NOT_FOUND',
                    message: 'Invitation not found.',
                },
                404
            );
        }

        if (error instanceof InvalidInvitationTokenError) {
            return c.json(
                {
                    code: 'INVALID_INVITATION_TOKEN',
                    message: 'Invitation token is invalid.',
                },
                400
            );
        }

        if (error instanceof InvalidInvitationRoleError) {
            return c.json(
                {
                    code: 'INVALID_INVITATION_ROLE',
                    message: 'Invitation role is invalid.',
                },
                400
            );
        }

        if (
            error instanceof InvitationExpiredError ||
            error instanceof InvitationRevokedError ||
            error instanceof InvitationAlreadyAcceptedError
        ) {
            return c.json(
                {
                    code:
                        error instanceof InvitationExpiredError
                            ? 'INVITATION_EXPIRED'
                            : error instanceof InvitationRevokedError
                              ? 'INVITATION_REVOKED'
                              : 'INVITATION_ALREADY_ACCEPTED',
                    message: error.message,
                },
                409
            );
        }

        if (error instanceof InviterMismatchError) {
            return c.json(
                {
                    code: 'INVITER_MISMATCH',
                    message: 'Forbidden.',
                },
                403
            );
        }

        return c.json(
            {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Internal server error.',
            },
            500
        );
    });
