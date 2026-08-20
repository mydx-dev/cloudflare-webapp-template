import { cleanup, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { renderWithProviders } from '../../../../tests/frontend/renderWithProviders';
import { ForgotPasswordForm } from './ForgotPasswordForm';

const mocks = vi.hoisted(() => ({
    mutate: vi.fn(),
    useForgotPassword: vi.fn(),
    toastAdd: vi.fn(),
}));

vi.mock('@/hooks/useForgotPassword', () => ({
    useForgotPassword: mocks.useForgotPassword,
}));

vi.mock('../ui/toast', () => ({
    toast: {
        add: mocks.toastAdd,
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

const renderForgotPasswordForm = () =>
    renderWithProviders(<ForgotPasswordForm />);

const fillEmail = async (email = 'user@example.com') => {
    await userEvent.type(screen.getByLabelText('メールアドレス'), email);
};

describe('ForgotPasswordForm', () => {
    beforeEach(() => {
        mocks.useForgotPassword.mockReturnValue({
            mutate: mocks.mutate,
            isPending: false,
            error: null,
        });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('初期状態では送信ボタンが無効である', () => {
        renderForgotPasswordForm();

        expect(
            screen.getByRole('button', {
                name: /再設定メールを送信/,
            })
        ).toBeDisabled();
    });

    it('メールアドレスが不正な場合はエラーを表示する', async () => {
        renderForgotPasswordForm();

        await fillEmail('invalid-email');

        expect(
            await screen.findByText(/有効なメールアドレスを入力してください/)
        ).toBeVisible();

        expect(
            screen.getByRole('button', {
                name: /再設定メールを送信/,
            })
        ).toBeDisabled();
    });

    it('有効なメールアドレスをmutationへ渡す', async () => {
        renderForgotPasswordForm();

        await fillEmail();

        await userEvent.click(
            screen.getByRole('button', {
                name: /再設定メールを送信/,
            })
        );

        expect(mocks.mutate).toHaveBeenCalledWith(
            {
                email: 'user@example.com',
            },
            expect.objectContaining({
                onSuccess: expect.any(Function),
            })
        );
    });

    it('送信中は送信ボタンを無効化する', async () => {
        mocks.useForgotPassword.mockReturnValue({
            mutate: mocks.mutate,
            isPending: true,
            error: null,
        });

        renderForgotPasswordForm();

        await fillEmail();

        expect(
            screen.getByRole('button', {
                name: /再設定メールを送信/,
            })
        ).toBeDisabled();

        expect(screen.getByRole('status')).toBeVisible();
    });

    it('送信成功時は成功toastを表示する', async () => {
        mocks.mutate.mockImplementation((_values, options) => {
            options?.onSuccess?.();
        });

        renderForgotPasswordForm();

        await fillEmail();

        await userEvent.click(
            screen.getByRole('button', {
                name: /再設定メールを送信/,
            })
        );

        expect(mocks.toastAdd).toHaveBeenCalledWith({
            title: 'パスワード再設定メールを送信しました',
            description:
                'user@example.com にパスワード再設定メールを送信しました。',
            type: 'success',
        });
    });

    it('送信失敗時はErrorResolutionを表示する', () => {
        mocks.useForgotPassword.mockReturnValue({
            mutate: mocks.mutate,
            isPending: false,
            error: {
                problem: '不明なエラーが発生しました',
                resolution: '時間をおいて再度お試しください',
            },
        });

        renderForgotPasswordForm();

        expect(screen.getByTestId('error-resolution-alert')).toBeVisible();

        expect(screen.getByText('不明なエラーが発生しました')).toBeVisible();

        expect(
            screen.getByText('時間をおいて再度お試しください')
        ).toBeVisible();
    });
});
