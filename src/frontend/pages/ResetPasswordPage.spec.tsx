import { routes } from '@/../shared/routes';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ResetPasswordPage } from './ResetPasswordPage';

const mocks = vi.hoisted(() => ({
    resetPasswordForm: vi.fn(),
}));

vi.mock('@/components/user/ResetPasswordForm', () => ({
    ResetPasswordForm: ({ token }: { token: string }) => {
        mocks.resetPasswordForm(token);

        return <div data-testid="reset-password-form">ResetPasswordForm</div>;
    },
}));

const renderResetPasswordPage = (url: string) =>
    render(
        <MemoryRouter initialEntries={[url]}>
            <ResetPasswordPage />
        </MemoryRouter>
    );

describe('ResetPasswordPage', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('tokenがない場合はエラーを表示する', () => {
        renderResetPasswordPage('/reset-password');

        expect(screen.getByText('トークンが見つかりません')).toBeVisible();

        expect(
            screen.getByText(
                'パスワード再設定リンクをもう一度確認してください。'
            )
        ).toBeVisible();

        expect(
            screen.queryByTestId('reset-password-form')
        ).not.toBeInTheDocument();
    });

    it('tokenがある場合はパスワード再設定画面を表示する', () => {
        renderResetPasswordPage('/reset-password?token=test-token');

        expect(
            screen.getByRole('heading', {
                name: 'パスワード再設定',
            })
        ).toBeVisible();

        expect(
            screen.getByText('新しいパスワードを入力してください。')
        ).toBeVisible();

        expect(screen.getByTestId('reset-password-form')).toBeVisible();
    });

    it('URLのtokenをResetPasswordFormへ渡す', () => {
        renderResetPasswordPage('/reset-password?token=test-token');

        expect(mocks.resetPasswordForm).toHaveBeenCalledWith('test-token');
    });

    it('ログイン画面へ戻るリンクを表示する', () => {
        renderResetPasswordPage('/reset-password?token=test-token');

        expect(
            screen.getByRole('link', {
                name: /ログインに戻る/,
            })
        ).toHaveAttribute('href', routes.user.signin);
    });
});
