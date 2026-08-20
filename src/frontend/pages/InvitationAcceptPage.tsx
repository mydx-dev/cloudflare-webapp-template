import { InvitationAcceptForm } from '@/components/invitation/InvitationAcceptForm';
import {
    PageDescription,
    PageTitle,
    PageTitleContainer,
} from '@/components/ui/page';

export const InvitationAcceptPage = () => {
    return (
        <>
            <PageTitleContainer>
                <div>
                    <PageTitle>新規アカウント登録</PageTitle>
                    <PageDescription>
                        名前とパスワードを入力して、アカウントを作成できます。
                    </PageDescription>
                </div>
            </PageTitleContainer>
            <InvitationAcceptForm />
        </>
    );
};
