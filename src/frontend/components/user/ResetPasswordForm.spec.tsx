import { routes } from '@/../shared/routes';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { ResetPasswordForm } from './ResetPasswordForm';

const mocks = vi.hoisted(() => ({
    mutate: vi.fn(),
    useResetPassword: vi.fn(),
    toastAdd: vi.fn(),
    toastClose: vi.fn(),
}));

vi.mock('@/hooks/useResetPassword', () => ({
    useResetPassword: mocks.useResetPassword,
}));

vi.mock('@/components/ui/toast', () => ({
    toast: {
        add: mocks.toastAdd,
        close: mocks.toastClose,
    },
}));

vi.mock('../ui/ErrorResolutionAlert', () => ({
    ErrorResolutionAlert: ({
        errorResolution,
    }: {
        errorResolution: {
            problem: string;
            resolution: string;
        };
    }) => (
        <div data-testid="error-resolution-alert">
            <div>{errorResolution.problem}</div>
            <div>{errorResolution.resolution}</div>
        </div>
    ),
}));

const renderResetPasswordForm = () =>
    render(
        <MemoryRouter initialEntries={['/reset-password']}>
            <Routes>
                <Route
                    path="/reset-password"
                    element={<ResetPasswordForm token="test-token" />}
                />

                <Route
                    path={routes.user.signin}
                    element={<div>ログイン画面</div>}
                />
            </Routes>
        </MemoryRouter>
    );

const fillValidForm = async () => {
    await userEvent.type(
        screen.getByLabelText('新しいパスワード'),
        'password123'
    );

    await userEvent.type(
        screen.getByLabelText('パスワードの確認'),
        'password123'
    );
};

describe('ResetPasswordForm', () => {
    beforeEach(() => {
        mocks.useResetPassword.mockReturnValue({
            mutation: {
                mutate: mocks.mutate,
                isPending: false,
                data: null,
                error: null,
            },
        });

        mocks.toastAdd.mockReturnValue('toast-id');
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('初期状態ではパスワードリセットボタンが無効である', () => {
        renderResetPasswordForm();

        expect(
            screen.getByRole('button', {
                name: /パスワードをリセット/,
            })
        ).toBeDisabled();
    });

    it('パスワードが不正な場合はバリデーションエラーを表示する', async () => {
        renderResetPasswordForm();

        await userEvent.type(
            screen.getByLabelText('新しいパスワード'),
            'short'
        );

        await userEvent.tab();

        expect(
            await screen.findByText(/パスワードは8文字以上である必要があります/)
        ).toBeVisible();
    });

    it('確認用パスワードが一致しない場合はエラーを表示する', async () => {
        renderResetPasswordForm();

        await userEvent.type(
            screen.getByLabelText('新しいパスワード'),
            'password123'
        );

        await userEvent.type(
            screen.getByLabelText('パスワードの確認'),
            'different-password'
        );

        await userEvent.tab();

        expect(
            await screen.findByText(
                'パスワードと確認用パスワードが一致しません'
            )
        ).toBeVisible();
    });

    it('有効な入力ではパスワードリセットボタンが有効になる', async () => {
        renderResetPasswordForm();

        await fillValidForm();

        expect(
            screen.getByRole('button', {
                name: /パスワードをリセット/,
            })
        ).toBeEnabled();
    });

    it('送信時にtokenと新しいパスワードをmutationへ渡す', async () => {
        renderResetPasswordForm();

        await fillValidForm();

        await userEvent.click(
            screen.getByRole('button', {
                name: /パスワードをリセット/,
            })
        );

        expect(mocks.mutate).toHaveBeenCalledWith(
            {
                token: 'test-token',
                newPassword: 'password123',
            },
            expect.objectContaining({
                onSuccess: expect.any(Function),
            })
        );
    });

    it('送信中はボタンを無効化してスピナーを表示する', async () => {
        mocks.useResetPassword.mockReturnValue({
            mutation: {
                mutate: mocks.mutate,
                isPending: true,
                data: null,
                error: null,
            },
        });

        renderResetPasswordForm();

        await fillValidForm();

        expect(
            screen.getByRole('button', {
                name: /パスワードをリセット/,
            })
        ).toBeDisabled();

        expect(screen.getByRole('status', { name: '送信中' })).toBeVisible();
    });

    it('登録エラーがある場合はエラー解決情報を表示する', () => {
        const errorResolution = {
            problem: 'パスワードを変更できませんでした',
            resolution: '再度お試しください',
        };

        mocks.useResetPassword.mockReturnValue({
            mutation: {
                mutate: mocks.mutate,
                isPending: false,
                data: null,
                error: errorResolution,
            },
        });

        renderResetPasswordForm();

        expect(screen.getByTestId('error-resolution-alert')).toBeVisible();

        expect(
            screen.getByText('パスワードを変更できませんでした')
        ).toBeVisible();

        expect(screen.getByText('再度お試しください')).toBeVisible();
    });

    it('送信成功時に成功トーストを表示する', async () => {
        mocks.mutate.mockImplementation((_data, options) => {
            options?.onSuccess?.();
        });

        renderResetPasswordForm();

        await fillValidForm();

        await userEvent.click(
            screen.getByRole('button', {
                name: /パスワードをリセット/,
            })
        );

        expect(mocks.toastAdd).toHaveBeenCalledWith({
            title: 'パスワードリセット完了',
            description:
                'パスワードのリセットが完了しました。ログインしてください。',
            type: 'success',
            actionProps: {
                children: 'ログイン画面へ',
                onClick: expect.any(Function),
            },
        });
    });

    it('成功トーストのアクションからログイン画面へ遷移する', async () => {
        mocks.mutate.mockImplementation((_data, options) => {
            options?.onSuccess?.();
        });

        renderResetPasswordForm();

        await fillValidForm();

        await userEvent.click(
            screen.getByRole('button', {
                name: /パスワードをリセット/,
            })
        );

        const toastOptions = mocks.toastAdd.mock.calls[0][0];

        toastOptions.actionProps.onClick();

        expect(mocks.toastClose).toHaveBeenCalledWith('toast-id');

        expect(await screen.findByText('ログイン画面')).toBeVisible();
    });
});
