import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

type RenderWithProvidersOptions = {
    initialEntries?: string[];
};

export const renderWithProviders = (
    ui: ReactNode,
    options: RenderWithProvidersOptions = {}
) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={options.initialEntries}>
                {ui}
            </MemoryRouter>
        </QueryClientProvider>
    );
};
