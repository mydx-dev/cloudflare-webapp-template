import {
    InvitationAlreadyAcceptedError,
    InvitationRevokedError,
} from './Invitation.errors';

export type InvitationStatusValue = 'pending' | 'accepted' | 'revoked';

export class InvitationStatus {
    constructor(public readonly value: InvitationStatusValue) {
        if (!['pending', 'accepted', 'revoked'].includes(value)) {
            throw new Error(`Invalid invitation status: ${value}`);
        }
    }

    ensurePending(): void {
        if (this.value === 'accepted') {
            throw new InvitationAlreadyAcceptedError();
        }

        if (this.value === 'revoked') {
            throw new InvitationRevokedError();
        }
    }
}
