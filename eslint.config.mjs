import tseslint from "typescript-eslint";
import eslintPluginSvelte from "eslint-plugin-svelte";
import globals from "globals";
import svelteParser from "svelte-eslint-parser";
import eslint from "@eslint/js";
import svelteConfig from "./svelte.config.js";

export default tseslint.config(
    {
        ignores: [
            "**/.DS_Store",
            "**/node_modules",
            "build",
            ".svelte-kit",
            "package",
            "**/.env",
            "**/.env.*",
            "!**/.env.example",
            "**/pnpm-lock.yaml",
            "**/package-lock.json",
            "**/yarn.lock"
        ]
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...eslintPluginSvelte.configs["flat/prettier"],
    {
        plugins: {
            "@typescript-eslint": tseslint.plugin
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            },

            parser: tseslint.parser,
            ecmaVersion: 2020,
            sourceType: "module"
        },

        rules: {
            "svelte/sort-attributes": "warn",

            "svelte/shorthand-directive": [
                "warn",
                {
                    prefer: "always"
                }
            ]
        }
    },
    {
        files: ["**/*.svelte"],

        languageOptions: {
            parser: svelteParser,
            ecmaVersion: 5,
            sourceType: "script",

            parserOptions: {
                parser: tseslint.parser,
                svelteConfig
            }
        }
    },
    {
        files: ["**/*.ts", "**/*.mts", "**/*.cts", "**/*.tsx", "**/*.svelte"],

        rules: {
            "no-undef": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn", // or "error"
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_"
                }
            ]
        }
    }
);
