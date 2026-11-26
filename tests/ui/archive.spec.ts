import { expect, test } from "../fixtures";
import { ListsPage } from "../pageObjects/lists.page";
import { randomString } from "../util";

test("creator archives and restores an approved wish", async ({ page }) => {
    const wish = randomString();
    const lists = new ListsPage(page);
    await lists.goto();
    const list = await lists.getListAt(0).then((card) => card.click());
    const create = await list.createItem();
    await create.getForm().then((form) => form.fillName(wish));
    await create.create();

    const card = page.getByTestId("items-container").locator("div.card").filter({ hasText: wish });
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: "Archive", exact: true }).click();
    await expect(card).toHaveCount(0);

    await page.getByRole("link", { name: "Archive", exact: true }).click();
    await expect(page.getByText(wish, { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText(wish, { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Restore", exact: true }).click();
    await expect(page.getByText(wish, { exact: true })).toHaveCount(0);

    await list.goto();
    await expect(page.getByTestId("items-container").getByTestId("name").filter({ hasText: wish })).toBeVisible();
});

test("archive and restore invalidate an open active list", async ({ page: owner, additionalPage: viewer }) => {
    const wish = randomString();
    const lists = new ListsPage(owner);
    await lists.goto();
    const list = await lists.getListAt(0).then((card) => card.click());
    const create = await list.createItem();
    await create.getForm().then((form) => form.fillName(wish));
    await create.create();
    const connection = viewer.waitForRequest((request) => request.url().endsWith("/events"));
    await viewer.goto(list.getUrl());
    await connection;
    const visibleWish = viewer.getByTestId("items-container").getByTestId("name").filter({ hasText: wish });
    await expect(visibleWish).toBeVisible();
    await owner
        .getByTestId("items-container")
        .locator("div.card")
        .filter({ hasText: wish })
        .getByRole("button", { name: "Archive", exact: true })
        .click();
    await expect(visibleWish).toHaveCount(0);
    await owner.getByRole("link", { name: "Archive", exact: true }).click();
    await owner.getByRole("button", { name: "Restore", exact: true }).click();
    await expect(visibleWish).toBeVisible();
});

test("archive controls handle failures and are keyboard accessible", async ({ page }) => {
    await page.goto("/archive");
    await expect(page.getByText("No archived wishes yet")).toBeVisible();
    const wish = randomString();
    const lists = new ListsPage(page);
    await lists.goto();
    const list = await lists.getListAt(0).then((card) => card.click());
    const create = await list.createItem();
    await create.getForm().then((form) => form.fillName(wish));
    await create.create();
    const button = page
        .getByTestId("items-container")
        .locator("div.card")
        .filter({ hasText: wish })
        .getByRole("button", { name: "Archive", exact: true });
    await page.route("**/api/items/*/archive", (route) => route.fulfill({ status: 500 }));
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Could not update the archive. Please try again.").last()).toBeVisible();
    await expect(button).toBeVisible();
    await page.unroute("**/api/items/*/archive");
    await button.focus();
    await page.keyboard.press("Enter");
    await page.getByRole("link", { name: "Archive", exact: true }).click();
    const restore = page.getByRole("button", { name: "Restore", exact: true });
    await expect(restore).toBeVisible();
    await page.route("**/api/items/*/archive", (route) => route.fulfill({ status: 500 }));
    await restore.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText(wish, { exact: true })).toBeVisible();
    await expect(page.getByText("Could not update the archive. Please try again.").last()).toBeVisible();
    await page.unroute("**/api/items/*/archive");
    await restore.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("No archived wishes yet")).toBeVisible();
});
