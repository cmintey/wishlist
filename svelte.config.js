import adapter from "@sveltejs/adapter-node";
import { sveltePreprocess } from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: [
        sveltePreprocess({
            postcss: true
        })
    ],

    kit: {
        adapter: adapter(),
        // Disable default CSRF verification because we have our own
        // implementation that supports multiple origins (ALLOWED_ORIGINS)
        csrf: {
            checkOrigin: false
        }
    }
};

export default config;
