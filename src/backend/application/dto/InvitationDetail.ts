export type InvitationDetail = {
    id: string;
    inviterId: string;
    email: string;
    status: string;
    role: string;
    createdAt: Date;
    expiredAt: Date;
    acceptedAt: Date | null;
    revokedAt: Date | null;
};
