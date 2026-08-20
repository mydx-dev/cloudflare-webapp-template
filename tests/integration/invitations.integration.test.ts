import { beforeAll, describe, expect, it } from 'vitest';
import { Invitation } from '../../src/backend/domain/invitation/Invitation';
import { InvitationExpiration } from '../../src/backend/domain/invitation/InvitationExpiration';
import { InvitationRole } from '../../src/backend/domain/invitation/InvitationRole';
import { InvitationStatus } from '../../src/backend/domain/invitation/InvitationStatus';
import { InvitationToken } from '../../src/backend/domain/invitation/InvitationToken';
import { Inviter } from '../../src/backend/domain/invitation/Inviter';
import { EmailAddress } from '../../src/backend/domain/shared/EmailAddress';
import app from '../../src/backend/index';
import { db } from '../../src/backend/infrastructure/db/database';
import { domainMap } from '../../src/backend/infrastructure/domainMap/DomainMap';
import { InvitationRepository } from '../../src/backend/infrastructure/repository/InvitationRepository';
import { auth } from '../../src/backend/lib/auth/auth.mock';

const invitationRepository = new InvitationRepository(db, domainMap);

const jsonHeaders = new Headers({
    'content-type': 'application/json',
});

const createInvitation = async ({
    inviterId,
    email = `invitee-${crypto.randomUUID()}@example.com`,
    role = 'user',
}: {
    inviterId: string;
    email?: string;
    role?: 'user' | 'admin';
}) => {
    const invitation = Invitation.create(email, inviterId, role);

    const plainToken = invitation.token.value;

    await invitationRepository.save(invitation);

    return {
        invitation,
        plainToken,
    };
};

const createExpiredInvitation = async ({
    inviterId,
    email = `expired-${crypto.randomUUID()}@example.com`,
}: {
    inviterId: string;
    email?: string;
}) => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');

    const invitation = new Invitation({
        id: crypto.randomUUID(),
        inviter: new Inviter(inviterId),
        invitee: new EmailAddress(email),
        role: new InvitationRole('user'),
        token: InvitationToken.generate(),
        status: new InvitationStatus('pending'),
        createdAt,
        expiration: new InvitationExpiration(
            new Date('2026-01-02T00:00:00.000Z')
        ),
        acceptedAt: null,
        revokedAt: null,
    });

    const plainToken = invitation.token.value;

    await invitationRepository.save(invitation);

    return {
        invitation,
        plainToken,
    };
};

const acceptInvitation = (
    token: string,
    {
        name = 'Invited User',
        password = 'password-123',
    }: {
        name?: string;
        password?: string;
    } = {}
) => {
    return app.request('/api/invitations/accept', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({
            token,
            name,
            password,
        }),
    });
};

describe('Invitations API', () => {
    let test: Awaited<typeof auth.$context>['test'];

    beforeAll(async () => {
        const context = await auth.$context;
        test = context.test;
    });

    describe('招待を承認する', () => {
        it('未認証の被招待者は有効な招待を承認できる', async () => {
            const admin = test.createUser({
                email: `admin-${crypto.randomUUID()}@example.com`,
                name: 'Admin User',
                role: 'admin',
                banned: false,
            });

            await test.saveUser(admin);

            const email = `accepted-${crypto.randomUUID()}@example.com`;
            const password = 'password-123';

            const { invitation, plainToken } = await createInvitation({
                inviterId: admin.id,
                email,
                role: 'user',
            });

            const response = await acceptInvitation(plainToken, {
                name: 'Accepted User',
                password,
            });

            expect(response.status).toBe(200);

            const accepted = await invitationRepository.findById(invitation.id);

            if (!accepted) {
                throw new Error('招待が見つかりません');
            }

            expect(accepted.status.value).toBe('accepted');
            expect(accepted.acceptedAt).not.toBeNull();

            // アカウントが本当に作成され、
            // 入力したパスワードでログインできることを確認する。
            const signInResponse = await app.request(
                '/api/auth/sign-in/email',
                {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        origin: 'http://localhost:5173',
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            expect(signInResponse.status).toBe(200);
            expect(signInResponse.headers.get('set-cookie')).toBeTruthy();

            await test.deleteUser(admin.id);
        });

        it('トークンが一致しない場合は400を返す', async () => {
            const admin = test.createUser({
                role: 'admin',
                banned: false,
            });

            await test.saveUser(admin);

            await createInvitation({
                inviterId: admin.id,
            });

            const response = await acceptInvitation('invalid-token');

            expect(response.status).toBe(400);

            await expect(response.json()).resolves.toEqual({
                code: 'INVALID_INVITATION_TOKEN',
                message: 'Invitation token is invalid.',
            });
            await test.deleteUser(admin.id);
        });

        it('有効期限を過ぎた招待は409を返す', async () => {
            const admin = test.createUser({
                role: 'admin',
                banned: false,
            });

            await test.saveUser(admin);

            const { plainToken } = await createExpiredInvitation({
                inviterId: admin.id,
            });

            const response = await acceptInvitation(plainToken);

            expect(response.status).toBe(409);

            await expect(response.json()).resolves.toEqual({
                code: 'INVITATION_EXPIRED',
                message: 'Invitation has expired.',
            });

            await test.deleteUser(admin.id);
        });

        it('取り消された招待は409を返す', async () => {
            const admin = test.createUser({
                role: 'admin',
                banned: false,
            });

            await test.saveUser(admin);

            const { invitation, plainToken } = await createInvitation({
                inviterId: admin.id,
            });

            const revoked = invitation.revoke(invitation.inviter.id);

            await invitationRepository.save(revoked);

            const response = await acceptInvitation(plainToken);

            expect(response.status).toBe(409);

            await expect(response.json()).resolves.toEqual({
                code: 'INVITATION_REVOKED',
                message: 'Invitation has been revoked.',
            });

            await test.deleteUser(admin.id);
        });

        it('承認済みの招待は409を返す', async () => {
            const admin = test.createUser({
                role: 'admin',
                banned: false,
            });

            await test.saveUser(admin);

            const email = `already-accepted-${crypto.randomUUID()}@example.com`;

            const { plainToken } = await createInvitation({
                inviterId: admin.id,
                email,
            });

            const firstResponse = await acceptInvitation(plainToken);

            expect(firstResponse.status).toBe(200);

            const secondResponse = await acceptInvitation(plainToken);

            expect(secondResponse.status).toBe(409);

            await expect(secondResponse.json()).resolves.toEqual({
                code: 'INVITATION_ALREADY_ACCEPTED',
                message: 'Invitation has already been accepted.',
            });

            await test.deleteUser(admin.id);
        });
    });

    describe('招待一覧を取得する', () => {
        it('管理者は自分が作成した招待一覧を取得できる', async () => {
            const admin = test.createUser({
                email: `admin-${crypto.randomUUID()}@example.com`,
                role: 'admin',
                banned: false,
            });

            await test.saveUser(admin);

            const target = await createInvitation({
                inviterId: admin.id,
                email: `list-${crypto.randomUUID()}@example.com`,
            });

            const headers = await test.getAuthHeaders({
                userId: admin.id,
            });

            const response = await app.request('/api/invitations', {
                headers,
            });

            expect(response.status).toBe(200);

            const result = await response.json<
                Array<{
                    id: string;
                    inviterId: string;
                    email: string;
                    status: string;
                    role: string;
                }>
            >();

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: target.invitation.id,
                        inviterId: admin.id,
                        email: target.invitation.invitee.value,
                        status: 'pending',
                        role: 'user',
                    }),
                ])
            );

            await test.deleteUser(admin.id);
        });

        it('未認証の場合は401を返す', async () => {
            const response = await app.request('/api/invitations');

            expect(response.status).toBe(401);
        });

        it('権限がない場合は403を返す', async () => {
            const user = test.createUser({
                role: 'user',
                banned: false,
            });

            await test.saveUser(user);

            const headers = await test.getAuthHeaders({
                userId: user.id,
            });

            const response = await app.request('/api/invitations', {
                headers,
            });

            expect(response.status).toBe(403);

            await test.deleteUser(user.id);
        });
    });

    describe('招待詳細を取得する', () => {
        it('管理者は指定した招待を取得できる', async () => {
            const admin = test.createUser({
                role: 'admin',
                banned: false,
            });

            await test.saveUser(admin);

            const { invitation } = await createInvitation({
                inviterId: admin.id,
                email: `detail-${crypto.randomUUID()}@example.com`,
                role: 'admin',
            });

            const headers = await test.getAuthHeaders({
                userId: admin.id,
            });

            const response = await app.request(
                `/api/invitations/${invitation.id}`,
                {
                    headers,
                }
            );

            expect(response.status).toBe(200);

            await expect(response.json()).resolves.toMatchObject({
                id: invitation.id,
                inviterId: admin.id,
                email: invitation.invitee.value,
                status: 'pending',
                role: 'admin',
            });

            await test.deleteUser(admin.id);
        });

        it('存在しない招待は404を返す', async () => {
            const admin = test.createUser({
                role: 'admin',
                banned: false,
            });

            await test.saveUser(admin);

            const headers = await test.getAuthHeaders({
                userId: admin.id,
            });

            const response = await app.request(
                '/api/invitations/missing-invitation',
                {
                    headers,
                }
            );

            expect(response.status).toBe(404);

            await expect(response.json()).resolves.toEqual({
                code: 'INVITATION_NOT_FOUND',
                message: 'Invitation not found.',
            });

            await test.deleteUser(admin.id);
        });
    });

    describe('招待を取り消す', () => {
        it('管理者は有効な招待を取り消せる', async () => {
            const admin = test.createUser({
                role: 'admin',
                banned: false,
            });

            await test.saveUser(admin);

            const { invitation } = await createInvitation({
                inviterId: admin.id,
                email: `revoke-${crypto.randomUUID()}@example.com`,
            });

            const headers = await test.getAuthHeaders({
                userId: admin.id,
            });

            headers.set('content-type', 'application/json');

            const response = await app.request(
                `/api/invitations/${invitation.id}/revoke`,
                {
                    method: 'POST',
                    headers,
                }
            );

            expect(response.status).toBe(200);

            const revoked = await invitationRepository.findById(invitation.id);

            if (!revoked) {
                throw new Error('招待が見つかりません');
            }

            expect(revoked.status.value).toBe('revoked');
            expect(revoked.revokedAt).not.toBeNull();

            await test.deleteUser(admin.id);
        });
    });
});
