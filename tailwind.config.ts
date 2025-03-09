import { join } from "path";
import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config = {
    darkMode: "class",
    content: [
        "./src/**/*.{html,js,svelte,ts}",
        join(require.resolve("@skeletonlabs/skeleton"), "../**/*.{html,js,svelte,ts}")
    ],
    theme: {
        extend: {}
    },
    plugins: [forms],
    safelist: [
        // The following are classes defined in i18n files and are used
        "text-secondary-700-200-token",
        "font-bold"
    ]
} satisfies Config;

export default config;
