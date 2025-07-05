import { test, expect } from "../fixtures";
import { UserMenu } from "../modules/user-menu";

test("unauthenticated", async ({ anonymousPage: page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
});

test("admin authenticated", async ({ adminPage: page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible();
    const userMenu = new UserMenu(page);
    await userMenu.assertAdminButtonVisible();
});

test("user authenticated", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible();
    const userMenu = new UserMenu(page);
    await userMenu.assertAdminButtonNotVisible();
});
