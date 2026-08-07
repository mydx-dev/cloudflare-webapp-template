import { describe, expect, it, vi } from 'vitest';
import type { InvitationRepository } from '../../infrastructure/repository/InvitationRepository';
import { RevokeInvitationUseCase } from './RevokeInvitationUseCase';

describe('RevokeInvitationUseCase', () => {
    it('取得した招待を取り消して保存する', async () => {
        const revokedAt = new Date('2026-01-02T00:00:00.000Z');

        const revokedInvitation = {
            id: 'invitation-id',
            status: {
                value: 'revoked',
            },
            revokedAt,
            inviter: {
                id: 'inviter-id',
            },
            invitee: {
                value: 'invitee-value',
            },
            role: {
                value: 'role-value',
            },
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            expiration: {
                value: new Date('2026-01-03T00:00:00.000Z'),
            },
            acceptedAt: null,
        };

        const invitation = {
            revoke: vi.fn().mockReturnValue(revokedInvitation),
        };

        const invitationRepository = {
            findById: vi.fn().mockResolvedValue(invitation),
            save: vi.fn().mockResolvedValue(undefined),
        };

        const useCase = new RevokeInvitationUseCase(
            invitationRepository as unknown as InvitationRepository
        );

        const result = await useCase.execute('invitation-id', 'inviter-id');

        expect(invitationRepository.findById).toHaveBeenCalledWith(
            'invitation-id'
        );
        expect(invitation.revoke).toHaveBeenCalledWith('inviter-id');
        expect(invitationRepository.save).toHaveBeenCalledWith(
            revokedInvitation
        );
        expect(result.id).toBe(revokedInvitation.id);
        expect(result.inviterId).toBe(revokedInvitation.inviter.id);
        expect(result.email).toBe(revokedInvitation.invitee.value);
        expect(result.status).toBe(revokedInvitation.status.value);
        expect(result.role).toBe(revokedInvitation.role.value);
        expect(result.createdAt).toEqual(revokedInvitation.createdAt);
        expect(result.expiredAt).toEqual(revokedInvitation.expiration.value);
        expect(result.acceptedAt).toBeNull();
        expect(result.revokedAt).toEqual(revokedAt);
    });
});
