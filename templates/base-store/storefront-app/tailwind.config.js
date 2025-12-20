/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./theme/**/*.liquid",
        "./theme/**/*.js",
    ],
    theme: {
        extend: {
            colors: {
                // Surface colors for warm cream palette
                surface: {
                    50: '#fefdfb',
                    100: '#faf8f5',
                    200: '#f5f1eb',
                    300: '#e8e2d9',
                    400: '#c4bdb2',
                    500: '#9a9285',
                    600: '#6b635a',
                    700: '#4a443d',
                    800: '#2d2924',
                    900: '#1a1815',
                    950: '#0f0e0c',
                },
                // Accent colors for warm terracotta/rust
                accent: {
                    50: '#fef6f3',
                    100: '#fde8e1',
                    200: '#fbd0c3',
                    300: '#f6a98f',
                    400: '#e8785a',
                    500: '#d95f3d',
                    600: '#c44a2a',
                    700: '#a33c22',
                    800: '#873422',
                    900: '#6f2f21',
                },
            },
            fontFamily: {
                sans: ['Source Sans 3', 'Source Sans Pro', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                serif: ['Fraunces', 'Georgia', 'serif'],
            },
        },
    },
    plugins: [],
}
