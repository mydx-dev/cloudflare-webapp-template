import { routes } from '@/../shared/routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useResendInvitation } from './useResendInvitation';

const mocks = vi.hoisted(() => ({
    resendPost: vi.fn(),
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
                    resend: {
                        $post: mocks.resendPost,
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

vi.mock('@/viewModel/ErrorResolution', () => ({
    useGlobalErrorResolutions: () => ({
        UNAUTHORIZED: mocks.unauthorizedResolution,
        FORBIDDEN: mocks.forbiddenResolution,
        INVALID_INPUT: mocks.invalidInputResolution,
        INTERNAL_SERVER_ERROR: mocks.internalServerErrorResolution,
    }),
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

describe('useResendInvitation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('招待IDをresend APIへ渡す', async () => {
        mocks.resendPost.mockResolvedValue({
            status: 200,
            json: async () => ({
                id: 'invitation-id',
            }),
        });

        const { result } = renderHook(() => useResendInvitation(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate('invitation-id');
        });

        await waitFor(() => {
            expect(result.current.mutation.isSuccess).toBe(true);
        });

        expect(mocks.resendPost).toHaveBeenCalledWith({
            param: {
                invitationId: 'invitation-id',
            },
        });
    });

    it('再送成功時はdataを返す', async () => {
        const data = {
            id: 'invitation-id',
        };

        mocks.resendPost.mockResolvedValue({
            status: 200,
            json: async () => data,
        });

        const { result } = renderHook(() => useResendInvitation(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate('invitation-id');
        });

        await waitFor(() => {
            expect(result.current.mutation.data).toEqual(data);
        });
    });

    it('再送成功時は招待一覧のキャッシュを無効化する', async () => {
        mocks.resendPost.mockResolvedValue({
            status: 200,
            json: async () => ({
                id: 'invitation-id',
            }),
        });

        const { result } = renderHook(() => useResendInvitation(), {
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

    it('承認済みの場合は対応するErrorResolutionを返す', async () => {
        mocks.resendPost.mockResolvedValue({
            status: 409,
            json: async () => ({
                code: 'INVITATION_ALREADY_ACCEPTED',
                message: 'Invitation already accepted.',
            }),
        });

        const { result } = renderHook(() => useResendInvitation(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate('invitation-id');
        });

        await waitFor(() => {
            expect(result.current.mutation.error).toMatchObject({
                problem: 'この招待は既に承認されています',
                resolution: '新規招待メールを送信してください',
                action: {
                    label: '招待メール作成へ',
                    execute: expect.any(Function),
                },
            });
        });
    });

    it('招待者不一致の場合は対応するErrorResolutionを返す', async () => {
        mocks.resendPost.mockResolvedValue({
            status: 403,
            json: async () => ({
                code: 'INVITER_MISMATCH',
                message: 'Inviter mismatch.',
            }),
        });

        const { result } = renderHook(() => useResendInvitation(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate('invitation-id');
        });

        await waitFor(() => {
            expect(result.current.mutation.error).toMatchObject({
                problem: '招待者本人のみ再送できます',
                resolution: '招待者本人としてログインしてください',
                action: {
                    label: 'ログインへ',
                    execute: expect.any(Function),
                },
            });
        });
    });

    it('グローバルエラーの場合は対応するErrorResolutionを返す', async () => {
        mocks.resendPost.mockResolvedValue({
            status: 401,
            json: async () => ({
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
            }),
        });

        const { result } = renderHook(() => useResendInvitation(), {
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

    it('承認済みエラーのアクションで招待作成画面へ遷移する', () => {
        const { result } = renderHook(() => useResendInvitation(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.resolutions.INVITATION_ALREADY_ACCEPTED.action?.execute();
        });

        expect(mocks.navigate).toHaveBeenCalledWith(routes.invitation.create);
    });

    it('招待者不一致エラーのアクションでログイン画面へ遷移する', () => {
        const { result } = renderHook(() => useResendInvitation(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.resolutions.INVITER_MISMATCH.action?.execute();
        });

        expect(mocks.navigate).toHaveBeenCalledWith(routes.user.signin);
    });
});
