import { describe, expect, it, vi } from 'vitest';
import { InvitationExpiredError } from './Invitation.errors';
import { InvitationExpiration } from './InvitationExpiration';

describe('有効期限の設定', () => {
    it('有効期限は作成日時から7日後に設定される', () => {
        vi.setSystemTime(new Date('2024-01-01T00:00:00Z')); // 2024年1月1日にシステム時刻を設定
        const createdAt = new Date();
        const expiration = InvitationExpiration.create(createdAt);

        expect(expiration.value).toEqual(new Date('2024-01-08T00:00:00Z'));
    });

    it('有効期限を超えるととエラーになる', () => {
        vi.setSystemTime(new Date('2024-01-10T00:00:00Z')); // 2024年1月10日にシステム時刻を設定
        const expiration = new InvitationExpiration(
            new Date('2024-01-08T00:00:00Z')
        );

        expect(() => expiration.ensureActive(new Date())).toThrow(
            InvitationExpiredError
        );
    });
});
