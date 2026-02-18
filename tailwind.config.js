
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: '#087331',
                    hover: '#065a26',
                    light: '#e8f5ed',
                    accent: '#4ade80',
                    dark: '#050a06',
                },
            },
            borderRadius: {
                'card': '1rem',
                'card-sm': '0.75rem',
                'pill': '9999px',
            },
            spacing: {
                'section': '7rem',
                'section-sm': '5rem',
            },
            maxWidth: {
                'layout': '1200px',
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
}
