import { DomainError } from '../shared/DomainError';

export class InvitationExpiredError extends DomainError(
    'Invitation has expired.'
) {}

export class InvitationRevokedError extends DomainError(
    'Invitation has been revoked.'
) {}

export class InvitationAlreadyAcceptedError extends DomainError(
    'Invitation has already been accepted.'
) {}

export class InvalidInvitationTokenError extends DomainError(
    'Invitation token is invalid.'
) {}

export class InvalidInvitationRoleError extends DomainError(
    'Invitation role is invalid.'
) {}

export class InvitationNotFoundError extends DomainError(
    'Invitation not found.'
) {}

export class InviterMismatchError extends DomainError(
    'The inviter and executor do not match.'
) {}
