import type { Config } from 'tailwindcss';

export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#1a365d',
                'on-primary': '#ffffff',
                error: '#e53e3e',
                highlight: '#e5e9eb',
            },
        },
    },
    plugins: [],
} satisfies Config;
