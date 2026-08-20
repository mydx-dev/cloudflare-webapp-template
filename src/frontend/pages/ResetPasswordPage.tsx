import { routes } from '@/../shared/routes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    PageDescription,
    PageTitle,
    PageTitleContainer,
} from '@/components/ui/page';
import { Separator } from '@/components/ui/separator';
import { ResetPasswordForm } from '@/components/user/ResetPasswordForm';
import { ArrowLeft, CircleAlert } from 'lucide-react';
import { NavLink, useSearchParams } from 'react-router-dom';

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
                <Alert variant="destructive">
                    <CircleAlert className="h-4 w-4" />
                    <AlertTitle>トークンが見つかりません</AlertTitle>
                    <AlertDescription>
                        パスワード再設定リンクをもう一度確認してください。
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <>
            {/* Form Card (The Digital Curator Style) */}
            <PageTitleContainer>
                <div>
                    <PageTitle>パスワード再設定</PageTitle>
                    <PageDescription>
                        新しいパスワードを入力してください。
                    </PageDescription>
                </div>
            </PageTitleContainer>
            <ResetPasswordForm token={token} />
            {/* Back to Login (Subtle Tonal Link) */}
            <Separator className="my-8" />
            <div className="flex justify-center">
                <NavLink
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-container transition-colors"
                    to={routes.user.signin}
                >
                    <ArrowLeft />
                    ログインに戻る
                </NavLink>
            </div>
        </>
    );
};
