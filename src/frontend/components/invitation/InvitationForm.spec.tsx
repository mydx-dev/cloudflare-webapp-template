import { InvitationForm } from '@/components/invitation/InvitationForm';
import { toast } from '@/components/ui/toast';
import { useCreateInvitation } from '@/hooks/useCreateInvitation';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

vi.mock('@/hooks/useCreateInvitation', () => ({
    useCreateInvitation: vi.fn(),
}));

vi.mock('@/components/ui/toast', () => ({
    toast: {
        add: vi.fn(),
    },
}));

const mutate = vi.fn();

const mockUseInvitation = ({
    isPending = false,
}: {
    isPending?: boolean;
} = {}) => {
    vi.mocked(useCreateInvitation).mockReturnValue({
        mutation: {
            mutate,
            isPending,
            error: null,
        },
    } as unknown as ReturnType<typeof useCreateInvitation>);
};

const renderInvitationForm = () => {
    return render(
        <MemoryRouter>
            <InvitationForm />
        </MemoryRouter>
    );
};

describe('InvitationForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseInvitation();
    });
    afterEach(() => {
        cleanup();
    });

    it('初期状態では招待ボタンが無効である', () => {
        renderInvitationForm();

        expect(
            screen.getByRole('button', {
                name: '招待メールを送信',
            })
        ).toBeDisabled();
    });

    it('初期状態では招待ボタンが無効である', () => {
        renderInvitationForm();

        expect(
            screen.getByRole('button', {
                name: '招待メールを送信',
            })
        ).toBeDisabled();
    });

    it('不正なメールアドレスではバリデーションエラーを表示する', async () => {
        const user = userEvent.setup();

        renderInvitationForm();

        await user.type(
            screen.getByRole('textbox', {
                name: 'メールアドレス',
            }),
            'invalid-email'
        );

        expect(
            await screen.findByText('メールアドレスが不正です')
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: '招待メールを送信',
            })
        ).toBeDisabled();
    });

    it('メールアドレスだけ有効でもロール未選択なら招待ボタンは無効である', async () => {
        const user = userEvent.setup();

        renderInvitationForm();

        await user.type(
            screen.getByRole('textbox', {
                name: 'メールアドレス',
            }),
            'user@example.com'
        );

        expect(
            screen.getByRole('button', {
                name: '招待メールを送信',
            })
        ).toBeDisabled();
    });

    it('ロールだけ選択してもメールアドレス未入力なら招待ボタンは無効である', async () => {
        const user = userEvent.setup();

        renderInvitationForm();

        await user.click(
            screen.getByRole('combobox', {
                name: 'ロール',
            })
        );

        await user.click(
            screen.getByRole('option', {
                name: '管理者',
            })
        );

        expect(
            screen.getByRole('button', {
                name: '招待メールを送信',
            })
        ).toBeDisabled();
    });

    it('メールアドレスとロールが有効なら招待ボタンが有効になる', async () => {
        const user = userEvent.setup();

        renderInvitationForm();

        await user.type(
            screen.getByRole('textbox', {
                name: 'メールアドレス',
            }),
            'user@example.com'
        );

        await user.click(
            screen.getByRole('combobox', {
                name: 'ロール',
            })
        );

        await user.click(
            screen.getByRole('option', {
                name: '管理者',
            })
        );

        expect(
            screen.getByRole('button', {
                name: '招待メールを送信',
            })
        ).toBeEnabled();
    });

    it('有効な入力で送信するとメールアドレスとロールをmutationへ渡す', async () => {
        const user = userEvent.setup();

        renderInvitationForm();

        await user.type(
            screen.getByRole('textbox', {
                name: 'メールアドレス',
            }),
            'user@example.com'
        );

        await user.click(
            screen.getByRole('combobox', {
                name: 'ロール',
            })
        );

        await user.click(
            screen.getByRole('option', {
                name: '管理者',
            })
        );

        await user.click(
            screen.getByRole('button', {
                name: '招待メールを送信',
            })
        );

        expect(mutate).toHaveBeenCalledWith(
            {
                email: 'user@example.com',
                role: 'admin',
            },
            expect.objectContaining({
                onSuccess: expect.any(Function),
            })
        );
    });

    it('送信中は招待ボタンが無効になる', () => {
        mockUseInvitation({
            isPending: true,
        });

        renderInvitationForm();

        expect(
            screen.getByRole('button', {
                name: '招待メールを送信',
            })
        ).toBeDisabled();
    });

    it('招待成功時は送信先メールアドレスを含む成功トーストを表示する', async () => {
        const user = userEvent.setup();

        renderInvitationForm();

        await user.type(
            screen.getByRole('textbox', {
                name: 'メールアドレス',
            }),
            'user@example.com'
        );

        await user.click(
            screen.getByRole('combobox', {
                name: 'ロール',
            })
        );

        await user.click(
            screen.getByRole('option', {
                name: 'ユーザー',
            })
        );

        await user.click(
            screen.getByRole('button', {
                name: '招待メールを送信',
            })
        );

        const options = mutate.mock.calls[0][1];

        options.onSuccess({
            email: 'user@example.com',
        });

        expect(toast.add).toHaveBeenCalledWith({
            title: '招待完了',
            description: '招待メールをuser@example.comに送信しました',
            type: 'success',
        });
    });
});
