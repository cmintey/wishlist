import type { HTMLAttributes } from "svelte/elements";

declare global {
    // See https://kit.svelte.dev/docs/types#app
    // for information about these interfaces
    // and what to do when importing types
    /// <reference types="@sveltejs/kit" />
    declare namespace App {
        // Locals must be an interface and not a type
        interface Locals {
            user: LocalUser | null;
            isProxyUser: boolean;
            session: import("$lib/generated/prisma/client").Session | null;
            locale: string;
        }
    }

    // App version
    declare const __VERSION__: string;
    // git commit sha
    declare const __COMMIT_SHA__: string;
    // Date built
    declare const __LASTMOD__: string;

    interface IconifyIconHTMLElement extends HTMLAttributes<HTMLElement> {
        icon: string;
        width?: string | number;
        height?: string | number;
        rotate?: string | number;
        flip?: string;
        mode?: "style" | "bg" | "mask" | "svg";
        inline?: boolean;
        noobserver?: boolean;
        loadIcons?: (icons: string[], callback?: IconifyIconLoaderCallback) => IconifyIconLoaderAbort;
    }

    declare namespace svelteHTML {
        interface IntrinsicElements {
            "iconify-icon": IconifyIconHTMLElement;
        }
    }
}

type IconifyIconLoaderCallback = (
    loaded: IconifyIconName[],
    missing: IconifyIconName[],
    pending: IconifyIconName[],
    unsubscribe: IconifyIconLoaderAbort
) => void;

export type IconifyIconLoaderAbort = () => void;

export {};
