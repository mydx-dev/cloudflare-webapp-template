import { routes } from '@/../shared/routes';
import { client } from '@/lib/apiClient';
import { queryClient } from '@/lib/queryClient';
import {
    type ErrorResolution,
    useGlobalErrorResolutions,
} from '@/viewModel/ErrorResolution';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

type ResendInvitationResponse = Awaited<
    ReturnType<
        (typeof client.api.invitations)[':invitationId']['resend']['$post']
    >
>;

type ResendInvitationErrorResponse = Awaited<
    ReturnType<Exclude<ResendInvitationResponse, { status: 200 }>['json']>
>;

export const useResendInvitation = () => {
    const navigate = useNavigate();
    const globalErrorResolutions = useGlobalErrorResolutions();
    const errorResolutions: Record<
        ResendInvitationErrorResponse['code'],
        ErrorResolution
    > = {
        ...globalErrorResolutions,
        INVITATION_ALREADY_ACCEPTED: {
            problem: 'この招待は既に承認されています',
            resolution: '新規招待メールを送信してください',
            action: {
                execute: () => navigate(routes.invitation.create),
                label: '招待メール作成へ',
            },
        },
        INVITER_MISMATCH: {
            problem: '招待者本人のみ再送できます',
            resolution: '招待者本人としてログインしてください',
            action: {
                execute: () => navigate(routes.user.signin),
                label: 'ログインへ',
            },
        },
        INVITATION_NOT_FOUND: {
            problem: '招待が見つかりません',
            resolution: '新規招待メールを送信してください',
            action: {
                execute: () => navigate(routes.invitation.create),
                label: '招待メール作成へ',
            },
        },
    };

    const mutation = useMutation<unknown, ErrorResolution, string>({
        mutationFn: async (invitationId: string) => {
            const response = await client.api.invitations[
                ':invitationId'
            ].resend.$post({
                param: {
                    invitationId,
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
