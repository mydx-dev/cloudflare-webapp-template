import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../../types/app-env';
import { applicationErrorResponse } from '../http/applicationErrorResponse';
import { internalServerErrorResponse } from '../http/internalServerErrorResponse';
import { validationErrorResponse } from '../http/validationErrorResponse';
import { authenticationMiddleware } from '../middleware/authenticationMiddleware';
import { authorizationMiddleware } from '../middleware/authorizationMiddleware';
import { diMiddleware } from '../middleware/diMiddleware';

export const invitationErrorCodes = {
    INVITATION_NOT_FOUND: 404,
    INVALID_INVITATION_TOKEN: 400,
    INVALID_INVITATION_ROLE: 400,
    INVITATION_EXPIRED: 409,
    INVITATION_REVOKED: 409,
    INVITATION_ALREADY_ACCEPTED: 409,
    INVITER_MISMATCH: 403,
} as const;

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
            }),
            (result, c) => validationErrorResponse(result, c)
        ),
        async (c) => {
            const { token, name, password } = c.req.valid('json');
            const useCase = c.var.di.get('acceptInvitationUseCase');

            try {
                const result = await useCase.execute(token, name, password);

                return c.json(result, 200);
            } catch (error) {
                return (
                    applicationErrorResponse(
                        error,
                        c,
                        useCase.errorCodes,
                        invitationErrorCodes
                    ) ?? internalServerErrorResponse(c)
                );
            }
        }
    )
    .use('*', authenticationMiddleware)
    .get(
        '/',
        zValidator('query', z.object({}), (result, c) =>
            validationErrorResponse(result, c)
        ),
        authorizationMiddleware({ invitation: ['list'] }),
        async (c) => {
            const usecase = c.var.di.get('listInvitationUseCase');
            try {
                const result = await usecase.execute(c.var.user.id);

                return c.json(result, 200);
            } catch (error) {
                return (
                    applicationErrorResponse(
                        error,
                        c,
                        usecase.errorCodes,
                        invitationErrorCodes
                    ) ?? internalServerErrorResponse(c)
                );
            }
        }
    )
    .get(
        '/:invitationId',
        zValidator(
            'param',
            z.object({ invitationId: z.string().min(1) }),
            (result, c) => validationErrorResponse(result, c)
        ),
        authorizationMiddleware({ invitation: ['read'] }),
        async (c) => {
            const { invitationId } = c.req.valid('param');

            try {
                const result = await c.var.di
                    .get('detailInvitationUseCase')
                    .execute(invitationId, c.var.user.id);

                return c.json(result, 200);
            } catch (error) {
                return (
                    applicationErrorResponse(
                        error,
                        c,
                        c.var.di.get('detailInvitationUseCase').errorCodes,
                        invitationErrorCodes
                    ) ?? internalServerErrorResponse(c)
                );
            }
        }
    )
    .post(
        '/:invitationId/revoke',
        zValidator(
            'param',
            z.object({ invitationId: z.string().min(1) }),
            (result, c) => validationErrorResponse(result, c)
        ),
        authorizationMiddleware({ invitation: ['revoke'] }),
        async (c) => {
            const { invitationId } = c.req.valid('param');
            const useCase = c.var.di.get('revokeInvitationUseCase');

            try {
                const result = await useCase.execute(
                    invitationId,
                    c.var.user.id
                );

                return c.json(result, 200);
            } catch (error) {
                return (
                    applicationErrorResponse(
                        error,
                        c,
                        useCase.errorCodes,
                        invitationErrorCodes
                    ) ?? internalServerErrorResponse(c)
                );
            }
        }
    )
    .post(
        '/',
        zValidator(
            'json',
            z.object({
                email: z.string().email(),
                role: z.enum(['admin', 'user']),
            }),
            (result, c) => validationErrorResponse(result, c)
        ),
        authorizationMiddleware({ invitation: ['create'] }),
        async (c) => {
            const { email, role } = c.req.valid('json');
            const useCase = c.var.di.get('newInvitationUseCase');

            try {
                const result = await useCase.execute(
                    c.var.user.id,
                    email,
                    role
                );

                return c.json(result, 201);
            } catch (error) {
                return (
                    applicationErrorResponse(
                        error,
                        c,
                        useCase.errorCodes,
                        invitationErrorCodes
                    ) ?? internalServerErrorResponse(c)
                );
            }
        }
    )
    .post(
        '/:invitationId/resend',
        zValidator(
            'param',
            z.object({
                invitationId: z.string().min(1),
            }),
            (result, c) => validationErrorResponse(result, c)
        ),
        authorizationMiddleware({ invitation: ['resend'] }),
        async (c) => {
            const { invitationId } = c.req.valid('param');
            const useCase = c.var.di.get('resendInvitationUseCase');
            try {
                const result = await useCase.execute(
                    invitationId,
                    c.var.user.id
                );

                return c.json(result, 200);
            } catch (error) {
                console.log('Error in resend invitation:', error);

                const response = applicationErrorResponse(
                    error,
                    c,
                    useCase.errorCodes,
                    invitationErrorCodes
                );

                console.log('applicationErrorResponse:', response?.status);

                if (response) {
                    return response;
                }

                const internalResponse = internalServerErrorResponse(c);

                console.log(
                    'internalServerErrorResponse:',
                    internalResponse.status
                );

                return internalResponse;
            }
        }
    );
