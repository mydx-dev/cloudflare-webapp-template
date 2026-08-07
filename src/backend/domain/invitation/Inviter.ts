import { InviterMismatchError } from './Invitation.errors';

export class Inviter {
    constructor(public readonly id: string) {}

    ensureSameAs(executorId: string): void {
        if (this.id !== executorId) {
            throw new InviterMismatchError();
        }
    }
}
