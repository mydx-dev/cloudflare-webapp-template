import { InvitationForm } from '@/components/invitation/InvitationForm';
import {
    PageDescription,
    PageTitle,
    PageTitleContainer,
} from '@/components/ui/page';

export const InvitationCreatePage = () => {
    return (
        <>
            <PageTitleContainer>
                <div>
                    <PageTitle>ユーザー招待</PageTitle>
                    <PageDescription>
                        メールアドレスとロールを指定して、新規ユーザーを招待できます。
                    </PageDescription>
                </div>
            </PageTitleContainer>
            <InvitationForm />
        </>
    );
};
