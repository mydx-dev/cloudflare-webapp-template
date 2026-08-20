import { routes } from '@/../shared/routes';
import { columns } from '@/components/invitation/columns';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import {
    PageDescription,
    PageTitle,
    PageTitleContainer,
} from '@/components/ui/page';
import { useListInvitation } from '@/hooks/useListInvitation';
import { UserRoundPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const InvitationListPage = () => {
    const {
        query: { data },
    } = useListInvitation();
    const navigate = useNavigate();
    return (
        <div>
            {/* Header Section */}
            <PageTitleContainer>
                <div>
                    <PageTitle>招待一覧</PageTitle>
                    <PageDescription>
                        ユーザーをメールアドレスで招待し、システムへのアクセス権限を付与できます。
                    </PageDescription>
                </div>
                <Button onClick={() => navigate(routes.invitation.create)}>
                    <UserRoundPlus className="w-4 h-4" />
                    ユーザーを招待
                </Button>
            </PageTitleContainer>
            {/* Data Table Container */}
            <DataTable columns={columns} data={data} />
        </div>
    );
};
