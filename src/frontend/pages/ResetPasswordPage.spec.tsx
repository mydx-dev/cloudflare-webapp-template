import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../../tests/frontend/renderWithProviders';
import { ResetPasswordPage } from './ResetPasswordPage';

const { resetPasswordMock } = vi.hoisted(() => {
    return {
        resetPasswordMock: vi.fn(),
    };
});

vi.mock('../lib/authClient', () => ({
    authClient: {
        resetPassword: resetPasswordMock,
    },
}));

const validToken = 'valid-reset-token';
const validPassword = 'Password1';

const renderResetPasswordPage = (
    initialEntry = `/reset-password?token=${validToken}`
) => {
    return renderWithProviders(
        <Routes>
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
                path="/forgot-password"
                element={<main>再設定メール画面</main>}
            />
            <Route path="/sign-in" element={<main>ログイン画面</main>} />
        </Routes>,
        { initialEntries: [initialEntry] }
    );
};

const fillResetPasswordForm = async (
    newPassword = validPassword,
    confirmPassword = validPassword
) => {
    await userEvent.type(
        screen.getByLabelText('新しいパスワード'),
        newPassword
    );
    await userEvent.type(
        screen.getByLabelText('パスワードの確認'),
        confirmPassword
    );
};

beforeEach(() => {
    resetPasswordMock.mockResolvedValue({
        data: { status: true },
        error: null,
    });
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('初期状態', () => {
    it('新しいパスワードと確認用パスワードと保存ボタンが表示される', () => {
        renderResetPasswordPage();

        expect(screen.getByLabelText('新しいパスワード')).toBeVisible();
        expect(screen.getByLabelText('パスワードの確認')).toBeVisible();
        expect(
            screen.getByRole('button', { name: /パスワードを保存/i })
        ).toBeVisible();
    });

    it('ログイン画面へ戻れる', async () => {
        renderResetPasswordPage();

        await userEvent.click(
            screen.getByRole('link', { name: /ログインに戻る/i })
        );

        expect(await screen.findByText('ログイン画面')).toBeVisible();
    });
});

describe('リセットトークン', () => {
    it('トークンが欠落している場合、無効リンクの画面を表示してAPIを呼び出さない', () => {
        renderResetPasswordPage('/reset-password');

        expect(
            screen.getByText(
                'パスワード再設定リンクが無効、または期限切れです。再度パスワード再設定をお試しください。'
            )
        ).toBeVisible();
        expect(resetPasswordMock).not.toHaveBeenCalled();
    });

    it('Better Authから無効トークンとして戻された場合、再設定メール画面へ移動できる', async () => {
        renderResetPasswordPage('/reset-password?error=INVALID_TOKEN');

        await userEvent.click(
            screen.getByRole('link', { name: /再設定メールを再送する/i })
        );

        expect(await screen.findByText('再設定メール画面')).toBeVisible();
        expect(resetPasswordMock).not.toHaveBeenCalled();
    });
});

describe('パスワード入力', () => {
    it('パスワード要件を満たさない場合、エラーメッセージが表示される', async () => {
        renderResetPasswordPage();

        await fillResetPasswordForm('password', 'password');

        expect(
            await screen.findByText(
                /パスワードは英語大文字、小文字、数字を含む必要があります/i
            )
        ).toBeVisible();
        expect(
            screen.getByRole('button', { name: /パスワードを保存/i })
        ).toBeDisabled();
    });

    it('確認用パスワードが一致しない場合、エラーメッセージが表示される', async () => {
        renderResetPasswordPage();

        await fillResetPasswordForm(validPassword, 'Password2');

        expect(
            await screen.findByText(
                /パスワードと確認用パスワードが一致しません/i
            )
        ).toBeVisible();
        expect(
            screen.getByRole('button', { name: /パスワードを保存/i })
        ).toBeDisabled();
    });
});

describe('パスワード再設定', () => {
    it('有効なトークンとパスワードで再設定要求を送信し、成功後にログイン画面へ遷移する', async () => {
        renderResetPasswordPage();

        await fillResetPasswordForm();
        await userEvent.click(
            screen.getByRole('button', { name: /パスワードを保存/i })
        );

        await waitFor(() => {
            expect(resetPasswordMock).toHaveBeenCalledWith({
                token: validToken,
                newPassword: validPassword,
            });
        });
        expect(await screen.findByText('ログイン画面')).toBeVisible();
    });

    it('無効または期限切れトークンによる失敗時に、機密情報を含まないエラーメッセージを表示する', async () => {
        resetPasswordMock.mockResolvedValue({
            data: null,
            error: { message: 'INVALID_TOKEN' },
        });
        renderResetPasswordPage();

        await fillResetPasswordForm();
        await userEvent.click(
            screen.getByRole('button', { name: /パスワードを保存/i })
        );

        expect(
            await screen.findByText(
                'パスワードの再設定に失敗しました。再度お試しください。'
            )
        ).toBeVisible();
        expect(screen.queryByText(validToken)).toBeNull();
    });

    it('送信中はボタンを無効化してスピナーを表示し、二重送信を防止する', async () => {
        resetPasswordMock.mockReturnValue(new Promise(() => undefined));
        renderResetPasswordPage();

        await fillResetPasswordForm();
        const submitButton = screen.getByRole('button', {
            name: /パスワードを保存/i,
        });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(submitButton).toBeDisabled();
            expect(resetPasswordMock).toHaveBeenCalledOnce();
        });
        expect(screen.getByRole('status')).toBeVisible();
    });
});
