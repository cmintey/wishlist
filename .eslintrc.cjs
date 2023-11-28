module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    extends: ["eslint:recommended", "plugin:svelte/prettier", "plugin:@typescript-eslint/recommended", "prettier"],
    plugins: ["@typescript-eslint"],
    ignorePatterns: ["*.cjs"],
    rules: {
        "svelte/sort-attributes": "warn",
        "svelte/shorthand-directive": [
            "warn",
            {
                prefer: "always"
            }
        ]
    },
    overrides: [
        {
            files: ["*.svelte"],
            parser: "svelte-eslint-parser",
            // Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
            parserOptions: {
                parser: "@typescript-eslint/parser"
            }
        },
        {
            files: ["*.ts", "*.mts", "*.cts", "*.tsx", "*.svelte"],
            rules: {
                "no-undef": "off",
                "@typescript-eslint/no-explicit-any": "off"
            }
        }
    ],
    parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020
    },
    env: {
        browser: true,
        es2017: true,
        node: true
    }
};
