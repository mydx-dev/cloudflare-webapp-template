import { describe, expect, it } from 'vitest';
import { InvalidInvitationTokenError } from './Invitation.errors';
import { InvitationToken } from './InvitationToken';

describe('トークンを生成', () => {
    it('トークンは32バイトのランダムな16進数文字列で生成される', () => {
        const token = InvitationToken.generate();
        expect(token.value).toMatch(/^[0-9a-f]{64}$/);
    });
});

describe('トークンの検証', () => {
    it('トークンが一致する場合はエラーが発生しない', () => {
        const token1 = new InvitationToken('valid-token');
        const token2 = new InvitationToken('valid-token');
        expect(() => token1.verify(token2)).not.toThrow();
    });

    it('トークンが一致しない場合はInvalidInvitationTokenErrorが発生する', async () => {
        const token1 = new InvitationToken('valid-token');
        const token2 = new InvitationToken('invalid-token');
        await expect(token1.verify(token2)).rejects.toThrow(
            InvalidInvitationTokenError
        );
    });

    it('ハッシュ化されていないトークンを検証する場合も正しく動作する', async () => {
        const token1 = new InvitationToken('valid-token', false);
        const token2 = new InvitationToken('valid-token', false);
        await expect(token1.verify(token2)).resolves.not.toThrow();
    });
});

describe('トークンのハッシュ化', () => {
    it('ハッシュ化されていないトークンをハッシュ化すると、ハッシュ化されたトークンが返る', async () => {
        const token = new InvitationToken('valid-token', false);
        const hashedToken = await token.hash();
        expect(hashedToken.hashed).toBe(true);
        expect(hashedToken.value).not.toBe(token.value);
    });

    it('すでにハッシュ化されているトークンをハッシュ化すると、同じトークンが返る', async () => {
        const token = new InvitationToken('hashed-token', true);
        const hashedToken = await token.hash();
        expect(hashedToken).toBe(token);
    });
});
