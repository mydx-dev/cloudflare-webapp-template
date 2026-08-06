import { InvitationExpiredError } from './Invitation.errors';

export class InvitationExpiration {
    constructor(public readonly value: Date) {}

    static create(createdAt: Date): InvitationExpiration {
        return new InvitationExpiration(
            new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
        );
    }

    ensureActive(now: Date): void {
        if (this.value <= now) {
            throw new InvitationExpiredError();
        }
    }
}
