import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { routes } from '../../../shared/routes';
import { SigninForm } from './SigninForm';

const mocks = vi.hoisted(() => ({
    mutate: vi.fn(),
    navigate: vi.fn(),
    useLoginUser: vi.fn(),
}));

vi.mock('@/hooks/useLoginUser', () => ({
    useLoginUser: mocks.useLoginUser,
}));

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();

    return {
        ...actual,
        useNavigate: () => mocks.navigate,
    };
});

const renderSigninForm = () =>
    render(
        <MemoryRouter>
            <SigninForm />
        </MemoryRouter>
    );

const fillValidForm = async () => {
    await userEvent.type(
        screen.getByLabelText('メールアドレス'),
        'user@example.com'
    );

    await userEvent.type(screen.getByLabelText('パスワード'), 'password');
};

describe('SigninForm', () => {
    beforeEach(() => {
        mocks.useLoginUser.mockReturnValue({
            mutate: mocks.mutate,
            isPending: false,
            error: null,
        });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('初期状態ではログインボタンが無効である', () => {
        renderSigninForm();

        expect(screen.getByRole('button', { name: 'ログイン' })).toBeDisabled();
    });

    it('不正なメールアドレスではバリデーションエラーを表示する', async () => {
        renderSigninForm();

        await userEvent.type(
            screen.getByLabelText('メールアドレス'),
            'invalid-email'
        );

        await userEvent.tab();

        expect(
            await screen.findByText(/正しいメールアドレスを入力してください/)
        ).toBeVisible();

        expect(screen.getByRole('button', { name: 'ログイン' })).toBeDisabled();
    });

    it('パスワード未入力ではログインボタンが無効である', async () => {
        renderSigninForm();

        await userEvent.type(
            screen.getByLabelText('メールアドレス'),
            'user@example.com'
        );

        expect(screen.getByRole('button', { name: 'ログイン' })).toBeDisabled();
    });

    it('有効な入力で送信するとメールアドレスとパスワードをmutationへ渡す', async () => {
        renderSigninForm();

        await fillValidForm();

        await userEvent.click(screen.getByRole('button', { name: 'ログイン' }));

        expect(mocks.mutate).toHaveBeenCalledWith(
            {
                email: 'user@example.com',
                password: 'password',
            },
            expect.objectContaining({
                onSuccess: expect.any(Function),
            })
        );
    });

    it('ログイン中はログインボタンが無効になる', async () => {
        mocks.useLoginUser.mockReturnValue({
            mutate: mocks.mutate,
            isPending: true,
            error: null,
        });

        renderSigninForm();

        await fillValidForm();

        expect(screen.getByRole('button', { name: 'ログイン' })).toBeDisabled();
    });

    it('ログイン失敗時はエラーメッセージを表示する', () => {
        mocks.useLoginUser.mockReturnValue({
            mutate: mocks.mutate,
            isPending: false,
            error: new Error(
                'メールアドレスまたはパスワードが正しくありません'
            ),
        });

        renderSigninForm();

        expect(screen.getByText('エラー')).toBeVisible();

        expect(
            screen.getByText('メールアドレスまたはパスワードが正しくありません')
        ).toBeVisible();
    });

    it('ログイン成功時はホームへ遷移する', async () => {
        mocks.mutate.mockImplementation((_data, options) => {
            options?.onSuccess?.();
        });

        renderSigninForm();

        await fillValidForm();

        await userEvent.click(screen.getByRole('button', { name: 'ログイン' }));

        expect(mocks.navigate).toHaveBeenCalledWith(routes.home);
    });
});
