// Parse ORIGIN env var — supports comma-separated values
// First entry is the "primary" origin (used for emails, canonical URLs)
// Backward compatible: single value works exactly as before

import { env } from "$env/dynamic/private";

export interface OriginConfig {
    origins: URL[];
    primary: URL;
    isSecure: boolean; // true if ANY origin uses HTTPS
}

function parseOrigins(): OriginConfig {
    const raw = env.ORIGIN || "http://localhost:3280";
    const entries = raw.split(",").map(s => s.trim()).filter(Boolean);

    const origins = entries.map(entry => {
        // Add protocol if missing
        if (!entry.startsWith("http://") && !entry.startsWith("https://")) {
            entry = `http://${entry}`;
        }
        return new URL(entry);
    });

    if (origins.length === 0) {
        origins.push(new URL("http://localhost:3280"));
    }

    return {
        origins,
        primary: origins[0],
        isSecure: origins.some(o => o.protocol === "https:")
    };
}

let _config: OriginConfig | null = null;

export function getOriginConfig(): OriginConfig {
    if (!_config) {
        _config = parseOrigins();
    }
    return _config;
}

// For testing — allows resetting cached config
export function _resetOriginConfig(): void {
    _config = null;
}
