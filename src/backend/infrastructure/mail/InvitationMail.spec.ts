import { describe, expect, it, vi } from 'vitest';
import { appConfig } from '../../../shared/appConfig';
import { routes } from '../../../shared/routes';
import { Invitation } from '../../domain/invitation/Invitation';
import { InvitationExpiration } from '../../domain/invitation/InvitationExpiration';
import { InvitationRole } from '../../domain/invitation/InvitationRole';
import { InvitationStatus } from '../../domain/invitation/InvitationStatus';
import { InvitationToken } from '../../domain/invitation/InvitationToken';
import { Inviter } from '../../domain/invitation/Inviter';
import { EmailAddress } from '../../domain/shared/EmailAddress';
import { InvitationMail } from './InvitationMail';

describe('招待メール', () => {
    describe('送信する', () => {
        const from = appConfig.supportEmail;
        const to = 'inviter@example.com';
        const baseUrl = 'https://example.com';
        const invitation = new Invitation({
            id: 'invitation-id',
            inviter: new Inviter('inviter-id'),
            invitee: new EmailAddress(to),
            role: new InvitationRole('user'),
            token: new InvitationToken('invitation-token'),
            status: new InvitationStatus('pending'),
            createdAt: new Date(),
            expiration: new InvitationExpiration(
                new Date('2026-01-08T00:00:00.000Z')
            ),
            acceptedAt: null,
            revokedAt: null,
        });

        const sendEmail = {
            send: vi.fn().mockResolvedValue(undefined),
        };

        const invitationMail = new InvitationMail(
            sendEmail as unknown as SendEmail,
            baseUrl
        );

        invitationMail.send(invitation);

        const mail: EmailMessageBuilder = sendEmail.send.mock.calls[0][0];

        it('件名にどのシステムから招待されているかが含まれている', () => {
            expect(mail.subject).toContain(appConfig.name);
        });

        it('送信元はサポートメールアドレス', () => {
            expect(mail.from).toBe(from);
        });

        it('送信先は被招待者のアドレス', () => {
            expect(mail.to).toBe(invitation.invitee.value);
        });

        describe('本文', () => {
            it('招待対象者への案内が含まれる', () => {
                expect(mail.text).toContain('招待が届いています');
            });

            it('有効期限が7日間であることが記載される', () => {
                expect(mail.text).toContain('7日間');
            });

            it('招待リンクが含まれている', () => {
                expect(mail.text).toContain(
                    `${baseUrl}${routes.invitation.accept}`
                );
            });

            it('baseUrlの末尾がスラッシュの場合は削除して招待リンクを作成する', () => {
                const invitationMailWithSlash = new InvitationMail(
                    sendEmail as unknown as SendEmail,
                    `${baseUrl}/`
                );

                invitationMailWithSlash.send(invitation);

                const mail = sendEmail.send.mock.calls[1][0];

                expect(mail.text).toContain(
                    `${baseUrl}${routes.invitation.accept}`
                );
                expect(mail.text).not.toContain(
                    `${baseUrl}/${routes.invitation.accept}`
                );
            });
        });
    });
});
