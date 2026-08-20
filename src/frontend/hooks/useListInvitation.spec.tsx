import { useListInvitation } from '@/hooks/useListInvitation';
import { client } from '@/lib/apiClient';
import { InvitationViewModel } from '@/viewModel/InvitationViewModel';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/apiClient', () => ({
    client: {
        api: {
            invitations: {
                $get: vi.fn(),
            },
        },
    },
}));

const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

const createWrapper = (queryClient: QueryClient) => {
    return ({ children }: { children: ReactNode }) => (
        <MemoryRouter>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </MemoryRouter>
    );
};

describe('useListInvitation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('取得結果をInvitationViewModelに変換する', async () => {
        vi.mocked(client.api.invitations.$get).mockResolvedValue({
            status: 200,
            json: vi.fn().mockResolvedValue([
                {
                    id: 'invitation-1',
                    inviterId: 'user-1',
                    email: 'invitee@example.com',
                    status: 'pending',
                    role: 'user',
                    createdAt: '2026-08-19T00:00:00.000Z',
                    expiredAt: '2026-08-26T00:00:00.000Z',
                    acceptedAt: null,
                    revokedAt: null,
                },
            ]),
        } as unknown as Awaited<
            ReturnType<typeof client.api.invitations.$get>
        >);

        const queryClient = createQueryClient();

        const { result } = renderHook(() => useListInvitation(), {
            wrapper: createWrapper(queryClient),
        });

        await waitFor(() => {
            expect(client.api.invitations.$get).toHaveBeenCalledTimes(1);
            expect(result.current.query.data).toHaveLength(1);
        });

        expect(result.current.query.data[0]).toBeInstanceOf(
            InvitationViewModel
        );

        expect(result.current.query.data[0]).toMatchObject({
            id: 'invitation-1',
            inviterId: 'user-1',
            inviteeEmail: 'invitee@example.com',
        });
    });

    it('GlobalErrorをErrorResolutionに変換する', async () => {
        vi.mocked(client.api.invitations.$get).mockResolvedValue({
            status: 401,
            json: vi.fn().mockResolvedValue({
                code: 'UNAUTHORIZED',
                message: 'Unauthorized.',
            }),
        } as unknown as Awaited<
            ReturnType<typeof client.api.invitations.$get>
        >);

        const queryClient = createQueryClient();

        const { result } = renderHook(() => useListInvitation(), {
            wrapper: createWrapper(queryClient),
        });

        await waitFor(() => {
            expect(result.current.query.isError).toBe(true);
        });

        expect(result.current.query.error).toEqual({
            problem: '認証されていません',
            resolution: 'ログインしてください',
            action: {
                label: 'ログイン画面へ',
                execute: expect.any(Function),
            },
        });
    });
});
