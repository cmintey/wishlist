import { join } from "path";
import type { Config } from "tailwindcss";
import { skeleton } from "@skeletonlabs/tw-plugin";
import { theme } from "./theme";
import forms from "@tailwindcss/forms";
import { addIconSelectors, addDynamicIconSelectors } from "@iconify/tailwind";
import { icons as iconSet } from "@iconify-json/ion";

const icons = Object.keys(iconSet.icons).map((iconName) => `ion--${iconName}`);

const config = {
    darkMode: "class",
    content: [
        "./src/**/*.{html,js,svelte,ts}",
        join(require.resolve("@skeletonlabs/skeleton"), "../**/*.{html,js,svelte,ts}")
    ],
    theme: {
        extend: {}
    },
    plugins: [
        forms,
        skeleton({
            themes: {
                custom: [theme]
            }
        }),
        addIconSelectors(["ion"]),
        addDynamicIconSelectors()
    ],
    safelist: [
        // The following are classes defined in i18n files and are used
        "text-secondary-700-200-token",
        "font-bold",
        ...icons
    ]
} satisfies Config;

export default config;
