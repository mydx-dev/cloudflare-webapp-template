import { routes } from '@/../shared/routes';
import { useMutation } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../lib/authClient';
import { ErrorResolution } from '../viewModel/ErrorResolution';

type ResetPasswordRequest = {
    token: string;
    newPassword: string;
};

type ResetPasswordErrorCode = 'INVALID_TOKEN';

export const useResetPassword = () => {
    const navigate = useNavigate();
    const errorResolutions: Record<
        ResetPasswordErrorCode | 'UNKNOWN',
        ErrorResolution
    > = {
        INVALID_TOKEN: {
            problem: 'パスワードリセットトークンが無効です',
            resolution:
                'パスワードリセットメールのURLを確認する、またはパスワードリセットメールを再送してください',
            action: {
                label: 'メールを再送',
                execute: () => {
                    navigate(routes.user.forgotPassword);
                },
            },
        },
        UNKNOWN: {
            problem: 'パスワード再設定に失敗しました',
            resolution: 'しばらく時間をおいてから再度お試しください',
            action: {
                label: <RotateCcw className="mr-2" />,
                execute: () => window.location.reload(),
            },
        },
    };

    const mutation = useMutation<
        unknown,
        ErrorResolution,
        ResetPasswordRequest
    >({
        mutationFn: async ({ token, newPassword }: ResetPasswordRequest) => {
            const result = await authClient.resetPassword({
                token,
                newPassword,
            });

            if (result.error) {
                const code = result.error.code as ResetPasswordErrorCode;

                if (code && code in errorResolutions) {
                    throw errorResolutions[code];
                }

                throw errorResolutions['UNKNOWN'];
            }

            return result.data;
        },
    });
    return {
        mutation,
        resolutions: errorResolutions,
    };
};
