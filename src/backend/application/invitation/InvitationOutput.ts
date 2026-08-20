export type InvitationOutput = {
    id: string;
    inviterId: string;
    email: string;
    status: 'pending' | 'accepted' | 'revoked';
    role: 'user' | 'admin' | 'manager';
    createdAt: Date;
    expiredAt: Date;
    acceptedAt: Date | null;
    revokedAt: Date | null;
};
