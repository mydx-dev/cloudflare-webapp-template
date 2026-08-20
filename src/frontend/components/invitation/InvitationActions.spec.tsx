import { InvitationActions } from '@/components/invitation/InvitationActions';
import { toast } from '@/components/ui/toast';
import { useResendInvitation } from '@/hooks/useResendInvitation';
import { useRevokeInvitation } from '@/hooks/useRevokeInvitation';
import { InvitationViewModel } from '@/viewModel/InvitationViewModel';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

vi.mock('@/hooks/useResendInvitation', () => ({
    useResendInvitation: vi.fn(),
}));

vi.mock('@/hooks/useRevokeInvitation', () => ({
    useRevokeInvitation: vi.fn(),
}));

vi.mock('@/components/ui/toast', () => ({
    toast: {
        add: vi.fn(),
    },
}));

const resendMutate = vi.fn();
const revokeMutate = vi.fn();

const invitation = new InvitationViewModel({
    id: 'invitation-1',
    inviterId: 'inviter-1',
    email: 'test@example.com',
    role: 'user',
    status: 'pending',
    createdAt: '2026/08/19',
    expiredAt: '2026/08/26',
    acceptedAt: null,
    revokedAt: null,
});

describe('InvitationActions', () => {
    beforeEach(() => {
        vi.mocked(useRevokeInvitation).mockReturnValue({
            mutation: {
                mutate: revokeMutate,
            },
        } as unknown as ReturnType<typeof useRevokeInvitation>);
        vi.mocked(useResendInvitation).mockReturnValue({
            mutation: {
                mutate: resendMutate,
            },
        } as unknown as ReturnType<typeof useResendInvitation>);
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('招待を再送する', async () => {
        const user = userEvent.setup();

        render(<InvitationActions invitation={invitation} />);

        await user.click(screen.getByRole('button', { name: 'Open menu' }));

        await user.click(screen.getByRole('menuitem', { name: '招待を再送' }));

        expect(resendMutate).toHaveBeenCalledWith(
            'invitation-1',
            expect.objectContaining({
                onSuccess: expect.any(Function),
            })
        );
    });

    it('招待再送成功時にトーストを表示する', async () => {
        const user = userEvent.setup();

        render(<InvitationActions invitation={invitation} />);

        await user.click(screen.getByRole('button', { name: 'Open menu' }));

        await user.click(screen.getByRole('menuitem', { name: '招待を再送' }));

        const options = resendMutate.mock.calls[0][1];

        options.onSuccess();

        expect(toast.add).toHaveBeenCalledWith({
            title: '再送信完了',
            description: '招待メールを再送信しました',
            type: 'success',
        });
    });

    it('招待を取り消す', async () => {
        const user = userEvent.setup();

        render(<InvitationActions invitation={invitation} />);

        await user.click(screen.getByRole('button', { name: 'Open menu' }));

        await user.click(
            screen.getByRole('menuitem', { name: '招待を取り消す' })
        );

        expect(revokeMutate).toHaveBeenCalledWith(
            'invitation-1',
            expect.objectContaining({
                onSuccess: expect.any(Function),
            })
        );
    });

    it('招待取り消し成功時にトーストを表示する', async () => {
        const user = userEvent.setup();

        render(<InvitationActions invitation={invitation} />);

        await user.click(screen.getByRole('button', { name: 'Open menu' }));

        await user.click(
            screen.getByRole('menuitem', { name: '招待を取り消す' })
        );

        const options = revokeMutate.mock.calls[0][1];

        options.onSuccess();

        expect(toast.add).toHaveBeenCalledWith({
            title: '招待取り消し完了',
            description: '招待を取り消しました',
            type: 'success',
        });
    });
});
