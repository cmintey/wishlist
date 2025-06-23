import { test, expect } from "./fixtures";

test("unauthenticated", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
});

test("admin authenticated", async ({ admin: page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible();
});
