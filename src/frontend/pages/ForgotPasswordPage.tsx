import {
    PageDescription,
    PageTitle,
    PageTitleContainer,
} from '@/components/ui/page';
import { Separator } from '@/components/ui/separator';
import { ForgotPasswordForm } from '@/components/user/ForgotPasswordForm';
import { ArrowLeft } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const ForgotPasswordPage = () => {
    return (
        <>
            {/* Reset Password Card */}
            <PageTitleContainer>
                <div>
                    <PageTitle>パスワード再設定</PageTitle>
                    <PageDescription>
                        登録済みのメールアドレスを入力してください。
                        <br />
                        パスワード再設定用のリンクをお送りします。
                    </PageDescription>
                </div>
            </PageTitleContainer>
            <ForgotPasswordForm />
            <Separator className="my-8" />
            {/* Navigation Links */}
            <div className="flex justify-center">
                <NavLink
                    className="inline-flex items-center text-sm font-semibold text-primary transition-colors group "
                    to="/sign-in"
                >
                    <ArrowLeft />
                    <span>ログイン画面に戻る</span>
                </NavLink>
            </div>
        </>
    );
};
