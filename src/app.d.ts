declare global {
    // See https://kit.svelte.dev/docs/types#app
    // for information about these interfaces
    // and what to do when importing types
    /// <reference types="@sveltejs/kit" />
    declare namespace App {
        // Locals must be an interface and not a type
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface Locals {
            user: import("lucia").User | null;
            session: import("lucia").Session | null;
        }
    }

    // App version
    declare const __VERSION__: string;
    // git commit sha
    declare const __COMMIT_SHA__: string;
    // Date built
    declare const __LASTMOD__: string;
}

export {};
