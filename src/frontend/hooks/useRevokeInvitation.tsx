import { routes } from '@/../shared/routes';
import { client } from '@/lib/apiClient';
import { queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    type ErrorResolution,
    useGlobalErrorResolutions,
} from '../viewModel/ErrorResolution';

type RevokeInvitationResponse = Awaited<
    ReturnType<
        (typeof client.api.invitations)[':invitationId']['revoke']['$post']
    >
>;

type RevokeInvitationErrorResponse = Awaited<
    ReturnType<Exclude<RevokeInvitationResponse, { status: 200 }>['json']>
>;

export const useRevokeInvitation = () => {
    const globalErrorResolutions = useGlobalErrorResolutions();
    const navigate = useNavigate();
    const errorResolutions: Record<
        RevokeInvitationErrorResponse['code'],
        ErrorResolution
    > = {
        ...globalErrorResolutions,
        INVITATION_EXPIRED: {
            problem: 'この招待は有効期限が切れています',
            resolution: '既に無効状態のため、取り消しできません',
        },
        INVITATION_ALREADY_ACCEPTED: {
            problem: 'この招待は既に受諾されています',
            resolution: '既に無効状態のため、取り消しできません',
        },
        INVITATION_REVOKED: {
            problem: 'この招待は既に取り消されています',
            resolution: '既に無効状態のため、取り消しできません',
        },
        INVITER_MISMATCH: {
            problem: '取り消す権限がありません',
            resolution: '招待を作成したユーザーとしてログインしてください',
            action: {
                label: 'ログイン画面へ',
                execute: () => navigate(routes.user.signin),
            },
        },
        INVITATION_NOT_FOUND: {
            problem: '招待が見つかりません',
            resolution: '取り消しできませんでした',
        },
    };
    const mutation = useMutation<unknown, ErrorResolution, string>({
        mutationFn: async (invitationId: string) => {
            const response = await client.api.invitations[
                ':invitationId'
            ].revoke.$post({
                param: {
                    invitationId,
                },
            });

            if (response.status !== 200) {
                const error =
                    (await response.json()) as RevokeInvitationErrorResponse;
                throw errorResolutions[error.code];
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invitations'] });
        },
    });
    return {
        mutation,
        resolutions: errorResolutions,
    };
};
