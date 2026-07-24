import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { App } from './App';

const { useSessionMock } = vi.hoisted(() => ({
    useSessionMock: vi.fn(),
}));

vi.mock('./lib/authClient', () => ({
    authClient: {
        admin: {
            checkRolePermission: vi.fn(() => true),
        },
        useSession: useSessionMock,
    },
}));

test('mounts app', () => {
    useSessionMock.mockReturnValue({
        data: {
            user: { id: 'user-1', role: 'user' },
        },
        isPending: false,
    });

    const { container } = render(
        <MemoryRouter initialEntries={['/']}>
            <App />
        </MemoryRouter>
    );
    expect(container.firstChild).not.toBeNull();
});
