import { AuthRole } from '../../../shared/auth/accessControl';
import { EmailAddress } from '../shared/EmailAddress';
import { InvitationExpiration } from './InvitationExpiration';
import { InvitationRole } from './InvitationRole';
import { InvitationStatus } from './InvitationStatus';
import { InvitationToken } from './InvitationToken';
import { Inviter } from './Inviter';

interface InvitationProps {
    id: string;
    inviter: Inviter;
    invitee: EmailAddress;
    role: InvitationRole;
    token: InvitationToken;
    status: InvitationStatus;
    createdAt: Date;
    expiration: InvitationExpiration;
    acceptedAt: Date | null;
    revokedAt: Date | null;
}

export class Invitation {
    public readonly id: string;
    public readonly inviter: Inviter;
    public readonly invitee: EmailAddress;
    public readonly role: InvitationRole;
    public readonly token: InvitationToken;
    public readonly status: InvitationStatus;
    public readonly createdAt: Date;
    public readonly expiration: InvitationExpiration;
    public readonly acceptedAt: Date | null;
    public readonly revokedAt: Date | null;

    constructor(props: InvitationProps) {
        this.id = props.id;
        this.inviter = props.inviter;
        this.invitee = props.invitee;
        this.role = props.role;
        this.token = props.token;
        this.status = props.status;
        this.createdAt = props.createdAt;
        this.expiration = props.expiration;
        this.acceptedAt = props.acceptedAt;
        this.revokedAt = props.revokedAt;
    }

    static create(
        email: string,
        inviterId: string,
        role: AuthRole = InvitationRole.defaultValue
    ): Invitation {
        const createdAt = new Date();

        return new Invitation({
            id: crypto.randomUUID(),
            inviter: new Inviter(inviterId),
            invitee: new EmailAddress(email),
            role: new InvitationRole(role),
            token: InvitationToken.generate(),
            status: new InvitationStatus('pending'),
            createdAt,
            expiration: new InvitationExpiration(
                new Date(createdAt.getTime() + 1000 * 60 * 60 * 24)
            ),
            acceptedAt: null,
            revokedAt: null,
        });
    }

    async accept(token: InvitationToken): Promise<Invitation> {
        this.expiration.ensureActive(new Date());
        this.status.ensurePending();
        await this.token.verify(token);

        return new Invitation({
            ...this,
            status: new InvitationStatus('accepted'),
            acceptedAt: new Date(),
        });
    }

    revoke(inviterId: string): Invitation {
        this.expiration.ensureActive(new Date());
        this.status.ensurePending();
        this.inviter.ensureSameAs(inviterId);

        return new Invitation({
            ...this,
            status: new InvitationStatus('revoked'),
            revokedAt: new Date(),
        });
    }

    async ensureSendable(inviterId: string): Promise<void> {
        this.inviter.ensureSameAs(inviterId);
        this.expiration.ensureActive(new Date());
        this.status.ensurePending();
    }
}
