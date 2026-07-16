import { describe, expect, it } from 'vitest';
import app from '../../index';

describe('疎通確認', () => {
    it('healthからOKが返る', async () => {
        const res = await app.request('/api/health');

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({
            status: 'ok',
        });
    });
});
