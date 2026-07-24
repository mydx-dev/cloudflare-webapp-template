import { Route, Routes } from 'react-router-dom';
import { AuthGuard } from './components/guards/AuthGuard';
import { GuestOnlyGuard } from './components/guards/GuestOnlyGuard';
import { GuestLayout } from './layouts/guest/GuestLayout';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { SignupPage } from './pages/SignupPage';
export const App = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <AuthGuard>
                        <main aria-label="Dashboard"></main>
                    </AuthGuard>
                }
            />
            <Route element={<GuestLayout />}>
                <Route
                    path="/sign-in"
                    element={
                        <GuestOnlyGuard>
                            <LoginPage />
                        </GuestOnlyGuard>
                    }
                />
                <Route
                    path="/forgot-password"
                    element={
                        <GuestOnlyGuard>
                            <ForgotPasswordPage />
                        </GuestOnlyGuard>
                    }
                />
                <Route
                    path="/reset-password"
                    element={
                        <GuestOnlyGuard>
                            <ResetPasswordPage />
                        </GuestOnlyGuard>
                    }
                />
                <Route
                    path="/sign-up"
                    element={
                        <GuestOnlyGuard>
                            <SignupPage />
                        </GuestOnlyGuard>
                    }
                />
            </Route>
        </Routes>
    );
};
