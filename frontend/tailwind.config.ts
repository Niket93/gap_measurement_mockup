import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: ["./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            borderRadius: {
                lg: "14px"
            }
        }
    },
    plugins: []
} satisfies Config;