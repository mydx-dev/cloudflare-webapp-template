import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSignupUser } from './useSignupUser';

const mocks = vi.hoisted(() => ({
    signUpEmail: vi.fn(),
}));

vi.mock('../lib/authClient', () => ({
    authClient: {
        signUp: {
            email: mocks.signUpEmail,
        },
    },
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            mutations: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>{children}</MemoryRouter>
        </QueryClientProvider>
    );
};

describe('useSignupUser', () => {
    beforeEach(() => {
        mocks.signUpEmail.mockResolvedValue({
            data: {
                user: {
                    id: 'user-id',
                },
            },
            error: null,
        });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('名前・メールアドレス・パスワードをsignUp.emailへ渡す', async () => {
        const { result } = renderHook(() => useSignupUser(), {
            wrapper: createWrapper(),
        });

        result.current.mutation.mutate({
            name: '山田 太郎',
            email: 'user@example.com',
            password: 'password123',
        });

        await waitFor(() => {
            expect(mocks.signUpEmail).toHaveBeenCalledWith({
                name: '山田 太郎',
                email: 'user@example.com',
                password: 'password123',
            });
        });
    });

    it('登録成功時はdataを返す', async () => {
        const data = {
            user: {
                id: 'user-id',
            },
        };

        mocks.signUpEmail.mockResolvedValue({
            data,
            error: null,
        });

        const { result } = renderHook(() => useSignupUser(), {
            wrapper: createWrapper(),
        });

        result.current.mutation.mutate({
            name: '山田 太郎',
            email: 'user@example.com',
            password: 'password123',
        });

        await waitFor(() => {
            expect(result.current.mutation.data).toEqual(data);
        });
    });

    it('既知のエラーコードの場合は対応するErrorResolutionを返す', async () => {
        const { result } = renderHook(() => useSignupUser(), {
            wrapper: createWrapper(),
        });

        mocks.signUpEmail.mockResolvedValue({
            data: null,
            error: {
                code: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL',
            },
        });

        result.current.mutation.mutate({
            name: '山田 太郎',
            email: 'user@example.com',
            password: 'password123',
        });

        await waitFor(() => {
            expect(result.current.mutation.error).toMatchObject({
                problem: 'このメールアドレスは既に使用されています',
                resolution:
                    '別のメールアドレスで新規登録するか、作成済みのアカウントでログインしてください',
                action: {
                    label: 'ログイン画面へ',
                    execute: expect.any(Function),
                },
            });
        });
    });

    it('未知のエラーコードの場合は汎用エラーを返す', async () => {
        const { result } = renderHook(() => useSignupUser(), {
            wrapper: createWrapper(),
        });

        mocks.signUpEmail.mockResolvedValue({
            data: null,
            error: {
                code: 'UNKNOWN_ERROR_CODE',
            },
        });

        result.current.mutation.mutate({
            name: '山田 太郎',
            email: 'user@example.com',
            password: 'password123',
        });

        await waitFor(() => {
            expect(result.current.mutation.error).toMatchObject({
                problem: 'ユーザー登録に失敗しました',
                resolution: '時間をおいて再度お試しください',
                action: {
                    execute: expect.any(Function),
                },
            });
        });
    });

    it('エラーコードがない場合は汎用エラーを返す', async () => {
        mocks.signUpEmail.mockResolvedValue({
            data: null,
            error: {
                message: 'unknown',
            },
        });

        const { result } = renderHook(() => useSignupUser(), {
            wrapper: createWrapper(),
        });

        result.current.mutation.mutate({
            name: '山田 太郎',
            email: 'user@example.com',
            password: 'password123',
        });

        await waitFor(() => {
            expect(result.current.mutation.error).toMatchObject({
                problem: 'ユーザー登録に失敗しました',
                resolution: '時間をおいて再度お試しください',
                action: {
                    execute: expect.any(Function),
                },
            });
        });
    });
});
