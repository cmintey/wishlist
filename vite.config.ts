import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import { exec } from "child_process";
import { env } from "process";
import { promisify } from "util";
import type { UserConfig } from "vite";

// Get current tag/commit and last commit date from git
const pexec = promisify(exec);
const [version, sha] = (
    await Promise.all([
        env.VERSION ?? pexec("git describe --tags || git rev-parse --short HEAD").then((v) => v.stdout.trim()),
        env.SHA ?? pexec("git rev-parse --short HEAD").then((v) => v.stdout.trim())
    ])
).map((v) => JSON.stringify(v));

const config: UserConfig = {
    plugins: [
        tailwindcss(),
        sveltekit(),
        SvelteKitPWA({
            registerType: "autoUpdate",
            manifest: {
                name: "Wishlist",
                short_name: "Wishlist",
                description: "Christmas wishlist you can share with the whole family.",
                theme_color: "#423654",
                icons: [
                    {
                        src: "/android-chrome-192x192.png",
                        sizes: "192x192",
                        type: "image/png"
                    },
                    {
                        src: "/android-chrome-512x512.png",
                        sizes: "512x512",
                        type: "image/png"
                    },
                    {
                        src: "/android-chrome-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable"
                    }
                ],
                share_target: {
                    action: "/items/import",
                    method: "GET",
                    params: {
                        url: "url",
                        text: "text",
                        title: "title"
                    }
                }
            },
            devOptions: {
                enabled: true,
                type: "module",
                navigateFallback: "/"
            }
        })
    ],
    server: {
        fs: {
            // Allow serving files from one level up to the project root
            allow: ["./static/"]
        }
    },
    define: {
        __VERSION__: version,
        __COMMIT_SHA__: sha,
        __LASTMOD__: Date.now()
    },
    build: {
        rollupOptions: {
            external: ["sharp"]
        }
    }
};

export default config;
