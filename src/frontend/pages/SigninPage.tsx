import { Button } from '@/components/ui/button';
import { SigninForm } from '@/components/user/SigninForm';
import { Loader } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { routes } from '../../shared/routes';
import { authClient } from '../lib/authClient';
import { isPublicSignUpEnabled } from '../lib/signUpConfig';

export const SigninPage = () => {
    const session = authClient.useSession();
    const navigate = useNavigate();

    if (session.isPending) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (session.data) {
        return <Navigate to={routes.home} replace />;
    }

    return (
        <>
            <SigninForm />

            {isPublicSignUpEnabled() && (
                <div className="mt-8 px-4 text-center">
                    <p className="mb-4 text-xs">
                        アカウントをお持ちでないですか？
                    </p>

                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate(routes.user.signup)}
                        className="w-full max-w-xs"
                    >
                        新規登録
                    </Button>
                </div>
            )}
        </>
    );
};
