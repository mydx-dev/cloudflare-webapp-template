import { describe, expect, it, vi } from 'vitest';
import { Invitation } from '../../domain/invitation/Invitation';
import {
    InvitationAlreadyAcceptedError,
    InvitationExpiredError,
    InvitationRevokedError,
    InviterMismatchError,
} from '../../domain/invitation/Invitation.errors';
import type { InvitationMail } from '../../infrastructure/mail/InvitationMail';
import type { InvitationRepository } from '../../infrastructure/repository/InvitationRepository';
import { ApplicationError } from '../dto/ApplicationError';
import { ResendInvitationUseCase } from './ResendInvitationUseCase';

describe('招待を再送する', () => {
    it('有効な招待はtokenを再発行して再送する', async () => {
        const invitation = Invitation.create(
            'test@example.com',
            'inviter-id',
            'user'
        );

        const invitationRepository = {
            findById: vi.fn().mockResolvedValue(invitation),
            save: vi.fn(),
        };

        const invitationMail = {
            send: vi.fn(),
        } satisfies Pick<InvitationMail, 'send'>;

        const useCase = new ResendInvitationUseCase(
            invitationRepository as unknown as InvitationRepository,
            invitationMail as unknown as InvitationMail
        );

        vi.mocked(invitationRepository.findById).mockResolvedValue(invitation);

        const result = await useCase.execute(invitation.id, 'inviter-id');

        expect(result.id).toBe(invitation.id);
        expect(result.token.value).not.toBe(invitation.token.value);

        expect(invitationRepository.save).toHaveBeenCalledWith(result);
        expect(invitationMail.send).toHaveBeenCalledWith(result);
    });

    it('期限切れの招待は新しい招待を保存して送信する', async () => {
        const expiredInvitation = {
            id: 'expired-id',
            resend: vi.fn().mockImplementation(() => {
                throw new InvitationExpiredError();
            }),
            inviter: {
                id: 'inviter-id',
            },
            invitee: {
                value: 'invitee@example.com',
            },
            role: {
                value: 'admin',
            },
        };

        const invitationRepository = {
            findById: vi.fn().mockResolvedValue(expiredInvitation),
            save: vi.fn(),
        };

        const invitationMail = {
            send: vi.fn(),
        } satisfies Pick<InvitationMail, 'send'>;

        const useCase = new ResendInvitationUseCase(
            invitationRepository as unknown as InvitationRepository,
            invitationMail as unknown as InvitationMail
        );

        await useCase.execute(expiredInvitation.id, 'inviter-id');

        const newInvitation = invitationRepository.save.mock.calls[0][0];

        expect(newInvitation).not.toBe(expiredInvitation);
        expect(newInvitation.id).not.toBe(expiredInvitation.id);
        expect(newInvitation.inviter.id).toBe(expiredInvitation.inviter.id);
        expect(newInvitation.invitee.value).toBe(
            expiredInvitation.invitee.value
        );
        expect(newInvitation.role.value).toBe(expiredInvitation.role.value);
        expect(newInvitation.status.value).toBe('pending');

        expect(invitationRepository.save).toHaveBeenCalledWith(newInvitation);
        expect(invitationMail.send).toHaveBeenCalledWith(newInvitation);
    });

    it('取り消された招待は新しい招待を保存して送信する', async () => {
        const revokedInvitation = {
            id: 'revoked-id',
            resend: vi.fn().mockImplementation(() => {
                throw new InvitationRevokedError();
            }),
            inviter: {
                id: 'inviter-id',
            },
            invitee: {
                value: 'invitee@example.com',
            },
            role: {
                value: 'admin',
            },
        };

        const invitationRepository = {
            findById: vi.fn().mockResolvedValue(revokedInvitation),
            save: vi.fn(),
        };

        const invitationMail = {
            send: vi.fn(),
        } satisfies Pick<InvitationMail, 'send'>;

        const useCase = new ResendInvitationUseCase(
            invitationRepository as unknown as InvitationRepository,
            invitationMail as unknown as InvitationMail
        );

        await useCase.execute(revokedInvitation.id, 'inviter-id');

        const newInvitation = invitationRepository.save.mock.calls[0][0];

        expect(newInvitation).not.toBe(revokedInvitation);
        expect(newInvitation.id).not.toBe(revokedInvitation.id);
        expect(newInvitation.inviter.id).toBe(revokedInvitation.inviter.id);
        expect(newInvitation.invitee.value).toBe(
            revokedInvitation.invitee.value
        );
        expect(newInvitation.role.value).toBe(revokedInvitation.role.value);
        expect(newInvitation.status.value).toBe('pending');

        expect(invitationRepository.save).toHaveBeenCalledWith(newInvitation);
        expect(invitationMail.send).toHaveBeenCalledWith(newInvitation);
    });

    it('再発行した招待は元の招待者、被招待者、ロールを引き継ぐ', async () => {
        const originalInvitation = {
            id: 'original-id',
            resend: vi.fn().mockImplementation(() => {
                throw new InvitationExpiredError();
            }),
            inviter: {
                id: 'inviter-id',
            },
            invitee: {
                value: 'invitee@example.com',
            },
            role: {
                value: 'admin',
            },
        };

        const invitationRepository = {
            findById: vi.fn().mockResolvedValue(originalInvitation),
            save: vi.fn(),
        };

        const invitationMail = {
            send: vi.fn(),
        } satisfies Pick<InvitationMail, 'send'>;

        const useCase = new ResendInvitationUseCase(
            invitationRepository as unknown as InvitationRepository,
            invitationMail as unknown as InvitationMail
        );

        await useCase.execute(originalInvitation.id, 'inviter-id');

        const newInvitation = invitationRepository.save.mock.calls[0][0];

        expect(newInvitation.inviter.id).toBe(originalInvitation.inviter.id);
        expect(newInvitation.invitee.value).toBe(
            originalInvitation.invitee.value
        );
        expect(newInvitation.role.value).toBe(originalInvitation.role.value);
    });

    it('招待者本人以外の場合は再発行せずエラーを送出する', async () => {
        const invitation = {
            id: 'invitation-id',
            resend: vi.fn().mockImplementation(() => {
                throw new InviterMismatchError();
            }),
            inviter: {
                id: 'inviter-id',
            },
        };

        const invitationRepository = {
            findById: vi.fn().mockResolvedValue(invitation),
            save: vi.fn(),
        } as unknown as InvitationRepository;

        const invitationMail = {
            send: vi.fn(),
        } satisfies Pick<InvitationMail, 'send'>;

        const useCase = new ResendInvitationUseCase(
            invitationRepository,
            invitationMail as unknown as InvitationMail
        );

        await expect(
            useCase.execute(invitation.id, 'other-inviter-id')
        ).rejects.toThrow(
            new ApplicationError(new InviterMismatchError(), [
                InviterMismatchError,
            ])
        );
    });

    it('承認済みの場合は再発行せずエラーを送出する', async () => {
        const invitation = {
            id: 'invitation-id',
            resend: vi.fn().mockImplementation(() => {
                throw new InvitationAlreadyAcceptedError();
            }),
            inviter: {
                id: 'inviter-id',
            },
            invitee: {
                value: 'invitee@example.com',
            },
        };

        const invitationRepository = {
            findById: vi.fn().mockResolvedValue(invitation),
            save: vi.fn(),
        } as unknown as InvitationRepository;

        const invitationMail = {
            send: vi.fn(),
        } satisfies Pick<InvitationMail, 'send'>;

        const useCase = new ResendInvitationUseCase(
            invitationRepository,
            invitationMail as unknown as InvitationMail
        );

        await expect(
            useCase.execute(invitation.id, 'inviter-id')
        ).rejects.toThrow(
            new ApplicationError(new InvitationAlreadyAcceptedError(), [
                InvitationAlreadyAcceptedError,
            ])
        );
    });
});
