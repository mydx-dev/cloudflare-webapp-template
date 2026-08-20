import { routes } from '@/../shared/routes';
import { client } from '@/lib/apiClient';
import { queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    type ErrorResolution,
    useGlobalErrorResolutions,
} from '../viewModel/ErrorResolution';

type AcceptInvitationResponse = Awaited<
    ReturnType<(typeof client.api.invitations)['accept']['$post']>
>;

type AcceptInvitationErrorResponse = Awaited<
    ReturnType<Exclude<AcceptInvitationResponse, { status: 200 }>['json']>
>;

export const useAcceptInvitation = () => {
    const navigate = useNavigate();
    const globalErrorResolutions = useGlobalErrorResolutions();
    const errorResolutions: Record<
        AcceptInvitationErrorResponse['code'],
        ErrorResolution
    > = {
        INVALID_INVITATION_TOKEN: {
            problem: 'トークンが無効です',
            resolution: '招待メールのリンクを確認してください',
        },
        INVITATION_ALREADY_ACCEPTED: {
            problem: '招待は既に承認されています',
            resolution: '作成したアカウントでログインしてください',
            action: {
                execute: () => navigate(routes.user.signin),
                label: 'ログインへ',
            },
        },
        INVITATION_EXPIRED: {
            problem: '招待の有効期限が切れています',
            resolution: '招待の再送を管理者に依頼してください',
        },
        INVITATION_REVOKED: {
            problem: '招待は取り消されています',
            resolution: '新しい招待を管理者に依頼してください',
        },
        ...globalErrorResolutions,
    };

    const mutation = useMutation<
        unknown,
        ErrorResolution,
        { token: string; name: string; password: string }
    >({
        mutationFn: async ({ token, name, password }) => {
            const response = await client.api.invitations.accept.$post({
                json: {
                    token,
                    name,
                    password,
                },
            });

            if (response.status !== 200) {
                const error = await response.json();
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
