import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock $env/dynamic/private before importing the module
const mockEnv: { ORIGIN?: string } = {};

vi.mock("$env/dynamic/private", () => ({
    get env() {
        return mockEnv;
    }
}));

// Import after mock is set up
const { getOriginConfig, _resetOriginConfig } = await import("./origin");

describe("getOriginConfig", () => {
    beforeEach(() => {
        _resetOriginConfig();
        delete mockEnv.ORIGIN;
    });

    it("single HTTPS origin (backward compatibility)", () => {
        mockEnv.ORIGIN = "https://wishlist.example.com";
        const config = getOriginConfig();
        expect(config.origins).toHaveLength(1);
        expect(config.primary.href).toBe("https://wishlist.example.com/");
        expect(config.isSecure).toBe(true);
    });

    it("single HTTP origin (backward compatibility)", () => {
        mockEnv.ORIGIN = "http://192.168.1.10:3280";
        const config = getOriginConfig();
        expect(config.origins).toHaveLength(1);
        expect(config.primary.hostname).toBe("192.168.1.10");
        expect(config.isSecure).toBe(false);
    });

    it("multiple origins", () => {
        mockEnv.ORIGIN = "https://wishlist.example.com,http://192.168.1.10:3280";
        const config = getOriginConfig();
        expect(config.origins).toHaveLength(2);
        expect(config.origins[0].href).toBe("https://wishlist.example.com/");
        expect(config.origins[1].port).toBe("3280");
    });

    it("mixed protocols — isSecure true if ANY is HTTPS", () => {
        mockEnv.ORIGIN = "https://wishlist.example.com,http://192.168.1.10:3280";
        const config = getOriginConfig();
        expect(config.isSecure).toBe(true);
    });

    it("all HTTP — isSecure is false", () => {
        mockEnv.ORIGIN = "http://wishlist.example.com,http://192.168.1.10:3280";
        const config = getOriginConfig();
        expect(config.isSecure).toBe(false);
    });

    it("missing protocol — defaults to http://", () => {
        mockEnv.ORIGIN = "192.168.1.10:3280";
        const config = getOriginConfig();
        expect(config.primary.protocol).toBe("http:");
        expect(config.primary.hostname).toBe("192.168.1.10");
    });

    it("empty/undefined ORIGIN — defaults to http://localhost:3280", () => {
        // ORIGIN not set
        const config = getOriginConfig();
        expect(config.primary.href).toBe("http://localhost:3280/");
        expect(config.isSecure).toBe(false);
    });

    it("whitespace handling in comma-separated values", () => {
        mockEnv.ORIGIN = "https://wishlist.example.com , http://192.168.1.10:3280";
        const config = getOriginConfig();
        expect(config.origins).toHaveLength(2);
        expect(config.origins[0].hostname).toBe("wishlist.example.com");
        expect(config.origins[1].port).toBe("3280");
    });

    it("primary is always the first entry", () => {
        mockEnv.ORIGIN = "https://wishlist.example.com,http://192.168.1.10:3280";
        const config = getOriginConfig();
        expect(config.primary.hostname).toBe("wishlist.example.com");
    });

    it("trailing slash stripped from primary.toString()", () => {
        mockEnv.ORIGIN = "https://wishlist.example.com";
        const config = getOriginConfig();
        const baseUrl = config.primary.toString().replace(/\/$/, "");
        expect(baseUrl).toBe("https://wishlist.example.com");
    });
});
