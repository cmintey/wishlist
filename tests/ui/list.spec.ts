import { expect, test } from "../fixtures";
import { UserMenu } from "../modules/user-menu";
import { ListPage } from "../pageObjects/list.page";
import { ListsPage } from "../pageObjects/lists.page";

test("public non-registry list", async ({ page, userData, anonymousPage }) => {
    const listsPage = new ListsPage(page);
    await listsPage.goto();

    const list = await listsPage.getListAt(0);
    const listPage = await list.click();
    await expect(await listPage.getShareListButton()).not.toBeVisible();

    // Navigate to the list in a private window
    await anonymousPage.goto(page.url());
    await expect(anonymousPage.getByRole("heading", { name: "Sign in" })).toBeVisible();

    // Set group to allow public lists
    await new UserMenu(page).manageGroup().then((p) => p.allowPublicLists());

    // Set list public
    await listPage
        .goto()
        .then(() => listPage.manage())
        .then((mp) => mp.makePublic());

    await listPage.goto();
    await listPage.assertShareFunctionality();

    // Navigate to the list in a private window
    await anonymousPage.goto(listPage.getUrl());
    await new ListPage(anonymousPage, { name: `${userData.name}'s Wishes` }).at();
});
