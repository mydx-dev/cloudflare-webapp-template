import { client } from '@/lib/apiClient';
import { InferResponseType } from 'hono/client';
import { invitationErrorCodes } from '../../backend/presentation/api/invitations';

export type InvitationListResponse = InferResponseType<
    typeof client.api.invitations.$get
>;
export type InvitationListSuccessResponse = InferResponseType<
    typeof client.api.invitations.$get,
    200
>;

export type InvitationErrorResponse = Exclude<
    InvitationListResponse,
    InvitationListSuccessResponse
>;

type AcceptInvitationResponse = InferResponseType<
    typeof client.api.invitations.accept.$post
>;

type AcceptInvitationSuccessResponse = InferResponseType<
    typeof client.api.invitations.accept.$post,
    200
>;

export type AcceptInvitationErrorResponse = Exclude<
    AcceptInvitationResponse,
    AcceptInvitationSuccessResponse
>;

export type InvitationErrorCode = keyof typeof invitationErrorCodes;
