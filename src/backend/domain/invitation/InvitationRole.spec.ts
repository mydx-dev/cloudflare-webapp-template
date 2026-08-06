import { describe, expect, it } from 'vitest';
import { InvalidInvitationRoleError } from './Invitation.errors';
import { InvitationRole } from './InvitationRole';

describe('招待ロールの生成', () => {
    it.each(['user', 'admin', 'manager'] as const)(
        'ロールが"user"または"admin"または"manager"の場合は正常に生成される',
        (role) => {
            expect(new InvitationRole(role).value).toBe(role);
        }
    );

    it('許可されていないロールの場合はエラーが発生する', () => {
        expect(() => new InvitationRole('owner' as any)).toThrow(
            InvalidInvitationRoleError
        );
    });
});
