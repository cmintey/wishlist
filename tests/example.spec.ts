import { test, expect } from "@playwright/test";
import { testUtil } from "./util";

test("unauthenticated", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
});

test("admin authenticated", async ({ browser }) => {
    const adminContext = await browser.newContext({ storageState: testUtil.adminAuthFile });
    const page = await adminContext.newPage();

    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible();
});
