import { InvitationAcceptForm } from '@/components/invitation/InvitationAcceptForm';
import { toast } from '@/components/ui/toast';
import { useAcceptInvitation } from '@/hooks/useAcceptInvitation';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

vi.mock('@/hooks/useAcceptInvitation', () => ({
    useAcceptInvitation: vi.fn(),
}));

vi.mock('@/hooks/useErrorResolution', () => ({
    useErrorResolution: vi.fn(),
}));

vi.mock('@/components/ui/toast', () => ({
    toast: {
        add: vi.fn(),
    },
}));

const mutate = vi.fn();

const mockUseInvitation = ({
    isPending = false,
    error = null,
}: {
    isPending?: boolean;
    error?: unknown;
} = {}) => {
    vi.mocked(useAcceptInvitation).mockReturnValue({
        mutation: { mutate, isPending, error },
    } as unknown as ReturnType<typeof useAcceptInvitation>);
};

const renderForm = (token = 'test-token') => {
    return render(
        <MemoryRouter
            initialEntries={[
                token
                    ? `/invitations/accept?token=${token}`
                    : '/invitations/accept',
            ]}
        >
            <InvitationAcceptForm />
        </MemoryRouter>
    );
};

const fillValidForm = async () => {
    const user = userEvent.setup();

    await user.type(screen.getByRole('textbox', { name: '名前' }), '山田太郎');

    await user.type(screen.getByLabelText('パスワード'), 'password123');

    await user.type(screen.getByLabelText('確認用パスワード'), 'password123');

    return user;
};

describe('InvitationAcceptForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseInvitation();
    });

    afterEach(() => {
        cleanup();
    });

    it('初期状態では登録ボタンが無効である', () => {
        renderForm();

        expect(screen.getByRole('button', { name: '登録する' })).toBeDisabled();
    });

    it('名前を空欄にした場合はバリデーションエラーを表示する', async () => {
        const user = userEvent.setup();

        renderForm();

        const nameInput = screen.getByLabelText('名前');

        await user.type(nameInput, '山田太郎');
        await user.clear(nameInput);

        expect(await screen.findByText('名前は必須です')).toBeInTheDocument();
    });

    it('パスワードが短い場合はバリデーションエラーを表示する', async () => {
        const user = userEvent.setup();

        renderForm();

        await user.type(screen.getByLabelText('パスワード'), 'short');

        expect(
            await screen.findByText('パスワードは8文字以上である必要があります')
        ).toBeInTheDocument();
    });

    it('確認用パスワードが一致しない場合はエラーを表示する', async () => {
        const user = userEvent.setup();

        renderForm();

        await user.type(
            screen.getByRole('textbox', { name: '名前' }),
            '山田太郎'
        );

        await user.type(screen.getByLabelText('パスワード'), 'password123');

        await user.type(
            screen.getByLabelText('確認用パスワード'),
            'different123'
        );

        expect(
            await screen.findByText(
                'パスワードと確認用パスワードが一致しません'
            )
        ).toBeInTheDocument();
    });

    it('全ての入力が有効なら登録ボタンが有効になる', async () => {
        renderForm();

        await fillValidForm();

        expect(screen.getByRole('button', { name: '登録する' })).toBeEnabled();
    });

    it('有効な入力を送信するとtoken・名前・パスワードをmutationへ渡す', async () => {
        renderForm('invitation-token');

        const user = await fillValidForm();

        await user.click(screen.getByRole('button', { name: '登録する' }));

        expect(mutate).toHaveBeenCalledWith(
            {
                token: 'invitation-token',
                name: '山田太郎',
                password: 'password123',
            },
            expect.objectContaining({
                onSuccess: expect.any(Function),
            })
        );
    });

    it('tokenがない場合はmutationを実行しない', async () => {
        renderForm('');

        const user = await fillValidForm();

        await user.click(screen.getByRole('button', { name: '登録する' }));

        expect(mutate).not.toHaveBeenCalled();
    });

    it('送信中は登録ボタンが無効になる', () => {
        mockUseInvitation({
            isPending: true,
        });

        renderForm();

        expect(screen.getByRole('button', { name: '登録する' })).toBeDisabled();
    });

    it('エラーがある場合はエラー解決情報を表示する', () => {
        mockUseInvitation({
            error: {
                problem: '招待が無効です',
                resolution: '管理者に再招待を依頼してください',
            },
        });

        renderForm();

        expect(screen.getByText('招待が無効です')).toBeInTheDocument();

        expect(
            screen.getByText('管理者に再招待を依頼してください')
        ).toBeInTheDocument();
    });

    it('招待承認成功時は成功トーストを表示する', async () => {
        renderForm();

        const user = await fillValidForm();

        await user.click(screen.getByRole('button', { name: '登録する' }));

        const options = mutate.mock.calls[0][1];

        options.onSuccess();

        expect(toast.add).toHaveBeenCalledWith({
            title: '新規アカウントを登録できました',
            description: 'ログインページにリダイレクトします',
        });
    });
});
