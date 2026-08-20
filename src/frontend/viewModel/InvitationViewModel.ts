import type { InvitationListSuccessResponse } from '@/api/invitationApi';
import { JapaneseDate } from './JapaneseDate';

export type InvitationStatus =
    '承認待ち' | '承認済み' | '取り消し済み' | '期限切れ';
export type InvitationRole = '管理者' | 'ユーザー' | 'マネージャー';

export class InvitationViewModel {
    public readonly id: string;
    public readonly inviterId: string;
    public readonly inviteeEmail: string;
    public readonly status: InvitationStatus;
    public readonly createdAt: string;
    public readonly expiredAt: string;
    public readonly acceptedAt: string | null;
    public readonly revokedAt: string | null;
    public readonly role: InvitationRole;
    public readonly isPending: boolean;
    public readonly isAccepted: boolean;
    public readonly isRevoked: boolean;
    public readonly isExpired: boolean;

    constructor(apiResponse: InvitationListSuccessResponse[number]) {
        this.id = apiResponse.id;
        this.inviterId = apiResponse.inviterId;
        this.inviteeEmail = apiResponse.email;
        switch (apiResponse.status) {
            case 'pending':
                this.isPending = true;
                this.isAccepted = false;
                this.isRevoked = false;
                if (new Date() > new Date(apiResponse.expiredAt)) {
                    this.isExpired = true;
                    this.status = '期限切れ';
                } else {
                    this.isExpired = false;
                    this.status = '承認待ち';
                }
                break;
            case 'accepted':
                this.status = '承認済み';
                this.isPending = false;
                this.isAccepted = true;
                this.isRevoked = false;
                this.isExpired = false;
                break;
            case 'revoked':
                this.status = '取り消し済み';
                this.isPending = false;
                this.isAccepted = false;
                this.isRevoked = true;
                this.isExpired = false;
                break;
            default:
                throw new Error(`Unknown status: ${apiResponse.status}`);
        }

        this.createdAt = new Date(apiResponse.createdAt).toLocaleString();
        this.expiredAt = new Date(apiResponse.expiredAt).toLocaleString();
        this.acceptedAt = apiResponse.acceptedAt
            ? new Date(apiResponse.acceptedAt).toLocaleString()
            : null;
        this.revokedAt = apiResponse.revokedAt
            ? new Date(apiResponse.revokedAt).toLocaleString()
            : null;
        switch (apiResponse.role) {
            case 'admin':
                this.role = '管理者';
                break;
            case 'user':
                this.role = 'ユーザー';
                break;
            case 'manager':
                this.role = 'マネージャー';
                break;
            default:
                throw new Error(`Unknown role: ${apiResponse.role}`);
        }
    }

    public get japaneseCreatedAt(): string {
        const date = new JapaneseDate(new Date(this.createdAt));
        return date.yyyyMMddHHmm();
    }

    public get japaneseExpiredAt(): string {
        const date = new JapaneseDate(new Date(this.expiredAt));
        return date.yyyyMMddHHmm();
    }

    public get japaneseAcceptedAt(): string | null {
        if (!this.acceptedAt) {
            return null;
        }
        const date = new JapaneseDate(new Date(this.acceptedAt));
        return date.yyyyMMddHHmm();
    }

    public get japaneseRevokedAt(): string | null {
        if (!this.revokedAt) {
            return null;
        }
        const date = new JapaneseDate(new Date(this.revokedAt));
        return date.yyyyMMddHHmm();
    }
}
