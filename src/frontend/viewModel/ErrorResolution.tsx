import { routes } from '@/../shared/routes';
import { useNavigate } from 'react-router-dom';
import type { GlobalErrorResponses } from '../../backend';

type GlobalErrorCode =
    GlobalErrorResponses[keyof GlobalErrorResponses]['json']['code'];

export type ErrorResolution = {
    problem: string;
    resolution: string;
    action?: {
        label: React.ReactNode;
        execute: () => void | Promise<void>;
    };
};

export const useGlobalErrorResolutions = (): Record<
    GlobalErrorCode,
    ErrorResolution
> => {
    const navigate = useNavigate();

    return {
        UNAUTHORIZED: {
            problem: '認証されていません',
            resolution: 'ログインしてください',
            action: {
                label: 'ログイン画面へ',
                execute: () => navigate(routes.user.signin),
            },
        },
        FORBIDDEN: {
            problem: 'アクセス権限がありません',
            resolution: 'アクセス権限を確認してください',
        },
        INVALID_INPUT: {
            problem: '入力内容が不正です',
            resolution: '入力内容を確認してください',
        },
        INTERNAL_SERVER_ERROR: {
            problem: '予期せぬエラーが発生しました',
            resolution: 'サポートに問い合わせてください',
        },
    };
};
