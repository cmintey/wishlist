import { sveltekit } from "@sveltejs/kit/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import type { UserConfig } from "vite";
import { purgeCss } from "vite-plugin-tailwind-purgecss";

const config: UserConfig = {
    plugins: [
        sveltekit(),
        purgeCss(),
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
                ]
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
    }
};

export default config;
