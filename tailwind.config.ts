import { join } from "path";
import type { Config } from "tailwindcss";

const config = {
    darkMode: "class",
    content: [
        "./src/**/*.{html,js,svelte,ts}",
        join(require.resolve("@skeletonlabs/skeleton"), "../**/*.{html,js,svelte,ts}")
    ],
    theme: {
        extend: {}
    }
} satisfies Config;

export default config;
