import { describe, expect, it } from 'vitest';
import { EmailAddress } from './EmailAddress';

describe('EmailAddress', () => {
    it('有効なメールアドレスを受け入れる', () => {
        const email = new EmailAddress('test@example.com');
        expect(email.value).toBe('test@example.com');
    });

    it('無効なメールアドレスを拒否する', () => {
        expect(() => new EmailAddress('invalid-email')).toThrow(
            'Invalid email address'
        );
    });
});
