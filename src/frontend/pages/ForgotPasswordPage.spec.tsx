import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../../tests/frontend/renderWithProviders';
import { ForgotPasswordPage } from './ForgotPasswordPage';

const { requestPasswordResetMock } = vi.hoisted(() => {
    return {
        requestPasswordResetMock: vi.fn(),
    };
});

vi.mock('../lib/authClient', () => ({
    authClient: {
        requestPasswordReset: requestPasswordResetMock,
    },
}));

const renderForgotPasswordPage = () => {
    return renderWithProviders(
        <Routes>
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/sign-in" element={<main>ログイン画面</main>} />
        </Routes>,
        { initialEntries: ['/forgot-password'] }
    );
};

const fillForgotPasswordForm = async (email = 'user@example.com') => {
    await userEvent.type(
        screen.getByPlaceholderText('user@example.com'),
        email
    );
};

beforeEach(() => {
    requestPasswordResetMock.mockResolvedValue({
        data: {},
        error: null,
    });
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('初期状態', () => {
    it('メールアドレス入力欄と送信ボタンとログイン画面へのリンクが表示される', () => {
        renderForgotPasswordPage();

        expect(screen.getByLabelText('メールアドレス')).toBeVisible();
        expect(
            screen.getByRole('button', { name: /再設定メールを送信/i })
        ).toBeVisible();
        expect(
            screen.getByRole('link', { name: /ログイン画面に戻る/i })
        ).toBeVisible();
    });

    it('ログイン画面へ戻れる', async () => {
        renderForgotPasswordPage();

        await userEvent.click(
            screen.getByRole('link', { name: /ログイン画面に戻る/i })
        );

        expect(await screen.findByText('ログイン画面')).toBeVisible();
    });
});

describe('メールアドレス入力', () => {
    it('メールアドレスが不正な場合、エラーメッセージが表示される', async () => {
        renderForgotPasswordPage();

        await fillForgotPasswordForm('invalid-email');

        expect(
            await screen.findByText(/メールアドレスが不正です/i)
        ).toBeVisible();
        expect(
            screen.getByRole('button', { name: /再設定メールを送信/i })
        ).toBeDisabled();
    });
});

describe('パスワード再設定メール送信', () => {
    it('有効なメールアドレスでリセット先を指定して再設定要求を送信する', async () => {
        renderForgotPasswordPage();

        await fillForgotPasswordForm();
        await userEvent.click(
            screen.getByRole('button', { name: /再設定メールを送信/i })
        );

        await waitFor(() => {
            expect(requestPasswordResetMock).toHaveBeenCalledWith({
                email: 'user@example.com',
                redirectTo: '/reset-password',
            });
        });
    });

    it('成功時に登録有無を区別しないメッセージを表示する', async () => {
        renderForgotPasswordPage();

        await fillForgotPasswordForm();
        await userEvent.click(
            screen.getByRole('button', { name: /再設定メールを送信/i })
        );

        expect(
            await screen.findByText(
                '登録されている場合、パスワード再設定メールを送信しました。'
            )
        ).toBeVisible();
    });

    it('失敗時にエラーメッセージを表示する', async () => {
        requestPasswordResetMock.mockResolvedValue({
            data: null,
            error: { message: 'Network Error' },
        });
        renderForgotPasswordPage();

        await fillForgotPasswordForm();
        await userEvent.click(
            screen.getByRole('button', { name: /再設定メールを送信/i })
        );

        expect(
            await screen.findByText(
                'パスワード再設定のリクエストに失敗しました。再度お試しください。'
            )
        ).toBeVisible();
    });

    it('送信中はボタンを無効化してスピナーを表示する', async () => {
        requestPasswordResetMock.mockReturnValue(new Promise(() => undefined));
        renderForgotPasswordPage();

        await fillForgotPasswordForm();
        await userEvent.click(
            screen.getByRole('button', { name: /再設定メールを送信/i })
        );

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /再設定メールを送信/i })
            ).toBeDisabled();
        });
        expect(screen.getByRole('status')).toBeVisible();
    });
});
