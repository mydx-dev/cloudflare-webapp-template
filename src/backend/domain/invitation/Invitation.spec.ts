import { describe, expect, it, vi } from 'vitest';
import { EmailAddress } from '../shared/EmailAddress';
import { Invitation } from './Invitation';
import {
    InvitationExpiredError,
    InviterMismatchError,
} from './Invitation.errors';
import { InvitationExpiration } from './InvitationExpiration';
import { InvitationRole } from './InvitationRole';
import { InvitationStatus } from './InvitationStatus';
import { InvitationToken } from './InvitationToken';
import { Inviter } from './Inviter';

const createInvitation = async (
    status: 'pending' | 'accepted' | 'revoked' = 'pending',
    expiration = new Date(Date.now() + 1000 * 60 * 60)
) =>
    new Invitation({
        id: 'invitation-id',
        inviter: new Inviter('inviter-id'),
        invitee: new EmailAddress('test@example.com'),
        role: new InvitationRole('user'),
        token: new InvitationToken('valid-token'),
        status: new InvitationStatus(status),
        createdAt: new Date(),
        expiration: new InvitationExpiration(expiration),
        acceptedAt: status === 'accepted' ? new Date() : null,
        revokedAt: status === 'revoked' ? new Date() : null,
    });

describe('招待を作成する', () => {
    it('許可されたロールなら招待を作成できる', async () => {
        const invitation = Invitation.create(
            'test@example.com',
            'inviter-id',
            'admin'
        );

        expect(invitation.role.value).toBe('admin');
        expect(invitation.status.value).toBe('pending');
        expect(invitation.acceptedAt).toBeNull();
        expect(invitation.revokedAt).toBeNull();
        expect(invitation.token.value).toMatch(/^[0-9a-f]{64}$/);
    });

    it('ロールを指定しない場合は、userロールで招待を作成する', async () => {
        const invitation = Invitation.create('test@example.com', 'inviter-id');

        expect(invitation.role.value).toBe('user');
        expect(invitation.status.value).toBe('pending');
        expect(invitation.acceptedAt).toBeNull();
        expect(invitation.revokedAt).toBeNull();
        expect(invitation.token.value).toMatch(/^[0-9a-f]{64}$/);
    });

    it('トークンはハッシュされていない状態で作成される', async () => {
        const invitation = Invitation.create(
            'test@example.com',
            'inviter-id',
            'user'
        );

        expect(invitation.token.hashed).toBe(false);
    });
});

describe('招待を承認する', () => {
    it.each(['accepted', 'revoked'] as const)(
        '"accepted"または"revoked"ステータスの場合は承認できない',
        async (status) => {
            const invitation = await createInvitation(status);
            const token = new InvitationToken('valid-token');

            await expect(invitation.accept(token)).rejects.toThrow();
        }
    );

    it('有効期限が切れている場合は承認できない', async () => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
        const invitation = await createInvitation(
            'pending',
            new Date(Date.now() - 1000 * 60 * 60)
        );
        const token = new InvitationToken('valid-token');

        await expect(invitation.accept(token)).rejects.toThrow();
    });

    it('トークンが一致しない場合は承認できない', async () => {
        const invitation = await createInvitation();
        const token = new InvitationToken('invalid-token');

        await expect(invitation.accept(token)).rejects.toThrow();
    });

    it('有効な招待は承認済みにできる', async () => {
        vi.setSystemTime(new Date('2026-01-02T00:00:00Z'));
        const invitation = await createInvitation();
        const token = new InvitationToken('valid-token');

        const acceptedInvitation = await invitation.accept(token);

        expect(acceptedInvitation.status.value).toBe('accepted');
        expect(acceptedInvitation.acceptedAt).toEqual(
            new Date('2026-01-02T00:00:00Z')
        );
    });
});

describe('招待を取り消す', () => {
    it.each(['accepted', 'revoked'] as const)(
        '"accepted"または"revoked"ステータスの場合は取り消せない',
        async (status) => {
            const invitation = await createInvitation(status);

            expect(() => invitation.revoke('inviter-id')).toThrow();
        }
    );

    it('有効期限が切れている場合は取り消せない', async () => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
        const invitation = await createInvitation(
            'pending',
            new Date(Date.now() - 1000 * 60 * 60)
        );

        expect(() => invitation.revoke('inviter-id')).toThrow();
    });

    it('有効な招待は取り消せる', async () => {
        vi.setSystemTime(new Date('2026-01-02T00:00:00Z'));
        const invitation = await createInvitation();

        const revokedInvitation = invitation.revoke('inviter-id');

        expect(revokedInvitation.status.value).toBe('revoked');
        expect(revokedInvitation.revokedAt).toEqual(
            new Date('2026-01-02T00:00:00Z')
        );
    });
});

describe('招待が送信できることを保証する', () => {
    it('招待の作成者と実行者が異なる場合は送信できない', async () => {
        const invitation = await createInvitation();

        expect(() => invitation.ensureSendable('different-inviter-id')).toThrow(
            InviterMismatchError
        );
    });

    it('有効期限が切れている場合は送信できない', async () => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
        const invitation = await createInvitation(
            'pending',
            new Date(Date.now() - 1000 * 60 * 60)
        );

        expect(() => invitation.ensureSendable('inviter-id')).toThrow(
            InvitationExpiredError
        );
    });

    it.each(['accepted', 'revoked'] as const)(
        'ステータスが"accepted"または"revoked"の場合は送信できない',
        async (status) => {
            const invitation = await createInvitation(status);

            expect(() => invitation.ensureSendable('inviter-id')).toThrow();
        }
    );
    it('正常な招待は送信できる', async () => {
        vi.setSystemTime(new Date('2026-01-02T00:00:00.000Z'));
        const invitation = await createInvitation();

        expect(invitation.ensureSendable('inviter-id'));
    });
});
