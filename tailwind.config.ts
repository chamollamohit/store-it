import type { Config } from "tailwindcss";
import scrollbarHide from "tailwind-scrollbar-hide";
import tailwindcssAnimate from "tailwindcss-animate";
const config: Config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    plugins: [scrollbarHide, tailwindcssAnimate],
};

export default config;
