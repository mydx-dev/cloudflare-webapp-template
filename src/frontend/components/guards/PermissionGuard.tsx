import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { AuthPermission } from '../../../shared/auth/accessControl';
import { checkRolePermission } from '../../../shared/auth/accessControl';
import { authClient } from '../../lib/authClient';

type PermissionGuardProps = {
    children: ReactNode;
    fallback?: ReactNode;
    permission: AuthPermission;
    redirectTo?: string;
};

type SessionUserWithRole = {
    role?: string | null;
};

export const PermissionGuard = ({
    children,
    fallback = null,
    permission,
    redirectTo,
}: PermissionGuardProps) => {
    const session = authClient.useSession();
    const role = (session.data?.user as SessionUserWithRole | undefined)?.role;
    const hasPermission = checkRolePermission(role, permission);

    if (hasPermission) {
        return children;
    }

    if (redirectTo) {
        return <Navigate to={redirectTo} replace />;
    }

    return fallback;
};
