import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '../ui/spinner';
import { authClient } from '../../lib/authClient';

type AuthGuardProps = {
    children: ReactNode;
    redirectTo?: string;
};

export const AuthGuard = ({
    children,
    redirectTo = '/sign-in',
}: AuthGuardProps) => {
    const session = authClient.useSession();
    const location = useLocation();

    if (session.isPending) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (!session.data) {
        return (
            <Navigate
                to={redirectTo}
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    return children;
};
