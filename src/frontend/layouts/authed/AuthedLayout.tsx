import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const AuthedLayout = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar />
            <div className="md:pl-60">
                <Header />
                <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
