import { routes } from '@/../shared/routes';
import { useMutation } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import { authClient } from '../lib/authClient';
import { type ErrorResolution } from '../viewModel/ErrorResolution';

type ForgotPasswordRequest = {
    email: string;
};
type ForgotPasswordErrorCode = 'VALIDATION_ERROR';

export const useForgotPassword = () => {
    const forgotPasswordErrorResolutions: Record<
        ForgotPasswordErrorCode | 'UNKNOWN',
        ErrorResolution
    > = {
        VALIDATION_ERROR: {
            problem: 'メールアドレスの形式が正しくありません',
            resolution: 'メールアドレスを確認して再入力してください',
        },
        UNKNOWN: {
            problem: '不明なエラーが発生しました',
            resolution: '時間をおいて再度お試しください',
            action: {
                label: <RotateCcw className="mr-2" />,
                execute: () => window.location.reload(),
            },
        },
    };

    return useMutation<unknown, ErrorResolution, ForgotPasswordRequest>({
        mutationFn: async ({ email }) => {
            const result = await authClient.requestPasswordReset({
                email,
                redirectTo: routes.user.resetPassword,
            });

            if (result.error) {
                const code = result.error.code as ForgotPasswordErrorCode;

                if (code && code in forgotPasswordErrorResolutions) {
                    throw forgotPasswordErrorResolutions[code];
                }

                throw forgotPasswordErrorResolutions['UNKNOWN'];
            }

            return result.data;
        },
    });
};
