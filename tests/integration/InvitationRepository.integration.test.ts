import { eq } from 'drizzle-orm';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Invitation } from '../../src/backend/domain/invitation/Invitation';
import { InvitationNotFoundError } from '../../src/backend/domain/invitation/Invitation.errors';
import { InvitationToken } from '../../src/backend/domain/invitation/InvitationToken';
import { invitationTable } from '../../src/backend/infrastructure/db/appSchema';
import { db } from '../../src/backend/infrastructure/db/database';
import { domainMap } from '../../src/backend/infrastructure/domainMap/DomainMap';
import { invitationMap } from '../../src/backend/infrastructure/domainMap/invitationMap';
import { InvitationRepository } from '../../src/backend/infrastructure/repository/InvitationRepository';
import { auth } from '../../src/backend/lib/auth/auth.mock';

const repository = new InvitationRepository(db, domainMap);

beforeAll(async () => {
    const authContext = await auth.$context;

    const inviter = authContext.test.createUser({
        id: 'inviter-id',
        email: 'inviter@example.com',
        name: 'Inviter User',
        role: 'admin',
    });
    await authContext.test.saveUser(inviter);
});

beforeEach(async () => {
    await db.delete(invitationTable).execute();
});

describe('招待の永続化', () => {
    it('平文トークンを含む場合はハッシュ化して保存する', async () => {
        const invitation = Invitation.create(
            'test@example.com',
            'inviter-id',
            'user'
        );
        const hashedToken = await invitation.token.hash();

        await repository.save(invitation);

        const savedInvitation = await db
            .select()
            .from(invitationTable)
            .where(eq(invitationTable.id, invitation.id))
            .get();

        expect(savedInvitation).toBeDefined();
        expect(savedInvitation?.token).toBe(hashedToken.value);
        expect(savedInvitation?.token).not.toBe(invitation.token.value);
    });

    it('同一IDの保存は上書きされる', async () => {
        const invitation = Invitation.create(
            'test@example.com',
            'inviter-id',
            'user'
        );

        await repository.save(invitation);

        const updatedInvitation = invitationMap.toDomain({
            id: invitation.id,
            inviterId: 'inviter-id',
            email: 'test@example.com',
            status: 'accepted',
            role: 'user',
            token: invitation.token.value,
            createdAt: invitation.createdAt,
            expiredAt: invitation.expiration.value,
            acceptedAt: invitation.acceptedAt ?? null,
            revokedAt: invitation.revokedAt ?? null,
        });

        await repository.save(updatedInvitation);

        const savedInvitation = await db
            .select()
            .from(invitationTable)
            .where(eq(invitationTable.id, invitation.id))
            .get();

        expect(savedInvitation).toBeDefined();
        expect(savedInvitation?.id).toBe(invitation.id);
        expect(savedInvitation?.status).toBe(updatedInvitation.status.value);
        expect(savedInvitation?.status).not.toBe(invitation.status.value);
    });
});

describe('招待の復元', () => {
    it('IDで復元できる', async () => {
        vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
        db.insert(invitationTable)
            .values({
                id: 'invitation-id',
                inviterId: 'inviter-id',
                email: 'test@example.com',
                status: 'pending',
                role: 'user',
                token: 'hashed-token',
                createdAt: new Date(),
                expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
                acceptedAt: null,
                revokedAt: null,
            })
            .execute();

        const invitation = await repository.findById('invitation-id');

        expect(invitation).toBeDefined();
        expect(invitation?.id).toBe('invitation-id');
        expect(invitation?.status.value).toBe('pending');
        expect(invitation?.token.value).toBe('hashed-token');
        expect(invitation?.token.hashed).toBe(true);
        expect(invitation?.createdAt).toEqual(
            new Date('2026-01-01T00:00:00.000Z')
        );
        expect(invitation?.expiration.value).toEqual(
            new Date(Date.now() + 1000 * 60 * 60 * 24)
        );
        expect(invitation?.acceptedAt).toBeNull();
        expect(invitation?.revokedAt).toBeNull();
    });

    it('ハッシュ済みトークンで復元できる', async () => {
        vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
        db.insert(invitationTable)
            .values({
                id: 'invitation-id',
                inviterId: 'inviter-id',
                email: 'test@example.com',
                status: 'pending',
                role: 'user',
                token: 'hashed-token',
                createdAt: new Date(),
                expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
                acceptedAt: null,
                revokedAt: null,
            })
            .execute();

        const hashedToken = new InvitationToken('hashed-token', true);
        const invitation = await repository.findByToken(hashedToken);

        expect(invitation).toBeDefined();
        expect(invitation?.id).toBe('invitation-id');
        expect(invitation?.status.value).toBe('pending');
        expect(invitation?.token.value).toBe('hashed-token');
        expect(invitation?.token.hashed).toBe(true);
        expect(invitation?.createdAt).toEqual(
            new Date('2026-01-01T00:00:00.000Z')
        );
        expect(invitation?.expiration.value).toEqual(
            new Date(Date.now() + 1000 * 60 * 60 * 24)
        );
        expect(invitation?.acceptedAt).toBeNull();
        expect(invitation?.revokedAt).toBeNull();
    });

    it('見つからない場合は、エラーを返す', async () => {
        await expect(repository.findById('non-existent-id')).rejects.toThrow(
            InvitationNotFoundError
        );
    });
});
