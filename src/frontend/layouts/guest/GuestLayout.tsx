import { Outlet } from 'react-router-dom';

export const GuestLayout = () => {
    return (
        <div className="font-body text-on-surface min-h-screen flex flex-col items-center justify-center p-6">
            {/* Brand Header */}
            <header className="mb-12 flex flex-col items-center">
                <div className="mb-6 bg-primary p-4 rounded-lg flex items-center justify-center"></div>
                <h1 className="font-headline text-2xl tracking-tighter text-primary"></h1>
            </header>
            {/* Main Login Card */}
            <main className="w-full max-w-xl">
                <Outlet />
            </main>
            {/* Footer Branding/Policy */}
            <footer className="mt-16 text-center">
                <p className="text-outline text-[10px] font-medium tracking-widest uppercase">
                    © 2026 . All rights reserved.
                </p>
            </footer>
        </div>
    );
};
