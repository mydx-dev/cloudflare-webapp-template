import { FlatCompat } from '@eslint/eslintrc';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import { fileURLToPath } from 'node:url';

const compat = new FlatCompat({
    baseDirectory: fileURLToPath(new URL('.', import.meta.url)),
});

export default [
    {
        ignores: [
            'dist/**',
            'coverage/**',
            'node_modules/**',
            '.wrangler/**',
            'worker-configuration.d.ts',
        ],
    },
    ...compat.extends(
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'prettier'
    ),
    ...compat.env({ browser: true, node: true, es6: true }),
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            import: importPlugin,
            'react-hooks': reactHooks,
        },
        rules: {
            'no-console': 'warn',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            complexity: ['error', 10],
            'max-lines-per-function': ['warn', 120],
            'max-depth': ['error', 3],
            'import/no-cycle': ['error', { maxDepth: 2 }],
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        {
                            name: 'axios',
                            message:
                                'Use approved runtime gateway instead of axios.',
                        },
                        {
                            name: 'node-fetch',
                            message:
                                'Use approved runtime gateway instead of node-fetch.',
                        },
                        {
                            name: 'got',
                            message:
                                'Use approved runtime gateway instead of got.',
                        },
                    ],
                    patterns: ['@googleapis/*'],
                },
            ],
            'no-restricted-syntax': [
                'error',
                {
                    selector:
                        "JSXAttribute[name.name='dangerouslySetInnerHTML']",
                    message:
                        'Avoid dangerouslySetInnerHTML; render structured data or sanitize it before use.',
                },
                {
                    selector:
                        "AssignmentExpression[left.type='MemberExpression'][left.property.name='innerHTML']",
                    message:
                        'Avoid assigning to innerHTML; use React rendering or sanitize the HTML first.',
                },
                {
                    selector:
                        "CallExpression[callee.property.name='insertAdjacentHTML']",
                    message:
                        'Avoid insertAdjacentHTML; sanitize input or render via React instead.',
                },
                {
                    selector: "MethodDefinition[accessibility='private']",
                    message:
                        'Private methods are disallowed. Keep logic in the main method or extract reusable collaborators.',
                },
            ],
        },
    },
    {
        files: [
            'src/frontend/pages/**/*.tsx',
            'src/frontend/layouts/**/*.tsx',
            'src/frontend/components/**/*.tsx',
            'src/frontend/routes/**/*.tsx',
            'src/frontend/context/**/*.tsx',
        ],
        rules: {
            'max-lines-per-function': 'off',
        },
    },
];
