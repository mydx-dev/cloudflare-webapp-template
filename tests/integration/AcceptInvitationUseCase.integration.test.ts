import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { AcceptInvitationUseCase } from '../../src/backend/application/usecase/AcceptInvitationUseCase';
import { InvitationToken } from '../../src/backend/domain/invitation/InvitationToken';
import { AuthAccount } from '../../src/backend/infrastructure/auth/AuthAccount';
import { user } from '../../src/backend/infrastructure/db/authSchema';
import { db } from '../../src/backend/infrastructure/db/database';
import { domainMap } from '../../src/backend/infrastructure/domainMap/DomainMap';
import { invitationMap } from '../../src/backend/infrastructure/domainMap/invitationMap';
import { InvitationRepository } from '../../src/backend/infrastructure/repository/InvitationRepository';
import { auth } from '../../src/backend/lib/auth/auth.mock';

describe('AcceptInvitationUseCase integration', () => {
    it('ユーザーを作成し、招待を承認済みとして永続化する', async () => {
        const authContext = await auth.$context;
        const test = authContext.test;

        // 管理者ユーザーを直接テストDBへ作成
        const adminUser = test.createUser({
            id: 'admin-user-id',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
        });

        await test.saveUser(adminUser);
        const adminHeaders = await test.getAuthHeaders({
            userId: adminUser.id,
        });

        const repository = new InvitationRepository(db, domainMap);

        const plainToken = 'valid-token';
        const hashedToken = await new InvitationToken(plainToken, false).hash();

        const invitation = invitationMap.toDomain({
            id: 'invitation-id',
            email: 'invitee@example.com',
            createdAt: new Date(),
            role: 'user',
            inviterId: adminUser.id,
            status: 'pending',
            token: hashedToken.value,
            expiredAt: new Date(Date.now() + 60 * 60 * 1000),
        });

        // 本物のRepositoryでD1へ保存
        await repository.save(invitation);
        const authAccount = new AuthAccount(db, auth);

        const useCase = new AcceptInvitationUseCase(repository, authAccount);

        const result = await useCase.execute(
            plainToken,
            'Test User',
            'password123'
        );

        // Repositoryを通してDomainとして復元
        const savedInvitation = await repository.findById(invitation.id);

        // Better AuthのUserテーブルを直接確認
        const savedUser = await db
            .select()
            .from(user)
            .where(eq(user.email, 'invitee@example.com'))
            .get();

        expect(result).toEqual(
            expect.objectContaining({
                email: 'invitee@example.com',
                name: 'Test User',
                role: 'user',
            })
        );

        expect(savedUser).toEqual(
            expect.objectContaining({
                email: 'invitee@example.com',
                name: 'Test User',
                role: 'user',
            })
        );

        expect(savedInvitation).toEqual(
            expect.objectContaining({
                id: 'invitation-id',
                status: expect.objectContaining({
                    value: 'accepted',
                }),
            })
        );

        expect(savedInvitation.acceptedAt).toBeInstanceOf(Date);
    });
});
