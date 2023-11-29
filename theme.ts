import type { CustomThemeConfig } from "@skeletonlabs/tw-plugin";

export const theme: CustomThemeConfig = {
    name: "theme",
    properties: {
        // =~= Theme Properties =~=
        "--theme-font-family-base": `Lato, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
        "--theme-font-family-heading": `Lato, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
        "--theme-font-color-base": "var(--color-surface-900)",
        "--theme-font-color-dark": "var(--color-surface-50)",
        "--theme-rounded-base": "12px",
        "--theme-rounded-container": "8px",
        "--theme-border-base": "1px",
        // =~= Theme On-X Colors =~=
        "--on-primary": "255 255 255",
        "--on-secondary": "0 0 0",
        "--on-tertiary": "0 0 0",
        "--on-success": "0 0 0",
        "--on-warning": "0 0 0",
        "--on-error": "255 255 255",
        "--on-surface": "255 255 255",
        // =~= Theme Colors  =~=
        // primary | #a940bf
        "--color-primary-50": "242 226 245", // #f2e2f5
        "--color-primary-100": "238 217 242", // #eed9f2
        "--color-primary-200": "234 207 239", // #eacfef
        "--color-primary-300": "221 179 229", // #ddb3e5
        "--color-primary-400": "195 121 210", // #c379d2
        "--color-primary-500": "169 64 191", // #a940bf
        "--color-primary-600": "152 58 172", // #983aac
        "--color-primary-700": "127 48 143", // #7f308f
        "--color-primary-800": "101 38 115", // #652673
        "--color-primary-900": "83 31 94", // #531f5e
        // secondary | #128ca1
        "--color-secondary-50": "219 238 241", // #dbeef1
        "--color-secondary-100": "208 232 236", // #d0e8ec
        "--color-secondary-200": "196 226 232", // #c4e2e8
        "--color-secondary-300": "160 209 217", // #a0d1d9
        "--color-secondary-400": "89 175 189", // #59afbd
        "--color-secondary-500": "18 140 161", // #128ca1
        "--color-secondary-600": "16 126 145", // #107e91
        "--color-secondary-700": "14 105 121", // #0e6979
        "--color-secondary-800": "11 84 97", // #0b5461
        "--color-secondary-900": "9 69 79", // #09454f
        // tertiary | #33d17a
        "--color-tertiary-50": "224 248 235", // #e0f8eb
        "--color-tertiary-100": "214 246 228", // #d6f6e4
        "--color-tertiary-200": "204 244 222", // #ccf4de
        "--color-tertiary-300": "173 237 202", // #adedca
        "--color-tertiary-400": "112 223 162", // #70dfa2
        "--color-tertiary-500": "51 209 122", // #33d17a
        "--color-tertiary-600": "46 188 110", // #2ebc6e
        "--color-tertiary-700": "38 157 92", // #269d5c
        "--color-tertiary-800": "31 125 73", // #1f7d49
        "--color-tertiary-900": "25 102 60", // #19663c
        // success | #84cc16
        "--color-success-50": "237 247 220", // #edf7dc
        "--color-success-100": "230 245 208", // #e6f5d0
        "--color-success-200": "224 242 197", // #e0f2c5
        "--color-success-300": "206 235 162", // #ceeba2
        "--color-success-400": "169 219 92", // #a9db5c
        "--color-success-500": "132 204 22", // #84cc16
        "--color-success-600": "119 184 20", // #77b814
        "--color-success-700": "99 153 17", // #639911
        "--color-success-800": "79 122 13", // #4f7a0d
        "--color-success-900": "65 100 11", // #41640b
        // warning | #EAB308
        "--color-warning-50": "252 244 218", // #fcf4da
        "--color-warning-100": "251 240 206", // #fbf0ce
        "--color-warning-200": "250 236 193", // #faecc1
        "--color-warning-300": "247 225 156", // #f7e19c
        "--color-warning-400": "240 202 82", // #f0ca52
        "--color-warning-500": "234 179 8", // #EAB308
        "--color-warning-600": "211 161 7", // #d3a107
        "--color-warning-700": "176 134 6", // #b08606
        "--color-warning-800": "140 107 5", // #8c6b05
        "--color-warning-900": "115 88 4", // #735804
        // error | #c92424
        "--color-error-50": "247 222 222", // #f7dede
        "--color-error-100": "244 211 211", // #f4d3d3
        "--color-error-200": "242 200 200", // #f2c8c8
        "--color-error-300": "233 167 167", // #e9a7a7
        "--color-error-400": "217 102 102", // #d96666
        "--color-error-500": "201 36 36", // #c92424
        "--color-error-600": "181 32 32", // #b52020
        "--color-error-700": "151 27 27", // #971b1b
        "--color-error-800": "121 22 22", // #791616
        "--color-error-900": "98 18 18", // #621212
        // surface | #423654
        "--color-surface-50": "227 225 229", // #e3e1e5
        "--color-surface-100": "217 215 221", // #d9d7dd
        "--color-surface-200": "208 205 212", // #d0cdd4
        "--color-surface-300": "179 175 187", // #b3afbb
        "--color-surface-400": "123 114 135", // #7b7287
        "--color-surface-500": "66 54 84", // #423654
        "--color-surface-600": "59 49 76", // #3b314c
        "--color-surface-700": "50 41 63", // #32293f
        "--color-surface-800": "40 32 50", // #282032
        "--color-surface-900": "32 26 41" // #201a29
    }
};
