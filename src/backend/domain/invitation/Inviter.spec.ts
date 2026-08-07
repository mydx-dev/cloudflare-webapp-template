import { describe, expect, it } from 'vitest';
import { InviterMismatchError } from './Invitation.errors';
import { Inviter } from './Inviter';

describe('招待者が実行者であることを保証する', () => {
    it('招待者のIDと実行者のIDが同じ場合はエラーを投げない', () => {
        const inviter = new Inviter('inviter-id');
        expect(() => inviter.ensureSameAs('inviter-id')).not.toThrow();
    });

    it('招待者のIDと実行者のIDが異なる場合はエラーを投げる', () => {
        const inviter = new Inviter('inviter-id');
        expect(() => inviter.ensureSameAs('different-id')).toThrow(
            InviterMismatchError
        );
    });
});
