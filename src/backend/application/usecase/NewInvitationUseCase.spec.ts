import { afterEach, describe, expect, it, vi } from 'vitest';
import { Invitation } from '../../domain/invitation/Invitation';
import type { InvitationMail } from '../../infrastructure/mail/InvitationMail';
import { InvitationRepository } from '../../infrastructure/repository/InvitationRepository';
import { NewInvitationUseCase } from './NewInvitationUseCase';

afterEach(() => {
    vi.useRealTimers();
});

describe('新規ユーザー招待', () => {
    it('新規作成した招待をDBに保存し、招待メールを送信して作成結果を返す', async () => {
        const repository = {
            save: vi.fn().mockResolvedValue(undefined),
        };

        const invitationMail = {
            send: vi.fn().mockResolvedValue(undefined),
        };

        const useCase = new NewInvitationUseCase(
            repository as unknown as InvitationRepository,
            invitationMail as unknown as InvitationMail
        );

        const result = await useCase.execute(
            'inviter-id',
            'invitee@example.com',
            'user'
        );

        expect(repository.save).toHaveBeenCalledOnce();

        const savedInvitation = repository.save.mock.calls[0][0];

        expect(savedInvitation).toBeInstanceOf(Invitation);
        expect(savedInvitation.inviter.id).toBe('inviter-id');
        expect(savedInvitation.invitee.value).toBe('invitee@example.com');
        expect(savedInvitation.role.value).toBe('user');
        expect(savedInvitation.status.value).toBe('pending');

        expect(invitationMail.send).toHaveBeenCalledWith(savedInvitation);

        expect(result).toEqual({
            id: savedInvitation.id,
            inviterId: savedInvitation.inviter.id,
            email: savedInvitation.invitee.value,
            status: savedInvitation.status.value,
            role: savedInvitation.role.value,
            token: savedInvitation.token.value,
            createdAt: savedInvitation.createdAt,
            expiredAt: savedInvitation.expiration.value,
            acceptedAt: savedInvitation.acceptedAt,
            revokedAt: savedInvitation.revokedAt,
        });
    });

    it('招待メールの送信に失敗した場合は処理を成功扱いしない', async () => {
        const invitationRepository = {
            save: vi.fn().mockResolvedValue(undefined),
        };

        const invitationMail = {
            send: vi.fn().mockRejectedValue(new Error('send failed')),
        };

        const useCase = new NewInvitationUseCase(
            invitationRepository as unknown as InvitationRepository,
            invitationMail as unknown as InvitationMail
        );

        await expect(
            useCase.execute('inviter-id', 'invitee@example.com', 'user')
        ).rejects.toThrow('send failed');

        expect(invitationRepository.save).toHaveBeenCalledOnce();
    });
});
