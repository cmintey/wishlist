import { sveltekit } from "@sveltejs/kit/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import type { UserConfig } from "vite";

const config: UserConfig = {
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: "autoUpdate",
			manifest: {
				name: "Wishlist",
				short_name: "Wishlist",
				description: "Christmas wishlist you can share with the whole family.",
				theme_color: "#fff",
				icons: [
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png"
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png"
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable"
					}
				]
			},
			devOptions: {
				enabled: true
			}
		})
	],
	server: {
		fs: {
			// Allow serving files from one level up to the project root
			allow: ["./static/img"]
		}
	}
};

export default config;
