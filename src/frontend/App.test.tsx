import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '../shared/routes';
import { App } from './App';

const { useSessionMock } = vi.hoisted(() => ({
    useSessionMock: vi.fn(),
}));

vi.mock('./lib/authClient', () => ({
    authClient: {
        admin: {
            checkRolePermission: vi.fn(() => true),
        },
        useSession: useSessionMock,
    },
}));

vi.mock('./pages/UserListPage', () => ({
    UserListPage: () => <div>UserListPage</div>,
}));

vi.mock('./pages/UserDetailPage', () => ({
    UserDetailPage: () => <div>UserDetailPage</div>,
}));

vi.mock('./pages/InvitationListPage', () => ({
    InvitationListPage: () => <div>InvitationListPage</div>,
}));

vi.mock('./pages/InvitationCreatePage', () => ({
    InvitationCreatePage: () => <div>InvitationCreatePage</div>,
}));

vi.mock('./pages/SigninPage', () => ({
    SigninPage: () => <div>SigninPage</div>,
}));

vi.mock('./pages/ForgotPasswordPage', () => ({
    ForgotPasswordPage: () => <div>ForgotPasswordPage</div>,
}));

vi.mock('./pages/SignupPage', () => ({
    SignupPage: () => <div>SignupPage</div>,
}));

vi.mock('./pages/ResetPasswordPage', () => ({
    ResetPasswordPage: () => <div>ResetPasswordPage</div>,
}));

vi.mock('./pages/InvitationAcceptPage', () => ({
    InvitationAcceptPage: () => <div>InvitationAcceptPage</div>,
}));

const renderRoute = (path: string) =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <App />
        </MemoryRouter>
    );

describe('App routing', () => {
    beforeEach(() => {
        useSessionMock.mockReturnValue({
            data: {
                user: {
                    id: 'user-1',
                    role: 'admin',
                },
            },
            isPending: false,
        });
    });

    afterEach(() => {
        cleanup();
    });

    it('ユーザー一覧ルートでUserListPageを表示する', () => {
        renderRoute(routes.user.list);

        expect(screen.getByText('UserListPage')).toBeInTheDocument();
    });

    it('ユーザー詳細ルートでUserDetailPageを表示する', () => {
        renderRoute(routes.user.detail.build('user-1'));

        expect(screen.getByText('UserDetailPage')).toBeInTheDocument();
    });

    it('招待一覧ルートでInvitationListPageを表示する', () => {
        renderRoute(routes.invitation.list);

        expect(screen.getByText('InvitationListPage')).toBeInTheDocument();
    });

    it('招待作成ルートでInvitationCreatePageを表示する', () => {
        renderRoute(routes.invitation.create);

        expect(screen.getByText('InvitationCreatePage')).toBeInTheDocument();
    });

    it('ログインルートでSigninPageを表示する', () => {
        useSessionMock.mockReturnValue({
            data: null,
            isPending: false,
        });

        renderRoute(routes.user.signin);

        expect(screen.getByText('SigninPage')).toBeInTheDocument();
    });
});
