import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreateInvitation } from '@/hooks/useCreateInvitation';
import { client } from '@/lib/apiClient';
import { queryClient } from '@/lib/queryClient';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/lib/apiClient', () => ({
    client: {
        api: {
            invitations: {
                $post: vi.fn(),
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

describe('useCreateInvitation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient.clear();
    });

    it('招待作成APIを入力値で呼び出す', async () => {
        vi.mocked(client.api.invitations.$post).mockResolvedValue({
            status: 201,
            json: vi.fn().mockResolvedValue({
                id: 'invitation-id',
            }),
        } as never);

        const { result } = renderHook(() => useCreateInvitation(), {
            wrapper,
        });

        await act(async () => {
            await result.current.mutation.mutateAsync({
                email: 'user@example.com',
                role: 'user',
            });
        });

        expect(client.api.invitations.$post).toHaveBeenCalledWith({
            json: {
                email: 'user@example.com',
                role: 'user',
            },
        });
    });

    it('招待作成APIのレスポンスを返す', async () => {
        const responseBody = {
            id: 'invitation-id',
        };

        vi.mocked(client.api.invitations.$post).mockResolvedValue({
            status: 201,
            json: vi.fn().mockResolvedValue(responseBody),
        } as never);

        const { result } = renderHook(() => useCreateInvitation(), {
            wrapper,
        });

        await act(async () => {
            await result.current.mutation.mutateAsync({
                email: 'user@example.com',
                role: 'user',
            });
        });

        expect(result.current.mutation.data).toEqual(responseBody);
    });

    it('招待作成成功後に招待一覧をinvalidateする', async () => {
        vi.mocked(client.api.invitations.$post).mockResolvedValue({
            status: 201,
            json: vi.fn().mockResolvedValue({
                id: 'invitation-id',
            }),
        } as never);

        const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useCreateInvitation(), {
            wrapper,
        });

        await act(async () => {
            await result.current.mutation.mutateAsync({
                email: 'user@example.com',
                role: 'user',
            });
        });

        expect(invalidateQueries).toHaveBeenCalledWith({
            queryKey: ['invitations'],
        });
    });

    it('APIエラーをErrorResolutionに変換する', async () => {
        vi.mocked(client.api.invitations.$post).mockResolvedValue({
            status: 422,
            json: vi.fn().mockResolvedValue({
                code: 'INVALID_INPUT',
                message: [
                    {
                        path: 'email',
                        message: 'Invalid email',
                    },
                ],
            }),
        } as never);

        const { result } = renderHook(() => useCreateInvitation(), {
            wrapper,
        });

        act(() => {
            result.current.mutation.mutate({
                email: 'invalid-email',
                role: 'user',
            });
        });

        await waitFor(() => {
            expect(result.current.mutation.isError).toBe(true);
        });

        expect(result.current.mutation.error).toEqual(
            result.current.resolutions.INVALID_INPUT
        );
    });
});
