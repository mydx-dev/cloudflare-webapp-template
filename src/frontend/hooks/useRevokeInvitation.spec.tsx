import { routes } from '@/../shared/routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRevokeInvitation } from './useRevokeInvitation';

const mocks = vi.hoisted(() => ({
    revokePost: vi.fn(),
    invalidateQueries: vi.fn(),
    navigate: vi.fn(),

    unauthorizedResolution: {
        problem: '認証されていません',
        resolution: 'ログインしてください',
    },
    forbiddenResolution: {
        problem: 'アクセス権限がありません',
        resolution: '権限を確認してください',
    },
    invalidInputResolution: {
        problem: '入力内容が不正です',
        resolution: '入力内容を確認してください',
    },
    internalServerErrorResolution: {
        problem: '予期せぬエラーが発生しました',
        resolution: '時間をおいて再度お試しください',
    },
}));

vi.mock('@/lib/apiClient', () => ({
    client: {
        api: {
            invitations: {
                ':invitationId': {
                    revoke: {
                        $post: mocks.revokePost,
                    },
                },
            },
        },
    },
}));

vi.mock('@/lib/queryClient', () => ({
    queryClient: {
        invalidateQueries: mocks.invalidateQueries,
    },
}));

vi.mock('../viewModel/ErrorResolution', () => ({
    useGlobalErrorResolutions: () => ({
        UNAUTHORIZED: mocks.unauthorizedResolution,
        FORBIDDEN: mocks.forbiddenResolution,
        INVALID_INPUT: mocks.invalidInputResolution,
        INTERNAL_SERVER_ERROR: mocks.internalServerErrorResolution,
    }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
    const original = await importOriginal<typeof import('react-router-dom')>();

    return {
        ...original,
        useNavigate: () => mocks.navigate,
    };
});

const createWrapper = () => {
    const client = new QueryClient({
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
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
};

describe('useRevokeInvitation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('招待IDをrevoke APIへ渡す', async () => {
        mocks.revokePost.mockResolvedValue({
            status: 200,
            json: async () => ({
                id: 'invitation-id',
            }),
        });

        const { result } = renderHook(() => useRevokeInvitation(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate('invitation-id');
        });

        await waitFor(() => {
            expect(result.current.mutation.isSuccess).toBe(true);
        });

        expect(mocks.revokePost).toHaveBeenCalledWith({
            param: {
                invitationId: 'invitation-id',
            },
        });
    });

    it('成功時はレスポンスをdataとして返す', async () => {
        const responseBody = {
            id: 'invitation-id',
        };

        mocks.revokePost.mockResolvedValue({
            status: 200,
            json: async () => responseBody,
        });

        const { result } = renderHook(() => useRevokeInvitation(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate('invitation-id');
        });

        await waitFor(() => {
            expect(result.current.mutation.data).toEqual(responseBody);
        });
    });

    it('成功時は招待一覧のキャッシュを無効化する', async () => {
        mocks.revokePost.mockResolvedValue({
            status: 200,
            json: async () => ({
                id: 'invitation-id',
            }),
        });

        const { result } = renderHook(() => useRevokeInvitation(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate('invitation-id');
        });

        await waitFor(() => {
            expect(mocks.invalidateQueries).toHaveBeenCalledWith({
                queryKey: ['invitations'],
            });
        });
    });

    it('招待固有のエラーコードをErrorResolutionへ変換する', async () => {
        mocks.revokePost.mockResolvedValue({
            status: 409,
            json: async () => ({
                code: 'INVITATION_EXPIRED',
                message: 'Invitation has expired.',
            }),
        });

        const { result } = renderHook(() => useRevokeInvitation(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate('invitation-id');
        });

        await waitFor(() => {
            expect(result.current.mutation.error).toMatchObject({
                problem: 'この招待は有効期限が切れています',
                resolution: '既に無効状態のため、取り消しできません',
            });
        });
    });

    it('グローバルエラーコードをErrorResolutionへ変換する', async () => {
        mocks.revokePost.mockResolvedValue({
            status: 401,
            json: async () => ({
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
            }),
        });

        const { result } = renderHook(() => useRevokeInvitation(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate('invitation-id');
        });

        await waitFor(() => {
            expect(result.current.mutation.error).toMatchObject(
                mocks.unauthorizedResolution
            );
        });
    });

    it('招待者不一致の解決アクションでログイン画面へ遷移する', () => {
        const { result } = renderHook(() => useRevokeInvitation(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.resolutions.INVITER_MISMATCH.action?.execute();
        });

        expect(mocks.navigate).toHaveBeenCalledWith(routes.user.signin);
    });
});
