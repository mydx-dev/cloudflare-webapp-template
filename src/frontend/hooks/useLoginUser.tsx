import { useMutation } from '@tanstack/react-query';
import { authClient } from '../lib/authClient';
import { ErrorResolution } from '../viewModel/ErrorResolution';

type LoginCredentials = {
    email: string;
    password: string;
};

export const useLoginUser = () => {
    const errorResolutions: Record<string, ErrorResolution> = {
        INVALID_CREDENTIALS: {
            problem: 'メールアドレスまたはパスワードが正しくありません',
            resolution: '',
        },
    };
    return useMutation({
        mutationFn: async ({ email, password }: LoginCredentials) => {
            const result = await authClient.signIn.email({
                email,
                password,
            });

            if (result.error) {
                throw errorResolutions['INVALID_CREDENTIALS'];
            }

            return result.data;
        },
    });
};
