// https://coolors.co/b99727-d4af37-498352-355e3b-2c4e31

import typography from '@tailwindcss/typography';

const colors = {
    primary: '#b99727',
    primary_dark: '#d4af37',
    secondary_light: '#498352',
    secondary: '#355e3b',
    secondary_dark: '#2c4e31',
    accent_color: '#44403c',
    grey: '#D3D3D3',
};

export default {
    content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors,
        },
        project_name: 'Captial-City-Staging',
    },
    plugins: [typography],
    mode: 'jit',
};
