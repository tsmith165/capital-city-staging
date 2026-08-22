import coreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
    {
        ignores: ['.next/**', 'node_modules/**', 'convex/_generated/**', 'next-env.d.ts', 'coverage/**', '_overhaul/**'],
    },
    ...coreWebVitals,
    ...nextTypescript,
    {
        rules: {
            // React escapes text nodes already, so a literal apostrophe is never a correctness
            // issue. The rule only adds churn to prose-heavy marketing copy.
            'react/no-unescaped-entities': 'off',
            // Surfaces unused imports and dead locals, which the previous build had no gate for.
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
            // Remaining hits are client-only randomisation, a hydration guard, and form state
            // reset on fetched data. Each is resolved as its component is rewritten rather than
            // contorted here, so this stays visible without blocking the gate.
            'react-hooks/set-state-in-effect': 'warn',
        },
    },
];

export default config;
