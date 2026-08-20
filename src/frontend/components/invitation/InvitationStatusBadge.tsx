import { Badge } from '@/components/ui/badge';
import { type InvitationStatus } from '@/viewModel/InvitationViewModel';

export const InvitationStatusBadge = ({
    status,
}: {
    status: InvitationStatus;
}) => {
    if (status === '承認待ち') {
        return (
            <Badge variant="secondary" size="lg">
                {status}
            </Badge>
        );
    } else if (status === '承認済み') {
        return (
            <Badge variant="success" size="lg">
                {status}
            </Badge>
        );
    } else if (status === '取り消し済み') {
        return (
            <Badge variant="destructive" size="lg">
                {status}
            </Badge>
        );
    } else if (status === '期限切れ') {
        return (
            <Badge variant="warning" size="lg">
                {status}
            </Badge>
        );
    } else {
        return <Badge size="lg">{status}</Badge>;
    }
};
