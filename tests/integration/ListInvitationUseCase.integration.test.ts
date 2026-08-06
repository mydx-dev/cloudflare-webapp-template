import { describe, expect, it } from 'vitest';
import { ListInvitationUseCase } from '../../src/backend/application/usecase/ListInvitationUseCase';
import { invitationTable } from '../../src/backend/infrastructure/db/appSchema';
import { db } from '../../src/backend/infrastructure/db/database';
import { domainMap } from '../../src/backend/infrastructure/domainMap/DomainMap';
import { auth } from '../../src/backend/lib/auth/auth.mock';

describe('招待一覧を取得する', () => {
    it('招待者のIDで招待一覧を取得できる', async () => {
        const test = (await auth.$context).test;

        const user = test.createUser({
            id: 'inviter-id',
        });
        const user2 = test.createUser({
            id: 'inviter-id-2',
        });

        await test.saveUser(user);
        await test.saveUser(user2);

        await db
            .insert(invitationTable)
            .values([
                {
                    id: 'invitation-1',
                    inviterId: user.id,
                    email: 'invitee@example.com',
                    status: 'pending',
                    role: 'user',
                    token: 'token-1',
                    createdAt: new Date(),
                    expiredAt: new Date(Date.now() + 60 * 60 * 1000),
                },
                {
                    id: 'invitation-2',
                    inviterId: user.id,
                    email: 'invitee2@example.com',
                    status: 'pending',
                    role: 'user',
                    token: 'token-2',
                    createdAt: new Date(),
                    expiredAt: new Date(Date.now() + 60 * 60 * 1000),
                },
                {
                    id: 'invitation-3',
                    inviterId: user2.id,
                    email: 'invitee@example.com',
                    status: 'pending',
                    role: 'user',
                    token: 'token-3',
                    createdAt: new Date(),
                    expiredAt: new Date(Date.now() + 60 * 60 * 1000),
                },
            ])
            .execute();
        const useCase = new ListInvitationUseCase(db, domainMap);
        const invitations = await useCase.execute(user.id);

        expect(invitations).toHaveLength(2);
        expect(invitations[0].inviterId).toBe(user.id);
        expect(invitations[1].inviterId).toBe(user.id);
    });
});
