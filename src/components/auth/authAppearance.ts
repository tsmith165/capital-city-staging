import { dark } from '@clerk/themes';

const TRANSPARENT_SURFACE = {
    background: 'transparent',
    backgroundImage: 'none',
    boxShadow: 'none',
    border: 'none',
} as const;

/**
 * Clerk ships its own card, header and footer chrome. Dropped into our own panel it reads as a
 * third-party widget nested inside the page, so the duplicate chrome is turned off and the
 * remaining surfaces are mapped onto the site tokens.
 *
 * These are style objects rather than utility class strings on purpose: Clerk's stylesheet is
 * unlayered, so it outranks anything Tailwind emits into `@layer utilities` no matter how
 * specific the selector.
 */
export const authAppearance = {
    baseTheme: dark,
    variables: {
        colorPrimary: '#355e3b',
        colorPrimaryForeground: '#e8e6df',
        colorBackground: 'transparent',
        colorForeground: '#e8e6df',
        colorMutedForeground: '#b4b8ae',
        colorInput: '#232a20',
        colorInputForeground: '#e8e6df',
        colorBorder: '#3d473b',
        colorDanger: '#d97066',
        colorSuccess: '#6ba372',
        borderRadius: '0.5rem',
        fontFamily: 'var(--font-sans)',
    },
    elements: {
        rootBox: { width: '100%' },
        cardBox: { width: '100%', ...TRANSPARENT_SURFACE },
        card: { width: '100%', padding: 0, ...TRANSPARENT_SURFACE },
        header: { display: 'none' },
        footer: { ...TRANSPARENT_SURFACE, marginTop: '1.25rem' },
        footerAction: { justifyContent: 'center' },
        footerActionLink: { color: '#d4af37' },
        socialButtonsBlockButton: { background: '#232a20', borderColor: '#3d473b', color: '#e8e6df' },
        formFieldInput: { background: '#232a20', borderColor: '#3d473b', color: '#e8e6df' },
        formButtonPrimary: { textTransform: 'none', boxShadow: 'none', fontWeight: 600 },
        identityPreviewEditButton: { color: '#d4af37' },
        formResendCodeLink: { color: '#d4af37' },
    },
};
