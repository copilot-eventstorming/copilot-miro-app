/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx, css}",
        "./**/*.html"
    ],
    theme: {
        extend: {
            fontSize: {
                'xxs': '0.5rem',  // 你可以根据你的需求来调整这个值
            },
        },
    },
    variants: {
        extend: {
            backgroundColor: ["active"],
        },
    },
    plugins: [],
}