import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner } from '../ui/spinner';
import { authClient } from '../../lib/authClient';

type GuestOnlyGuardProps = {
    children: ReactNode;
    redirectTo?: string;
};

export const GuestOnlyGuard = ({
    children,
    redirectTo = '/',
}: GuestOnlyGuardProps) => {
    const session = authClient.useSession();

    if (session.isPending) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (session.data) {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};
