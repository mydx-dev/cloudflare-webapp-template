import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLoginUser } from './useLoginUser';

const mocks = vi.hoisted(() => ({
    signInEmail: vi.fn(),
    refetch: vi.fn(),
    useSession: vi.fn(),
}));

vi.mock('../lib/authClient', () => ({
    authClient: {
        signIn: {
            email: mocks.signInEmail,
        },
        useSession: mocks.useSession,
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
            {children}
        </QueryClientProvider>
    );
};

describe('useLoginUser', () => {
    beforeEach(() => {
        mocks.useSession.mockReturnValue({
            refetch: mocks.refetch,
        });

        mocks.refetch.mockResolvedValue(undefined);
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('メールアドレスとパスワードをsignIn.emailへ渡す', async () => {
        mocks.signInEmail.mockResolvedValue({
            data: {
                user: {
                    id: 'user-id',
                },
            },
            error: null,
        });

        const { result } = renderHook(() => useLoginUser(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({
            email: 'user@example.com',
            password: 'password',
        });

        await waitFor(() => {
            expect(mocks.signInEmail).toHaveBeenCalledWith({
                email: 'user@example.com',
                password: 'password',
            });
        });
    });

    it('ログイン失敗時はエラーを返す', async () => {
        mocks.signInEmail.mockResolvedValue({
            data: null,
            error: {
                message: 'Invalid email or password',
            },
        });

        const { result } = renderHook(() => useLoginUser(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({
            email: 'user@example.com',
            password: 'wrong-password',
        });

        await waitFor(() => {
            expect(result.current.error).toEqual({
                problem: 'メールアドレスまたはパスワードが正しくありません',
                resolution: '',
            });
        });

        expect(mocks.refetch).not.toHaveBeenCalled();
    });

    it('ログイン成功時はdataを返す', async () => {
        const data = {
            user: {
                id: 'user-id',
            },
        };

        mocks.signInEmail.mockResolvedValue({
            data,
            error: null,
        });

        const { result } = renderHook(() => useLoginUser(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({
            email: 'user@example.com',
            password: 'password',
        });

        await waitFor(() => {
            expect(result.current.data).toEqual(data);
        });
    });
});
