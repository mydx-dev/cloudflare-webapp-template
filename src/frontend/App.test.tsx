import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import { App } from './App';

test('mounts app', () => {
    const { container } = render(
        <MemoryRouter initialEntries={['/']}>
            <App />
        </MemoryRouter>
    );
    expect(container.firstChild).not.toBeNull();
});
