import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../../tests/frontend/renderWithProviders';
import { UserListPage } from './UserListPage';

const {
    deleteMutateAsyncMock,
    signOutMock,
    toggleBanMutateAsyncMock,
    useAdminUsersMock,
} = vi.hoisted(() => ({
    deleteMutateAsyncMock: vi.fn(),
    signOutMock: vi.fn(),
    toggleBanMutateAsyncMock: vi.fn(),
    useAdminUsersMock: vi.fn(),
}));

vi.mock('../lib/authClient', () => ({
    authClient: {
        signOut: signOutMock,
        useSession: () => ({
            data: {
                user: {
                    email: 'admin@example.com',
                    name: 'Admin User',
                },
            },
        }),
    },
}));

vi.mock('../hooks/useAdminUsers', () => ({
    useAdminUsers: useAdminUsersMock,
    useDeleteAdminUser: () => ({
        isPending: false,
        mutateAsync: deleteMutateAsyncMock,
    }),
    useToggleAdminUserBan: () => ({
        isPending: false,
        mutateAsync: toggleBanMutateAsyncMock,
    }),
}));

const usersResponse = {
    total: 1,
    users: [
        {
            id: 'user-1',
            name: '山田 太郎',
            email: 'taro@example.com',
            emailVerified: true,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
            role: 'admin',
            banned: false,
        },
    ],
};

const renderUserListPage = () => {
    return renderWithProviders(
        <Routes>
            <Route path="/users" element={<UserListPage />} />
            <Route path="/users/:id" element={<main>詳細画面</main>} />
        </Routes>,
        { initialEntries: ['/users'] }
    );
};

beforeEach(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    useAdminUsersMock.mockReturnValue({
        data: usersResponse,
        error: null,
        isFetching: false,
        isLoading: false,
    });
    deleteMutateAsyncMock.mockResolvedValue({ success: true });
    toggleBanMutateAsyncMock.mockResolvedValue({
        user: usersResponse.users[0],
    });
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.clearAllMocks();
});

describe('UserListPage', () => {
    it('ユーザー一覧を表示し、詳細へ遷移できる', async () => {
        renderUserListPage();

        expect(
            screen.getByRole('heading', { name: 'ユーザー管理' })
        ).toBeVisible();
        expect(screen.getByText('山田 太郎')).toBeVisible();
        expect(screen.getByText('taro@example.com')).toBeVisible();
        expect(screen.getByText('管理者')).toBeVisible();
        expect(screen.getAllByText('Active').length).toBeGreaterThan(0);

        await userEvent.click(
            screen.getByRole('link', { name: '山田 太郎 の詳細' })
        );

        expect(await screen.findByText('詳細画面')).toBeVisible();
    });

    it('検索とステータス絞り込みを Query パラメータに反映する', async () => {
        renderUserListPage();

        await userEvent.type(
            screen.getByPlaceholderText('名前またはメールで検索'),
            '山田'
        );
        await userEvent.selectOptions(screen.getByLabelText('ステータス'), [
            'banned',
        ]);

        await waitFor(() => {
            expect(useAdminUsersMock).toHaveBeenLastCalledWith({
                searchValue: '山田',
                status: 'banned',
            });
        });
    });

    it('BAN と削除操作を呼び出す', async () => {
        renderUserListPage();

        await userEvent.click(screen.getByRole('button', { name: 'BAN' }));
        await userEvent.click(screen.getByRole('button', { name: '削除' }));

        expect(toggleBanMutateAsyncMock).toHaveBeenCalledWith(false);
        expect(deleteMutateAsyncMock).toHaveBeenCalledWith('user-1');
    });
});
