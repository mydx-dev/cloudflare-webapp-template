import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toast';
import { useResendInvitation } from '@/hooks/useResendInvitation';
import { useRevokeInvitation } from '@/hooks/useRevokeInvitation';
import { InvitationViewModel } from '@/viewModel/InvitationViewModel';
import { MoreHorizontal } from 'lucide-react';

export const InvitationActions = ({
    invitation,
}: {
    invitation: InvitationViewModel;
}) => {
    const resendInvitation = useResendInvitation();
    const revokeInvitation = useRevokeInvitation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                }
            />

            <DropdownMenuContent align="end">
                {invitation.isPending && (
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={() =>
                                resendInvitation.mutation.mutate(
                                    invitation.id,
                                    {
                                        onSuccess: () => {
                                            toast.add({
                                                title: '再送信完了',
                                                description:
                                                    '招待メールを再送信しました',
                                                type: 'success',
                                            });
                                        },
                                        onError: (error) => {
                                            const toastId = toast.add({
                                                title: error.problem,
                                                description: error.resolution,
                                                type: 'error',
                                                actionProps: {
                                                    children:
                                                        error.action?.label,
                                                    onClick: () => {
                                                        if (error.action) {
                                                            error.action.execute();
                                                        }
                                                        toast.close(toastId);
                                                    },
                                                },
                                            });
                                        },
                                    }
                                )
                            }
                        >
                            招待を再送
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                                revokeInvitation.mutation.mutate(
                                    invitation.id,
                                    {
                                        onSuccess: () => {
                                            toast.add({
                                                title: '招待取り消し完了',
                                                description:
                                                    '招待を取り消しました',
                                                type: 'success',
                                            });
                                        },
                                        onError: (error) => {
                                            const toastId = toast.add({
                                                title: error.problem,
                                                description: error.resolution,
                                                type: 'error',
                                                actionProps: {
                                                    children:
                                                        error.action?.label,
                                                    onClick: () => {
                                                        if (error.action) {
                                                            error.action.execute();
                                                        }
                                                        toast.close(toastId);
                                                    },
                                                },
                                            });
                                        },
                                    }
                                )
                            }
                        >
                            招待を取り消す
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
