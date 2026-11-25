import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, stat } from "node:fs/promises";
import http from "node:http";
import { registerHooks } from "node:module";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const mockEnv: Record<string, string | undefined> = {
    ALLOWED_IPS: "127.0.0.1",
    LOG_LEVEL: "silent"
};

const errorLogs: Array<{ obj: unknown; msg?: string }> = [];

const mockLogger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: (obj: unknown, msg?: string) => {
        errorLogs.push({ obj, msg });
    },
    child: () => mockLogger
};

// Expose stubs for virtual SvelteKit modules
(globalThis as Record<string, unknown>).__testMockEnv = mockEnv;
(globalThis as Record<string, unknown>).__testMockLogger = mockLogger;

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === "$env/dynamic/private") {
            return { shortCircuit: true, url: "virtual:env-dynamic-private" };
        }
        if (specifier === "$app/environment") {
            return { shortCircuit: true, url: "virtual:app-environment" };
        }
        if (specifier === "$lib/server/logger") {
            return { shortCircuit: true, url: "virtual:lib-server-logger" };
        }
        if (specifier.startsWith("$lib/")) {
            const target = pathToFileURL(path.join(projectRoot, "src/lib", specifier.slice("$lib/".length))).href;
            return nextResolve(target, context);
        }
        return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
        if (url === "virtual:env-dynamic-private") {
            return {
                shortCircuit: true,
                format: "module",
                source: "export const env = globalThis.__testMockEnv;"
            };
        }
        if (url === "virtual:app-environment") {
            return {
                shortCircuit: true,
                format: "module",
                source: "export const dev = false;"
            };
        }
        if (url === "virtual:lib-server-logger") {
            return {
                shortCircuit: true,
                format: "module",
                source: "export const logger = globalThis.__testMockLogger; export const oidcLogger = globalThis.__testMockLogger;"
            };
        }
        const loaded = nextLoad(url, context);
        if (url.endsWith("/safeurl.ts") && typeof loaded.source === "string") {
            loaded.source = loaded.source.replace(
                /import ipaddr,\s*\{[^}]*\}\s*from\s*"ipaddr\.js";?/,
                'import ipaddr from "ipaddr.js";'
            );
        }
        return loaded;
    }
});

const { createImage } = await import("./image-util");

describe("createImage / fetchImage", () => {
    let pngBuffer: Buffer;
    let tempDir: string;
    let prevCwd: string;
    let server: http.Server;
    let baseUrl: string;

    before(async () => {
        pngBuffer = await sharp({
            create: { width: 16, height: 16, channels: 3, background: { r: 255, g: 0, b: 0 } }
        })
            .png()
            .toBuffer();

        prevCwd = process.cwd();
        tempDir = await mkdtemp(path.join(os.tmpdir(), "wishlist-img-test-"));
        await mkdir(path.join(tempDir, "uploads"), { recursive: true });
        process.chdir(tempDir);

        server = http.createServer((req, res) => {
            const urlPath = req.url ?? "/";
            if (urlPath === "/direct.png") {
                res.writeHead(200, { "Content-Type": "image/png" });
                res.end(pngBuffer);
                return;
            }
            if (urlPath === "/empty.png") {
                res.writeHead(200, { "Content-Type": "image/png" });
                res.end();
                return;
            }
            if (urlPath === "/redirect-rel") {
                res.writeHead(302, { Location: "/direct.png" });
                res.end();
                return;
            }
            if (urlPath === "/redirect-abs") {
                res.writeHead(301, { Location: `${baseUrl}/direct.png` });
                res.end();
                return;
            }
            if (urlPath.startsWith("/hop/")) {
                const n = Number(urlPath.slice("/hop/".length));
                if (n > 0) {
                    res.writeHead(302, { Location: `/hop/${n - 1}` });
                    res.end();
                } else {
                    res.writeHead(200, { "Content-Type": "image/png" });
                    res.end(pngBuffer);
                }
                return;
            }
            if (urlPath === "/redirect-private") {
                res.writeHead(302, { Location: "http://127.0.0.2:1/secret.png" });
                res.end();
                return;
            }
            if (urlPath === "/cloudflare-protected.png") {
                const ua = String(req.headers["user-agent"] ?? "");
                if (!ua || ua === "node" || !ua.includes("Mozilla/5.0")) {
                    res.writeHead(403, { "Content-Type": "text/html", Server: "cloudflare" });
                    res.end("<html>403 Forbidden</html>");
                    return;
                }
                res.writeHead(200, { "Content-Type": "image/png" });
                res.end(pngBuffer);
                return;
            }
            if (urlPath === "/forbidden.png") {
                res.writeHead(403, { "Content-Type": "text/html" });
                res.end("Forbidden");
                return;
            }
            res.writeHead(404);
            res.end("Not Found");
        });

        await new Promise<void>((resolve) => {
            server.listen(0, "127.0.0.1", () => resolve());
        });
        const addr = server.address();
        assert.ok(addr && typeof addr === "object");
        baseUrl = `http://127.0.0.1:${addr.port}`;
    });

    after(async () => {
        server?.close();
        process.chdir(prevCwd);
        if (tempDir) {
            await rm(tempDir, { recursive: true, force: true });
        }
    });

    it("downloads a direct image URL", async () => {
        const fname = await createImage("direct-item", `${baseUrl}/direct.png`);
        assert.ok(fname, "expected filename for direct image");
        const st = await stat(path.join(tempDir, "uploads", fname));
        assert.ok(st.size > 0);
    });

    it("follows relative and absolute redirects", async () => {
        const fnameRel = await createImage("redirect-rel", `${baseUrl}/redirect-rel`);
        assert.ok(fnameRel, "expected filename after relative redirect");

        const fnameAbs = await createImage("redirect-abs", `${baseUrl}/redirect-abs`);
        assert.ok(fnameAbs, "expected filename after absolute redirect");
    });

    it("stops after more than 5 redirects", async () => {
        const fnameOk = await createImage("five-hops", `${baseUrl}/hop/5`);
        assert.ok(fnameOk, "expected 5 redirects to succeed");

        errorLogs.length = 0;
        const fnameTooMany = await createImage("six-hops", `${baseUrl}/hop/6`);
        assert.equal(fnameTooMany, null);
        assert.ok(errorLogs.length > 0, "expected error log when max redirects exceeded");
    });

    it("blocks redirects to non-allowed private IPs", async () => {
        errorLogs.length = 0;
        const fname = await createImage("ssrf-redirect", `${baseUrl}/redirect-private`);
        assert.equal(fname, null);
        const loggedReserved = errorLogs.some((entry) => {
            const obj = entry.obj as { err?: { message?: string } };
            return String(obj?.err?.message ?? "").includes("reserved");
        });
        assert.ok(loggedReserved, `expected reserved-IP error log, got: ${JSON.stringify(errorLogs)}`);
    });

    it("sends browser-like headers so bot-protected hosts return the image", async () => {
        const fname = await createImage("protected-item", `${baseUrl}/cloudflare-protected.png`);
        assert.ok(fname, "expected browser-like headers to bypass plain-fetch 403 block");
    });

    it("logs the status code when an image fetch returns a non-OK status", async () => {
        errorLogs.length = 0;
        const fname = await createImage("forbidden-item", `${baseUrl}/forbidden.png`);
        assert.equal(fname, null);
        const loggedStatus = errorLogs.some((entry) => JSON.stringify(entry).includes("403"));
        assert.ok(loggedStatus, `expected error log to include status 403, got: ${JSON.stringify(errorLogs)}`);
    });

    it("returns null and logs when response body is empty", async () => {
        errorLogs.length = 0;
        const fname = await createImage("empty-item", `${baseUrl}/empty.png`);
        assert.equal(fname, null);
        assert.ok(errorLogs.length > 0, "expected error log for empty image response");
    });

    it("uses HTTP_PROXY when configured for http image URLs", async () => {
        let proxiedTargetUrl: string | undefined;
        const proxyServer = http.createServer((req, res) => {
            proxiedTargetUrl = req.url;
            res.writeHead(200, { "Content-Type": "image/png" });
            res.end(pngBuffer);
        });
        await new Promise<void>((resolve) => proxyServer.listen(0, "127.0.0.1", () => resolve()));
        const proxyAddr = proxyServer.address();
        assert.ok(proxyAddr && typeof proxyAddr === "object");

        mockEnv.HTTP_PROXY = `http://127.0.0.1:${proxyAddr.port}`;
        try {
            const fname = await createImage("proxied-item", `${baseUrl}/direct.png`);
            assert.ok(fname, "expected proxied image fetch to succeed");
            assert.equal(proxiedTargetUrl, `${baseUrl}/direct.png`);
        } finally {
            delete mockEnv.HTTP_PROXY;
            proxyServer.close();
        }
    });
});
