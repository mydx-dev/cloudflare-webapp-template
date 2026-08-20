import { routes } from '@/../shared/routes';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    PageDescription,
    PageTitle,
    PageTitleContainer,
} from '@/components/ui/page';
import { isPublicSignUpEnabled } from '@/lib/signUpConfig';
import { ArrowLeft, CircleAlert } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { SignUpForm } from '../components/user/SignUpForm';

export const SignupPage = () => {
    const navigate = useNavigate();
    if (!isPublicSignUpEnabled()) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
                <Alert variant="destructive">
                    <CircleAlert className="h-4 w-4" />
                    <AlertDescription>
                        現在、新規ユーザー登録は受け付けていません。管理者から招待されたアカウントでログインしてください。
                    </AlertDescription>
                </Alert>
                <NavLink
                    to={routes.user.signin}
                    className="text-primary mt-4 flex items-center gap-2 font-bold text-sm hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    ログインページへ戻る
                </NavLink>
            </div>
        );
    }

    return (
        <>
            <PageTitleContainer>
                <div>
                    <PageTitle>新規アカウント登録</PageTitle>
                    <PageDescription>
                        アカウント情報を入力してください
                    </PageDescription>
                </div>
            </PageTitleContainer>

            <SignUpForm />
            <div className="mt-8 px-4 text-center">
                <p className="mb-4 text-xs">既にアカウントをお持ちですか？</p>

                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate(routes.user.signin)}
                    className="w-full max-w-xs"
                >
                    ログイン
                </Button>
            </div>
        </>
    );
};
