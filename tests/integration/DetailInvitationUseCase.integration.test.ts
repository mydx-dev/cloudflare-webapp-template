import { afterEach, describe, expect, it } from 'vitest';
import { DetailInvitationUseCase } from '../../src/backend/application/usecase/DetailInvitationUseCase';
import { invitationTable } from '../../src/backend/infrastructure/db/appSchema';
import { db } from '../../src/backend/infrastructure/db/database';
import { domainMap } from '../../src/backend/infrastructure/domainMap/DomainMap';
import { auth } from '../../src/backend/lib/auth/auth.mock';

afterEach(async () => {
    await db.delete(invitationTable).execute();
});

describe('招待詳細を取得する', () => {
    it('指定したIDの招待を取得できる', async () => {
        const test = (await auth.$context).test;

        const user = test.createUser({
            id: 'inviter-id',
        });
        await test.saveUser(user);

        await db
            .insert(invitationTable)
            .values({
                id: 'invitation-id',
                inviterId: 'inviter-id',
                email: 'invitee@example.com',
                role: 'user',
                status: 'pending',
                token: 'token',
                createdAt: new Date('2026-08-01T00:00:00.000Z'),
                expiredAt: new Date('2026-08-08T00:00:00.000Z'),
                acceptedAt: null,
                revokedAt: null,
            })
            .execute();

        const useCase = new DetailInvitationUseCase(db, domainMap);

        const result = await useCase.execute('invitation-id', 'inviter-id');

        expect(result).toMatchObject({
            id: 'invitation-id',
            inviterId: 'inviter-id',
            email: 'invitee@example.com',
            role: 'user',
            status: 'pending',
        });
    });

    it('存在しないIDの場合はエラーになる', async () => {
        const useCase = new DetailInvitationUseCase(db, domainMap);

        await expect(
            useCase.execute('missing-id', 'inviter-id')
        ).rejects.toThrow('Invitation not found');
    });
});
