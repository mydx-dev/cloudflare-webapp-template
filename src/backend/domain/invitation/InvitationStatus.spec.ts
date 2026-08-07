import { describe, expect, it } from 'vitest';
import {
    InvitationAlreadyAcceptedError,
    InvitationRevokedError,
} from './Invitation.errors';
import { InvitationStatus } from './InvitationStatus';

describe('招待ステータスの生成', () => {
    it.each(['pending', 'accepted', 'revoked'] as const)(
        'ステータスが"pending"または"accepted"または"revoked"の場合は正常に生成される',
        (status) => {
            const invitationStatus = new InvitationStatus(status);
            expect(invitationStatus.value).toBe(status);
        }
    );

    it('不正なステータスの場合はエラーが発生する', () => {
        expect(() => new InvitationStatus('invalid' as any)).toThrow();
    });
});

describe('ステータスがpendingであることを保証する', () => {
    it('ステータスがpendingの場合はエラーが発生しない', () => {
        const invitationStatus = new InvitationStatus('pending');
        expect(() => invitationStatus.ensurePending()).not.toThrow();
    });

    it('ステータスがacceptedの場合はInvitationAlreadyAcceptedErrorが発生する', () => {
        const invitationStatus = new InvitationStatus('accepted');
        expect(() => invitationStatus.ensurePending()).toThrow(
            InvitationAlreadyAcceptedError
        );
    });

    it('ステータスがrevokedの場合はInvitationRevokedErrorが発生する', () => {
        const invitationStatus = new InvitationStatus('revoked');
        expect(() => invitationStatus.ensurePending()).toThrow(
            InvitationRevokedError
        );
    });
});
