import type { Page } from "@playwright/test";
import { expect, test } from "../fixtures";
import { UserMenu } from "../modules/user-menu";
import { CreateItemPage } from "../pageObjects/create-item.page";
import { ListPage } from "../pageObjects/list.page";
import { ListsPage } from "../pageObjects/lists.page";
import { addUserToGroup, createUser, randomString } from "../util";
import type { Method } from "../modules/suggestions-settings";

test("add item to another users list - disabled", async ({ page: user1Page, browser, userData }) => {
    // setup -- disable suggestions
    await new UserMenu(user1Page)
        .manageGroup()
        .then((page) => page.clickSettingsTab())
        .then(async (page) => {
            await page.getSuggestionsSettings().then((s) => s.disable());
            return page;
        })
        .then((page) => page.saveSettings());

    const user1ListsPage = new ListsPage(user1Page);
    await user1ListsPage.goto();

    const user1List = await user1ListsPage.getListAt(0);
    const user1ListPage = await user1List.click();

    const user2 = await createUser(browser);
    await addUserToGroup(user1Page, user2.getUserData().name);
    const user2Page = user2.getPage();

    const user1ListWithUser2 = new ListPage(user2Page, {
        id: user1ListPage.getId(),
        name: `${userData.name}'s Wishes`
    });
    await user1ListWithUser2.goto();
    await user1ListWithUser2.assertCreateItemNotAvailable();
    await new CreateItemPage(user2Page, { listId: user1ListWithUser2.getId() }).goto({ skipAssert: true });
    await expect(user2Page.getByText("Suggestions are disabled")).toBeVisible();
});

test("add item to another users list - surprise", async ({ page: user1Page, browser, userData }) => {
    await enableMethod(user1Page, "surprise");

    const user1ListsPage = new ListsPage(user1Page);
    await user1ListsPage.goto();

    // assert list has no items from user 1 perspective
    const user1List = await user1ListsPage.getListAt(0);
    await user1List.assertOwner(userData.name);
    const user1ListPage = await user1List.click();
    await user1ListPage.assertNoItems();

    const user2 = await createUser(browser);
    await addUserToGroup(user1Page, user2.getUserData().name);
    const user2Page = user2.getPage();

    // create new item on user 1's list
    const user1ListWithUser2 = new ListPage(user2Page, {
        id: user1ListPage.getId(),
        name: `${userData.name}'s Wishes`
    });
    const itemName = randomString();
    await createItemOnUser1List(user1ListWithUser2, itemName);

    await user1ListWithUser2.goto();
    await user1ListWithUser2
        .getItemAt(0)
        .then((i) => i.assertName(itemName))
        .then((i) => i.assertAddedBy(user2.getUserData().name));

    // assert list has no items from user 1 perspective
    await user1ListPage.assertNoItems();
    await user1Page.reload();
    await user1ListPage.assertNoItems();
});

test("add item to another users list - auto-approval", async ({ page: user1Page, browser, userData }) => {
    await enableMethod(user1Page, "auto-approval");

    const user1ListsPage = new ListsPage(user1Page);
    await user1ListsPage.goto();

    // assert list has no items from user 1 perspective
    const user1List = await user1ListsPage.getListAt(0);
    await user1List.assertOwner(userData.name);
    const user1ListPage = await user1List.click();
    await user1ListPage.assertNoItems();

    const user2 = await createUser(browser);
    await addUserToGroup(user1Page, user2.getUserData().name);
    const user2Page = user2.getPage();

    // create new item on user 1's list
    const user1ListWithUser2 = new ListPage(user2Page, {
        id: user1ListPage.getId(),
        name: `${userData.name}'s Wishes`
    });
    const itemName = randomString();
    await createItemOnUser1List(user1ListWithUser2, itemName);

    await user1ListWithUser2.goto();
    await user1ListWithUser2
        .getItemAt(0)
        .then((i) => i.assertName(itemName))
        .then((i) => i.assertAddedBy(user2.getUserData().name));

    // assert list has item added by user 2
    await user1ListPage
        .getItemAt(0)
        .then((i) => i.assertName(itemName))
        .then((i) => i.assertAddedBy(user2.getUserData().name));
});

["approved", "denied"].forEach((result) =>
    test(`add item to another users list - approval ${result}`, async ({ page: user1Page, browser, userData }) => {
        await enableMethod(user1Page, "approval");

        const user1ListsPage = new ListsPage(user1Page);
        await user1ListsPage.goto();

        // assert list has no items from user 1 perspective
        const user1List = await user1ListsPage.getListAt(0);
        await user1List.assertOwner(userData.name);
        const user1ListPage = await user1List.click();
        await user1ListPage.assertNoItems();

        const user2 = await createUser(browser);
        await addUserToGroup(user1Page, user2.getUserData().name);
        const user2Page = user2.getPage();

        // create new item on user 1's list
        const user1ListWithUser2 = new ListPage(user2Page, {
            id: user1ListPage.getId(),
            name: `${userData.name}'s Wishes`
        });
        const itemName = randomString();
        await createItemOnUser1List(user1ListWithUser2, itemName, true);

        // item should not be visible yet
        await user1ListWithUser2.goto();
        await user1ListWithUser2.assertNoItems();

        // assert list has item added by user 2 that needs approval
        await user1ListsPage.goto();
        await user1List.assertApprovalBanner().then((c) => c.click());
        await user1ListPage
            .getItemForApprovalAt(0)
            .then((i) => i.assertName(itemName))
            .then((i) => i.assertAddedBy(user2.getUserData().name))
            .then((i) => (result === "approved" ? i.approve() : i.deny()));

        if (result === "approved") {
            // visible for both users
            await user1ListPage
                .getItemAt(0)
                .then((i) => i.assertName(itemName))
                .then((i) => i.assertAddedBy(user2.getUserData().name));
            await user1ListWithUser2
                .getItemAt(0)
                .then((i) => i.assertName(itemName))
                .then((i) => i.assertAddedBy(user2.getUserData().name));
        } else {
            // item is fully gone
            await user1ListPage.assertNoItems();
            await user1ListWithUser2.assertNoItems();
        }
    })
);

async function enableMethod(page: Page, method: Method) {
    await new UserMenu(page)
        .manageGroup()
        .then((page) => page.clickSettingsTab())
        .then(async (page) => {
            await page
                .getSuggestionsSettings()
                .then((s) => s.enable())
                .then((s) => s.selectMethod(method));
            return page;
        })
        .then((page) => page.saveSettings());
}

async function createItemOnUser1List(page: ListPage, itemName: string, approvalNeeded = false) {
    await page.goto();
    await page
        .createItem()
        .then(async (p) => {
            if (approvalNeeded) await p.assertApprovalRequiredAlert();
            return p;
        })
        .then(async (p) => {
            await p.getForm().then((f) => f.fillName(itemName));
            return p;
        })
        .then((p) => p.create());
    return itemName;
}
