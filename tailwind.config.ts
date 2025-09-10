import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    plugins: [
        require("tailwindcss-animate"),
        plugin(function ({ addUtilities }) {
            addUtilities({
                ".remove-scrollbar": {
                    "-ms-overflow-style": "none" /* IE & Edge */,
                    "scrollbar-width": "none" /* Firefox */,
                    "&::-webkit-scrollbar": {
                        display: "none" /* Chrome, Safari, Opera */,
                    },
                },
            });
        }),
    ],
};

export default config;
