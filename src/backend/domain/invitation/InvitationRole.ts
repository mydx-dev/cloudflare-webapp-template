import { AuthRole } from '../../../shared/auth/accessControl';
import { InvalidInvitationRoleError } from './Invitation.errors';

export class InvitationRole {
    static readonly defaultValue: AuthRole = 'user';

    constructor(public readonly value: AuthRole) {
        if (value !== 'user' && value !== 'admin' && value !== 'manager') {
            throw new InvalidInvitationRoleError();
        }
    }
}
