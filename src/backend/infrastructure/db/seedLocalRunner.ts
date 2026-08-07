import { seedLocal } from '../../lib/auth/seedLocal';

export default {
    async fetch(): Promise<Response> {
        await seedLocal();
        return new Response('Local seed completed.');
    },
};
