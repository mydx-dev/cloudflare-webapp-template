import { Route, Routes } from 'react-router-dom';
import { GuestLayout } from './layouts/guest/GuestLayout';
import { LoginPage } from './pages/LoginPage';

export const App = () => {
    return (
        <Routes>
            <Route path="/" element={<main></main>} />
            <Route element={<GuestLayout />}>
                <Route path="/sign-in" element={<LoginPage />} />
            </Route>
        </Routes>
    );
};
