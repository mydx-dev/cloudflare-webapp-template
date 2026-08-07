import { seedLocal } from './seedLocal';

export default {
    async fetch(): Promise<Response> {
        await seedLocal();
        return new Response('Local seed completed.');
    },
};
