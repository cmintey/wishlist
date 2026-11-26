import assert from "node:assert/strict";
import { createServer as createHttpServer } from "node:http";
import { after, before, test } from "node:test";
import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";

let server;
let httpServer;
let Card;
let render;
const item = {
    id: 1,
    name: "A wish",
    url: "https://example.com/product",
    imageUrl: "uploaded.webp",
    mostWanted: true,
    price: null,
    itemPrice: { value: 1234, currency: "USD" },
    quantity: 3,
    user: { name: "Recipient" },
    note: "**A note**",
    canRestore: true,
    claims: [
        { name: "Alice", quantity: 2 },
        { name: null, quantity: 1 }
    ]
};

before(async () => {
    server = await createServer({
        server: { middlewareMode: true, fs: { allow: [process.cwd()] } },
        appType: "custom"
    });
    ({ render } = await server.ssrLoadModule("svelte/server"));
    Card = (await server.ssrLoadModule("/tests/components/ArchiveItemCardHarness.svelte")).default;
    httpServer = createHttpServer((request, response) => {
        if (request.url === "/") {
            response.writeHead(200, { "Content-Type": "text/html" });
            response.end(
                '<!doctype html><html><body><script>window.__sveltekit_dev = { env: {} };</script><script type="module" src="/tests/components/archive-card.browser.js"></script></body></html>'
            );
        } else {
            server.middlewares(request, response);
        }
    });
    await new Promise((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
});

after(async () => {
    if (httpServer) await new Promise((resolve) => httpServer.close(resolve));
    await server?.close();
});

function html(props) {
    return render(Card, { props }).body.replaceAll(/<!--.*?-->/g, "");
}

for (const isTileView of [false, true]) {
    test(`archive card displays wish details and uploaded image in ${isTileView ? "tile" : "list"} view`, () => {
        const body = html({ item, isTileView });
        assert.match(body, /href="https:\/\/example\.com\/product"/);
        assert.match(body, /A wish/);
        assert.match(body, /src="\/api\/assets\/uploaded\.webp"/);
        assert.match(body, /alt="A wish"/);
        assert.match(body, /Most wanted/);
        assert.match(body, /\$12\.34/);
        assert.match(body, /Desired: 3/);
        assert.match(body, /For Recipient/);
        assert.match(body, /<strong>A note<\/strong>/);
        assert.match(body, /Alice: 2 claimed/);
        assert.match(body, /wishes\.anonymous: 1 claimed/);
        assert.doesNotMatch(body, /purchased/);
        assert.match(body, />Restore<\/button>/);
        assert.equal((body.match(/<button\b/g) ?? []).length, 1);
        assert.match(body, isTileView ? /h-48 w-full/ : /h-24 w-24/);
    });
}

test("archive card supports external images and disables a pending restore", () => {
    const body = html({ item: { ...item, imageUrl: "https://example.com/image.png" }, pending: true });
    assert.match(body, /src="https:\/\/example\.com\/image\.png"/);
    assert.match(body, /<button[^>]*disabled/);
});

test("archive card provides a fallback image, legacy price and no controls for non-creators", () => {
    const body = html({
        item: {
            ...item,
            imageUrl: null,
            mostWanted: false,
            itemPrice: null,
            price: "About $5",
            quantity: null,
            canRestore: false,
            claims: []
        }
    });
    assert.match(body, /aria-label="default item image"/);
    assert.match(body, /About \$5/);
    assert.match(body, /No limit/);
    assert.doesNotMatch(body, /<button\b/);
    assert.doesNotMatch(body, /Most wanted/);
});

test("archive card loads uploaded images, falls back on errors, and restores only when enabled", async () => {
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage();
        await page.route("**/api/assets/uploaded.webp", (route) =>
            route.fulfill({
                contentType: "image/png",
                body: Buffer.from(
                    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aZkAAAAASUVORK5CYII=",
                    "base64"
                )
            })
        );
        await page.route("**/api/assets/missing.webp", (route) => route.fulfill({ status: 404 }));
        await page.goto(`http://127.0.0.1:${httpServer.address().port}/`);
        await page.waitForFunction(() => typeof window.mountArchiveCard === "function");
        await page.evaluate((item) => window.mountArchiveCard({ item }), item);
        const image = page.getByRole("img", { name: "A wish" });
        await expect(image).toHaveAttribute("src", "/api/assets/uploaded.webp");
        await expect.poll(() => image.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
        await page.getByRole("button", { name: "Restore" }).click();
        assert.deepEqual(await page.evaluate(() => window.restoreCalls), [1]);

        await page.evaluate((item) => window.mountArchiveCard({ item, isTileView: true, pending: true }), {
            ...item,
            imageUrl: "missing.webp"
        });
        await expect(page.getByRole("img", { name: "default item image", includeHidden: true })).toHaveCount(1);
        await expect(page.getByRole("button", { name: "Restore" })).toBeDisabled();
        assert.deepEqual(await page.evaluate(() => window.restoreCalls), [1]);

        await page.evaluate((item) => window.mountArchiveCard({ item }), { ...item, canRestore: false });
        await expect(page.getByRole("button")).toHaveCount(0);
    } finally {
        await browser.close();
    }
});
