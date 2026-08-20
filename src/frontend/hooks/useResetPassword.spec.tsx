import { routes } from '@/../shared/routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useResetPassword } from './useResetPassword';

const mocks = vi.hoisted(() => ({
    resetPassword: vi.fn(),
    navigate: vi.fn(),
}));

vi.mock('../lib/authClient', () => ({
    authClient: {
        resetPassword: mocks.resetPassword,
    },
}));

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();

    return {
        ...actual,
        useNavigate: () => mocks.navigate,
    };
});

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

describe('useResetPassword', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('tokenと新しいパスワードをresetPasswordへ渡す', async () => {
        mocks.resetPassword.mockResolvedValue({
            data: {
                success: true,
            },
            error: null,
        });

        const { result } = renderHook(() => useResetPassword(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate({
                token: 'test-token',
                newPassword: 'password123',
            });
        });

        await waitFor(() => {
            expect(result.current.mutation.isSuccess).toBe(true);
        });

        expect(mocks.resetPassword).toHaveBeenCalledWith({
            token: 'test-token',
            newPassword: 'password123',
        });
    });

    it('パスワード再設定成功時はdataを返す', async () => {
        const data = {
            success: true,
        };

        mocks.resetPassword.mockResolvedValue({
            data,
            error: null,
        });

        const { result } = renderHook(() => useResetPassword(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate({
                token: 'test-token',
                newPassword: 'password123',
            });
        });

        await waitFor(() => {
            expect(result.current.mutation.data).toEqual(data);
        });
    });

    it('INVALID_TOKENの場合は対応するErrorResolutionを返す', async () => {
        mocks.resetPassword.mockResolvedValue({
            data: null,
            error: {
                code: 'INVALID_TOKEN',
            },
        });

        const { result } = renderHook(() => useResetPassword(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate({
                token: 'invalid-token',
                newPassword: 'password123',
            });
        });

        await waitFor(() => {
            expect(result.current.mutation.error).toMatchObject({
                problem: 'パスワードリセットトークンが無効です',
                resolution:
                    'パスワードリセットメールのURLを確認する、またはパスワードリセットメールを再送してください',
                action: {
                    label: 'メールを再送',
                    execute: expect.any(Function),
                },
            });
        });
    });

    it('INVALID_TOKENのアクションでパスワード再設定メール画面へ遷移する', () => {
        const { result } = renderHook(() => useResetPassword(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.resolutions.INVALID_TOKEN.action?.execute();
        });

        expect(mocks.navigate).toHaveBeenCalledWith(routes.user.forgotPassword);
    });

    it('未知のエラーコードの場合は汎用ErrorResolutionを返す', async () => {
        mocks.resetPassword.mockResolvedValue({
            data: null,
            error: {
                code: 'UNKNOWN_ERROR_CODE',
            },
        });

        const { result } = renderHook(() => useResetPassword(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate({
                token: 'test-token',
                newPassword: 'password123',
            });
        });

        await waitFor(() => {
            expect(result.current.mutation.error).toMatchObject({
                problem: 'パスワード再設定に失敗しました',
                resolution: 'しばらく時間をおいてから再度お試しください',
                action: {
                    execute: expect.any(Function),
                },
            });
        });
    });

    it('エラーコードがない場合は汎用ErrorResolutionを返す', async () => {
        mocks.resetPassword.mockResolvedValue({
            data: null,
            error: {
                message: 'Unknown error',
            },
        });

        const { result } = renderHook(() => useResetPassword(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate({
                token: 'test-token',
                newPassword: 'password123',
            });
        });

        await waitFor(() => {
            expect(result.current.mutation.error).toMatchObject({
                problem: 'パスワード再設定に失敗しました',
                resolution: 'しばらく時間をおいてから再度お試しください',
                action: {
                    execute: expect.any(Function),
                },
            });
        });
    });
});
