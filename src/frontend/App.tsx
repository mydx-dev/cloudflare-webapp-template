import { Route, Routes } from 'react-router-dom';
import { routes } from '../shared/routes';
import { AuthGuard } from './components/guards/AuthGuard';
import { GuestOnlyGuard } from './components/guards/GuestOnlyGuard';
import { PermissionGuard } from './components/guards/PermissionGuard';
import { AuthedLayout } from './layouts/authed/AuthedLayout';
import { GuestLayout } from './layouts/guest/GuestLayout';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { InvitationAcceptPage } from './pages/InvitationAcceptPage';
import { InvitationCreatePage } from './pages/InvitationCreatePage';
import { InvitationListPage } from './pages/InvitationListPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { SigninPage } from './pages/SigninPage';
import { SignupPage } from './pages/SignupPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { UserListPage } from './pages/UserListPage';

const userManagementPermission = {
    user: ['list' as const],
};

export const App = () => {
    return (
        <Routes>
            <Route element={<AuthedLayout />}>
                <Route
                    path={routes.home}
                    element={
                        <main>
                            <h1>Welcome to MyDX</h1>
                            <p>This is the home page.</p>
                        </main>
                    }
                />
                <Route
                    path={routes.user.list}
                    element={
                        <AuthGuard>
                            <PermissionGuard
                                permission={userManagementPermission}
                                redirectTo="/"
                            >
                                <UserListPage />
                            </PermissionGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path={routes.user.detail.path}
                    element={
                        <AuthGuard>
                            <PermissionGuard
                                permission={userManagementPermission}
                                redirectTo="/"
                            >
                                <UserDetailPage />
                            </PermissionGuard>
                        </AuthGuard>
                    }
                />

                <Route
                    path={routes.invitation.list}
                    element={
                        <AuthGuard>
                            <PermissionGuard
                                permission={userManagementPermission}
                                redirectTo="/"
                            >
                                <InvitationListPage />
                            </PermissionGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path={routes.invitation.create}
                    element={
                        <AuthGuard>
                            <PermissionGuard
                                permission={userManagementPermission}
                                redirectTo="/"
                            >
                                <InvitationCreatePage />
                            </PermissionGuard>
                        </AuthGuard>
                    }
                />
            </Route>
            <Route element={<GuestLayout />}>
                <Route
                    path={routes.user.signin}
                    element={
                        <GuestOnlyGuard>
                            <SigninPage />
                        </GuestOnlyGuard>
                    }
                />
                <Route
                    path={routes.user.forgotPassword}
                    element={
                        <GuestOnlyGuard>
                            <ForgotPasswordPage />
                        </GuestOnlyGuard>
                    }
                />
                <Route
                    path={routes.user.resetPassword}
                    element={<ResetPasswordPage />}
                />
                <Route
                    path={routes.user.signup}
                    element={
                        <GuestOnlyGuard>
                            <SignupPage />
                        </GuestOnlyGuard>
                    }
                />
                <Route
                    path={routes.invitation.accept}
                    element={
                        <GuestOnlyGuard>
                            <InvitationAcceptPage />
                        </GuestOnlyGuard>
                    }
                />
            </Route>
        </Routes>
    );
};
