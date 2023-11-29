// Source: https://github.com/MathiasWP/svelte-idle/blob/main/src/index.ts
import { onMount } from "svelte";
import { readable } from "svelte/store";
import type { Subscriber } from "svelte/store";

/**
 * Public stuff
 */
export const idle = readable(false, (set) => (update_store = set) && (() => set(false)));

export type SvelteIdleListenConfig = {
    timer?: number;
    cycle?: number;
};

export function listen(opts: SvelteIdleListenConfig = {}) {
    if (!IS_BROWSER) return;

    if (typeof opts.timer === "number" && opts.timer > 0) idle_timeout_ms = opts.timer;
    if (typeof opts.cycle === "number" && opts.cycle > 0) throttle_timeout_ms = opts.cycle;

    onMount(watch);
}

export function onIdle(cb: () => unknown) {
    if (!IS_BROWSER) return;

    if (!idle_callbacks.has(cb)) idle_callbacks.add(cb);
    return () => idle_callbacks.delete(cb);
}

/**
 * Private stuff
 */
const idle_callbacks: Set<() => unknown> = new Set();

let watchers = 0;
let is_throttling = false;
let update_store: Subscriber<boolean>;
let is_idle = false;
let idle_countdown: /* Timeout */ NodeJS.Timeout;
let idle_timeout_ms = 1_000 * 60 * 10; // Default is 10 minutes
let throttle_timeout_ms = 200;

const IS_BROWSER = typeof window !== "undefined" && typeof document !== "undefined";
const INTERESTING_EVENTS = [
    "keypress",
    "keydown",
    "click",
    "contextmenu",
    "dblclick",
    "mousemove",
    "scroll",
    "touchmove",
    "touchstart"
];

function watch() {
    watchers++;
    if (watchers > 1) return;

    // keeping track of store value for easy access
    const unsubscribe = idle.subscribe((i) => (is_idle = i));

    start_countdown();

    for (const event of INTERESTING_EVENTS) {
        document.addEventListener(event, detect_action, { passive: true });
    }

    return () => {
        watchers--;

        if (watchers === 0) {
            for (const event of INTERESTING_EVENTS) {
                document.removeEventListener(event, detect_action);
            }
            clear_countdown();
            unsubscribe();
        }
    };
}

function start_countdown() {
    idle_countdown = setTimeout(() => {
        update_store(true);
        idle_callbacks.forEach((fn) => fn());
    }, idle_timeout_ms);
}

function clear_countdown() {
    if (idle_countdown) clearTimeout(idle_countdown);
}

function start_throttle() {
    setTimeout(() => (is_throttling = false), throttle_timeout_ms);
}

function detect_action() {
    if (is_throttling) return;
    if (is_idle) update_store(false);

    is_throttling = true;

    clear_countdown();
    start_countdown();

    start_throttle();
}
