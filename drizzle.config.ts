import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: 'sqlite',
    schema: [
        './src/backend/infrastructure/db/appSchema.ts',
        './src/backend/infrastructure/db/authSchema.ts',
    ],
    out: './migrations',
});
