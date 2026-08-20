import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAcceptInvitation } from '@/hooks/useAcceptInvitation';
import { client } from '@/lib/apiClient';
import { queryClient } from '@/lib/queryClient';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/lib/apiClient', () => ({
    client: {
        api: {
            invitations: {
                accept: {
                    $post: vi.fn(),
                },
            },
        },
    },
}));

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </MemoryRouter>
);

describe('useAcceptInvitation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient.clear();
    });

    it('招待承認APIを入力値で呼び出す', async () => {
        vi.mocked(client.api.invitations.accept.$post).mockResolvedValue({
            status: 200,
            json: vi.fn().mockResolvedValue({
                id: 'user-id',
            }),
        } as never);

        const { result } = renderHook(() => useAcceptInvitation(), {
            wrapper,
        });

        await act(async () => {
            await result.current.mutation.mutateAsync({
                token: 'invitation-token',
                name: 'Test User',
                password: 'Password123!',
            });
        });

        expect(client.api.invitations.accept.$post).toHaveBeenCalledWith({
            json: {
                token: 'invitation-token',
                name: 'Test User',
                password: 'Password123!',
            },
        });
    });

    it('招待承認成功後に招待一覧をinvalidateする', async () => {
        vi.mocked(client.api.invitations.accept.$post).mockResolvedValue({
            status: 200,
            json: vi.fn().mockResolvedValue({
                id: 'user-id',
            }),
        } as never);

        const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useAcceptInvitation(), {
            wrapper,
        });

        await act(async () => {
            await result.current.mutation.mutateAsync({
                token: 'invitation-token',
                name: 'Test User',
                password: 'Password123!',
            });
        });

        expect(invalidateQueries).toHaveBeenCalledWith({
            queryKey: ['invitations'],
        });
    });

    it('招待固有エラーをErrorResolutionに変換する', async () => {
        vi.mocked(client.api.invitations.accept.$post).mockResolvedValue({
            status: 400,
            json: vi.fn().mockResolvedValue({
                code: 'INVALID_INVITATION_TOKEN',
                message: 'Invitation token is invalid.',
            }),
        } as never);

        const { result } = renderHook(() => useAcceptInvitation(), {
            wrapper,
        });

        act(() => {
            result.current.mutation.mutate({
                token: 'invalid-token',
                name: 'Test User',
                password: 'Password123!',
            });
        });

        await waitFor(() => {
            expect(result.current.mutation.isError).toBe(true);
        });

        expect(result.current.mutation.error).toEqual({
            problem: 'トークンが無効です',
            resolution: '招待メールのリンクを確認してください',
        });
    });

    it('グローバルエラーをErrorResolutionに変換する', async () => {
        vi.mocked(client.api.invitations.accept.$post).mockResolvedValue({
            status: 401,
            json: vi.fn().mockResolvedValue({
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
            }),
        } as never);

        const { result } = renderHook(() => useAcceptInvitation(), {
            wrapper,
        });

        act(() => {
            result.current.mutation.mutate({
                token: 'invitation-token',
                name: 'Test User',
                password: 'Password123!',
            });
        });

        await waitFor(() => {
            expect(result.current.mutation.isError).toBe(true);
        });

        expect(result.current.mutation.error).toEqual({
            problem: '認証されていません',
            resolution: 'ログインしてください',
            action: {
                execute: expect.any(Function),
                label: 'ログイン画面へ',
            },
        });
    });
});
