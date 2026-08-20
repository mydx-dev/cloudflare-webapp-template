import { routes } from '@/../shared/routes';
import { useMutation } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../lib/authClient';
import type { ErrorResolution } from '../viewModel/ErrorResolution';

export type SignupErrorCode =
    | 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL'
    | 'UNABLE_TO_CREATE_USER'
    | 'EMAIL_PASSWORD_SIGN_UP_DISABLED';

type SignupRequest = {
    name: string;
    email: string;
    password: string;
};

export const useSignupUser = () => {
    const navigate = useNavigate();

    const errorResolutions: Record<SignupErrorCode, ErrorResolution> = {
        USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: {
            problem: 'このメールアドレスは既に使用されています',
            resolution:
                '別のメールアドレスで新規登録するか、作成済みのアカウントでログインしてください',
            action: {
                label: 'ログイン画面へ',
                execute: () => navigate(routes.user.signin),
            },
        },
        UNABLE_TO_CREATE_USER: {
            problem: 'ユーザー登録に失敗しました',
            resolution: '時間をおいて再度お試しください',
            action: {
                label: <RotateCcw className="mr-2 h-4 w-4" />,
                execute: () => window.location.reload(),
            },
        },
        EMAIL_PASSWORD_SIGN_UP_DISABLED: {
            problem: 'ユーザー登録が無効化されています',
            resolution: '管理者に問い合わせてください',
        },
    };

    const mutation = useMutation<unknown, ErrorResolution, SignupRequest>({
        mutationFn: async ({ name, email, password }: SignupRequest) => {
            const result = await authClient.signUp.email({
                name,
                email,
                password,
            });

            if (result.error) {
                const code = result.error.code as SignupErrorCode;

                if (code && code in errorResolutions) {
                    throw errorResolutions[code];
                }
                throw errorResolutions['UNABLE_TO_CREATE_USER'];
            }

            return result.data;
        },
    });
    return {
        mutation,
        resolutions: errorResolutions,
    };
};
