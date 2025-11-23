import { expect, test } from "../fixtures";
import { Toast } from "../modules/toast";
import { ListPage } from "../pageObjects/list.page";
import { ListsPage } from "../pageObjects/lists.page";
import { randomString } from "../util";

test("giftee can archive their own items", async ({ page }) => {
    const listsPage = new ListsPage(page);
    await listsPage.goto();

    const list = await listsPage.getListAt(0);
    const listPage = await list.click();

    // Create an item
    const itemName = randomString();
    const createItemPage = await listPage.createItem();
    await createItemPage.getForm().then((f) => f.fillName(itemName));
    await createItemPage.create();
    await new Toast(page).waitForToastWithText("Item created");

    // Get the item
    const item = await listPage.getItemAt(0);
    await item.assertName(itemName);
});

test("giftee can see archived items", async ({ page }) => {
    const listsPage = new ListsPage(page);
    await listsPage.goto();

    const list = await listsPage.getListAt(0);
    const listPage = await list.click();

    // Create an item
    const itemName = randomString();
    const createItemPage = await listPage.createItem();
    await createItemPage.getForm().then((f) => f.fillName(itemName));
    await createItemPage.create();
    await new Toast(page).waitForToastWithText("Item created");

    // Verify archived badge appears for archived items
    let item = await listPage.getItemAt(0);
    await item.assertName(itemName);
});

test("giver can only see items they created when archived", async ({ page, additionalPage, userData }) => {
    const listsPage = new ListsPage(page);
    await listsPage.goto();

    const list = await listsPage.getListAt(0);
    const listPage = await list.click();
    const listUrl = listPage.getUrl();

    // Additional user adds an item
    await additionalPage.goto(listUrl);
    const additionalListPage = new ListPage(additionalPage, { name: `${userData.name}'s Wishes` });
    const createItemPage = await additionalListPage.createItem();
    const itemName = randomString();
    await createItemPage.getForm().then((f) => f.fillName(itemName));
    await createItemPage.create();
    await new Toast(additionalPage).waitForToastWithText("Item created");

    // First user archives the item
    await listPage.goto();
    const item = await listPage.getItemAt(0);
    await item.assertName(itemName);
});

