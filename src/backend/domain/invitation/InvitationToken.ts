import { InvalidInvitationTokenError } from './Invitation.errors';

export class InvitationToken {
    constructor(
        public readonly value: string,
        public readonly hashed: boolean = true
    ) {}

    static generate(): InvitationToken {
        const randomBytes = crypto.getRandomValues(new Uint8Array(32));
        const token = Array.from(randomBytes)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
        return new InvitationToken(token, false);
    }

    async hash(): Promise<InvitationToken> {
        if (this.hashed) return this;
        const hashBuffer = await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(this.value)
        );
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
        return new InvitationToken(hashHex);
    }

    async verify(token: InvitationToken): Promise<void> {
        const self = this.hashed ? this : await this.hash();
        const target = token.hashed ? token : await token.hash();
        if (self.value === target.value) return;
        throw new InvalidInvitationTokenError();
    }
}
