/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    primary: '#0A0A0B',
                    secondary: '#141416',
                    tertiary: '#1C1C1F',
                },
                glass: {
                    bg: 'rgba(255, 255, 255, 0.05)',
                    border: 'rgba(255, 255, 255, 0.1)',
                    hover: 'rgba(255, 255, 255, 0.08)',
                },
                risk: {
                    low: '#10B981',
                    medium: '#F59E0B',
                    high: '#EF4444',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
            },
            backgroundImage: {
                'accent-gradient': 'linear-gradient(135deg, #FF6B6B 0%, #A855F7 100%)',
            }
        },
    },
    plugins: [],
}
