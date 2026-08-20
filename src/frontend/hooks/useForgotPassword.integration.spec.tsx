import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { useForgotPassword } from './useForgotPassword';

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

describe('useForgotPassword integration', () => {
    it('実APIと疎通し、不正なメールアドレスをErrorResolutionへ変換する', async () => {
        const { result } = renderHook(() => useForgotPassword(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutate({
                email: 'invalid-email',
            });
        });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toMatchObject({
            problem: 'メールアドレスの形式が正しくありません',
            resolution: 'メールアドレスを確認して再入力してください',
        });
    });
});
