export abstract class InvitationError extends Error {
    protected constructor(message: string) {
        super(message);
        this.name = new.target.name;
    }
}

export class InvitationExpiredError extends InvitationError {
    constructor() {
        super('Invitation has expired.');
    }
}

export class InvitationRevokedError extends InvitationError {
    constructor() {
        super('Invitation has been revoked.');
    }
}

export class InvitationAlreadyAcceptedError extends InvitationError {
    constructor() {
        super('Invitation has already been accepted.');
    }
}

export class InvalidInvitationTokenError extends InvitationError {
    constructor() {
        super('Invitation token is invalid.');
    }
}

export class InvalidInvitationRoleError extends InvitationError {
    constructor() {
        super('Invitation role is invalid.');
    }
}

export class InvitationNotFoundError extends InvitationError {
    constructor() {
        super('Invitation not found.');
    }
}

export class InviterMismatchError extends InvitationError {
    constructor() {
        super('The inviter and executor do not match.');
    }
}
