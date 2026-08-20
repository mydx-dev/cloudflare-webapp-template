import { routes } from '@/../shared/routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useForgotPassword } from './useForgotPassword';

const mocks = vi.hoisted(() => ({
    requestPasswordReset: vi.fn(),
}));

vi.mock('../lib/authClient', () => ({
    authClient: {
        requestPasswordReset: mocks.requestPasswordReset,
    },
}));

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

describe('useForgotPassword', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('メールアドレスとリダイレクト先をrequestPasswordResetへ渡す', async () => {
        mocks.requestPasswordReset.mockResolvedValue({
            data: {
                status: true,
            },
            error: null,
        });

        const { result } = renderHook(() => useForgotPassword(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutate({
                email: 'user@example.com',
            });
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mocks.requestPasswordReset).toHaveBeenCalledWith({
            email: 'user@example.com',
            redirectTo: routes.user.resetPassword,
        });
    });

    it('パスワード再設定メール要求成功時はdataを返す', async () => {
        const data = {
            status: true,
        };

        mocks.requestPasswordReset.mockResolvedValue({
            data,
            error: null,
        });

        const { result } = renderHook(() => useForgotPassword(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutate({
                email: 'user@example.com',
            });
        });

        await waitFor(() => {
            expect(result.current.data).toEqual(data);
        });
    });

    it('VALIDATION_ERRORの場合は対応するErrorResolutionを返す', async () => {
        mocks.requestPasswordReset.mockResolvedValue({
            data: null,
            error: {
                code: 'VALIDATION_ERROR',
            },
        });

        const { result } = renderHook(() => useForgotPassword(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutate({
                email: 'invalid-email',
            });
        });

        await waitFor(() => {
            expect(result.current.error).toMatchObject({
                problem: 'メールアドレスの形式が正しくありません',
                resolution: 'メールアドレスを確認して再入力してください',
            });
        });
    });

    it('未知のエラーコードの場合は汎用ErrorResolutionを返す', async () => {
        mocks.requestPasswordReset.mockResolvedValue({
            data: null,
            error: {
                code: 'UNKNOWN_ERROR_CODE',
            },
        });

        const { result } = renderHook(() => useForgotPassword(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutate({
                email: 'user@example.com',
            });
        });

        await waitFor(() => {
            expect(result.current.error).toMatchObject({
                problem: '不明なエラーが発生しました',
                resolution: '時間をおいて再度お試しください',
                action: {
                    execute: expect.any(Function),
                },
            });
        });
    });

    it('エラーコードがない場合は汎用ErrorResolutionを返す', async () => {
        mocks.requestPasswordReset.mockResolvedValue({
            data: null,
            error: {
                message: 'Unknown error',
            },
        });

        const { result } = renderHook(() => useForgotPassword(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutate({
                email: 'user@example.com',
            });
        });

        await waitFor(() => {
            expect(result.current.error).toMatchObject({
                problem: '不明なエラーが発生しました',
                resolution: '時間をおいて再度お試しください',
                action: {
                    execute: expect.any(Function),
                },
            });
        });
    });
});
