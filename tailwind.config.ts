import typography from '@tailwindcss/typography';
const plugin = require('tailwindcss/plugin')
import { withUt } from 'uploadthing/tw';

const colors = {
    primary: '#b99727',
    primary_dark: '#d4af37',
    secondary_light: '#498352',
    secondary: '#355e3b',
    secondary_dark: '#2c4e31',
    accent_color: '#44403c',
    grey: '#D3D3D3',
};

export default withUt({
    content: ['./src/app/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors,
            fontSize: {
                '4xl': ['2.25rem', '2.75rem'], // Increase the line-height value as needed
            },
        },
        listStyleType: {
            none: 'none',
            disc: 'disc',
            decimal: 'decimal',
            square: 'square',
            roman: 'upper-roman',
        },
        screens: {
            xs: '480px',
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px',
            tm: '864px',
        },
        project_name: 'Captial-City-Staging',
    },
    plugins: [typography, plugin(function ({ addBase, theme }: { addBase: any, theme: any }) {
        addBase({
          ':root': {
            '--color-primary': theme('colors.primary'),
            '--color-primary-dark': theme('colors.primary_dark'),
            '--color-secondary-light': theme('colors.secondary_light'),
            '--color-secondary': theme('colors.secondary'),
            '--color-secondary-dark': theme('colors.secondary_dark'),
          }
        })
      })],
    mode: 'jit',
});
