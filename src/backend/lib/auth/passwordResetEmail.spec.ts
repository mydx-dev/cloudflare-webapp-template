import { describe, expect, it, vi } from 'vitest';
import {
    createPasswordResetEmailMessage,
    sendPasswordResetEmail,
} from './passwordResetEmail';

describe('passwordResetEmail', () => {
    it('パスワード再設定メールの本文に再設定URLを含める', () => {
        const message = createPasswordResetEmailMessage({
            from: 'noreply@example.com',
            user: {
                email: 'user@example.com',
                name: 'Test User',
            },
            url: 'https://example.com/reset-password/token?callbackURL=%2Freset-password',
        });

        expect(message).toMatchObject({
            to: 'user@example.com',
            from: 'noreply@example.com',
            subject: 'パスワード再設定のご案内',
        });
        expect(message.text).toContain(
            'https://example.com/reset-password/token?callbackURL=%2Freset-password'
        );
        expect(message.html).toContain(
            'https://example.com/reset-password/token?callbackURL=%2Freset-password'
        );
    });

    it('Cloudflare Email Service bindingに送信を委譲する', async () => {
        const send = vi.fn().mockResolvedValue({
            messageId: 'message-id',
        });

        await sendPasswordResetEmail({ send } as unknown as SendEmail, {
            from: 'noreply@example.com',
            user: {
                email: 'user@example.com',
            },
            url: 'https://example.com/reset-password/token',
        });

        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'user@example.com',
                from: 'noreply@example.com',
                subject: 'パスワード再設定のご案内',
            })
        );
    });

    it('送信失敗時に宛先やリセットURLをログへ出さず汎用エラーにする', async () => {
        const sendError = new Error('provider rejected user@example.com');
        const send = vi.fn().mockRejectedValue(sendError);
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);

        await expect(
            sendPasswordResetEmail({ send } as unknown as SendEmail, {
                from: 'noreply@example.com',
                user: {
                    email: 'user@example.com',
                },
                url: 'https://example.com/reset-password/secret-token',
            })
        ).rejects.toThrow('Password reset email sending failed');

        expect(consoleError).toHaveBeenCalledWith(
            'Password reset email sending failed',
            {
                name: 'Error',
                code: undefined,
            }
        );
        expect(consoleError.mock.calls.flat().join(' ')).not.toContain(
            'user@example.com'
        );
        expect(consoleError.mock.calls.flat().join(' ')).not.toContain(
            'secret-token'
        );

        consoleError.mockRestore();
    });
});
