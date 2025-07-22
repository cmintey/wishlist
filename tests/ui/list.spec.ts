import { expect, test } from "../fixtures";
import { Toast } from "../modules/toast";
import { UserMenu } from "../modules/user-menu";
import { ListPage } from "../pageObjects/list.page";
import { ListsPage } from "../pageObjects/lists.page";
import { randomString } from "../util";

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

test("create item via url", async ({ page }) => {
    const listsPage = new ListsPage(page);
    await listsPage.goto();

    const list = await listsPage.getListAt(0);
    const listPage = await list.click();
    await listPage.assertNoItems();

    const createItemPage = await listPage.createItem();
    await createItemPage
        .getForm()
        .then((f) => f.fillViaUrl("https://www.amazon.com/crocs-Unisex-Classic-Black-Women/dp/B0014C0LSY/"));
    await createItemPage.create();

    await listPage.at();
    await new Toast(page).waitForToastWithText("Item created");
    await listPage.getItemAt(0).then((item) => item.assertHasLink());
});

test("create full item", async ({ page, userData }) => {
    const listsPage = new ListsPage(page);
    await listsPage.goto();

    const list = await listsPage.getListAt(0);
    const listPage = await list.click();
    await listPage.assertNoItems();

    const itemData = {
        name: randomString(),
        rawPrice: 22.49,
        formattedPrice: "$22.49",
        quantity: 1,
        notes: randomString()
    };
    const createItemPage = await listPage.createItem();
    await createItemPage
        .getForm()
        .then((f) => f.fillName(itemData.name))
        .then((f) => f.fillPrice(itemData.rawPrice))
        .then((f) => f.fillNote(itemData.notes));
    await createItemPage.create();

    await listPage.at();
    await new Toast(page).waitForToastWithText("Item created");
    await listPage
        .getItemAt(0)
        .then((item) => item.assertNoLink())
        .then((item) => item.assertName(itemData.name))
        .then((item) => item.assertDefaultImage())
        .then((item) => item.assertPrice(itemData.formattedPrice))
        .then((item) => item.assertDesiredQuantity(itemData.quantity))
        .then((item) => item.assertClaimedQuantityHidden())
        .then((item) => item.assertAddedBy(userData.name))
        .then((item) => item.assertNotes(itemData.notes));
});

test("create basic item", async ({ page, userData }) => {
    const listsPage = new ListsPage(page);
    await listsPage.goto();

    const list = await listsPage.getListAt(0);
    const listPage = await list.click();
    await listPage.assertNoItems();

    const itemData = {
        name: randomString(),
        quantity: 1
    };
    const createItemPage = await listPage.createItem();
    await createItemPage.getForm().then((f) => f.fillName(itemData.name));
    await createItemPage.create();

    await listPage.at();
    await new Toast(page).waitForToastWithText("Item created");
    await listPage
        .getItemAt(0)
        .then((item) => item.assertNoLink())
        .then((item) => item.assertName(itemData.name))
        .then((item) => item.assertDefaultImage())
        .then((item) => item.assertNoPrice())
        .then((item) => item.assertDesiredQuantity(itemData.quantity))
        .then((item) => item.assertClaimedQuantityHidden())
        .then((item) => item.assertAddedBy(userData.name))
        .then((item) => item.assertNoNotes());
});

test("create basic item no quantity limit", async ({ page }) => {
    const listsPage = new ListsPage(page);
    await listsPage.goto();

    const list = await listsPage.getListAt(0);
    const listPage = await list.click();
    await listPage.assertNoItems();

    const itemData = {
        name: randomString(),
        quantity: 1
    };
    const createItemPage = await listPage.createItem();
    await createItemPage
        .getForm()
        .then((f) => f.fillName(itemData.name))
        .then((f) => f.checkNoLimit());
    await createItemPage.create();

    await listPage.at();
    await new Toast(page).waitForToastWithText("Item created");
    await listPage
        .getItemAt(0)
        .then((item) => item.assertNoLink())
        .then((item) => item.assertName(itemData.name))
        .then((item) => item.assertNoQuantity());
});

test("create item on multiple lists", async ({ page, userData }) => {
    const listsPage = new ListsPage(page);
    await listsPage.goto();

    const newListName = randomString();
    await listsPage.create().then((lp) => lp.create(newListName));
    await listsPage.goto();

    const list = await listsPage.getListAt(0);
    const defaultListName = await list.getName();
    const listPage = await list.click();
    await listPage.assertNoItems();

    const itemData = {
        name: randomString(),
        quantity: 1
    };
    const createItemPage = await listPage.createItem();
    await createItemPage
        .getForm()
        .then((f) => f.fillName(itemData.name))
        .then((f) => f.fillImageUrl("https://raw.githubusercontent.com/cmintey/wishlist/main/src/lib/assets/logo.png"))
        .then((f) => f.assertListsSelected(defaultListName))
        .then((f) => f.selectList(newListName));
    await createItemPage.create();

    await listPage.at();
    await new Toast(page).waitForToastWithText("Item created");
    await listPage
        .getItemAt(0)
        .then((item) => item.assertNoLink())
        .then((item) => item.assertName(itemData.name))
        .then((item) => item.assertHasImage())
        .then((item) => item.assertNoPrice())
        .then((item) => item.assertDesiredQuantity(itemData.quantity))
        .then((item) => item.assertClaimedQuantityHidden())
        .then((item) => item.assertAddedBy(userData.name))
        .then((item) => item.assertNoNotes());

    await listsPage.goto();
    await listsPage
        .getListAt(1)
        .then((l) => l.click())
        .then((lp) => lp.getItemAt(0))
        .then((item) => item.assertNoLink())
        .then((item) => item.assertName(itemData.name))
        .then((item) => item.assertHasImage())
        .then((item) => item.assertNoPrice())
        .then((item) => item.assertDesiredQuantity(itemData.quantity))
        .then((item) => item.assertClaimedQuantityHidden())
        .then((item) => item.assertAddedBy(userData.name))
        .then((item) => item.assertNoNotes());
});

test("list shows item count correctly", async ({ page }) => {
    const listsPage = new ListsPage(page);
    await listsPage.goto();

    // Validate no items
    const list = await listsPage.getListAt(0);
    await list.assertItemCount(0);
    const listPage = await list.click();
    await listPage.assertNoItems();

    // Create item with no quantity limit
    const itemData = {
        name: randomString()
    };
    const createItemPage = await listPage.createItem();
    await createItemPage
        .getForm()
        .then((f) => f.fillName(itemData.name))
        .then((f) => f.checkNoLimit());
    await createItemPage.create();

    // Validate card
    await listPage.at();
    await new Toast(page).waitForToastWithText("Item created");
    await listPage
        .getItemAt(0)
        .then((item) => item.assertNoLink())
        .then((item) => item.assertName(itemData.name))
        .then((item) => item.assertNoQuantity());

    // Validate list card shows 1 item
    await listsPage.goto();
    await listsPage.getListAt(0).then((l) => l.assertItemCount(1));

    // Edit item to have a default quantity of 1
    await listPage.goto();
    const editItemPage = await listPage.getItemAt(0).then((it) => it.edit());
    await editItemPage.getForm().then((f) => f.uncheckNoLimit());
    await editItemPage.save();
    await listPage.at();
    await new Toast(page).waitForToastWithText("Item updated successfully");
    await listPage
        .getItemAt(0)
        .then((item) => item.assertNoLink())
        .then((item) => item.assertName(itemData.name))
        .then((item) => item.assertDesiredQuantity(1));

    // Validate list card shows 1 item
    await listsPage.goto();
    await listsPage.getListAt(0).then((l) => l.assertItemCount(1));

    // Edit item to have a default quantity of 8
    await editItemPage
        .goto()
        .then((ep) => ep.getForm())
        .then((f) => f.fillQuantity(8));
    await editItemPage.save();
    await listPage.at();
    await new Toast(page).waitForToastWithText("Item updated successfully");
    await listPage
        .getItemAt(0)
        .then((item) => item.assertNoLink())
        .then((item) => item.assertName(itemData.name))
        .then((item) => item.assertDesiredQuantity(8));

    // Validate list card shows 8 items
    await listsPage.goto();
    await listsPage.getListAt(0).then((l) => l.assertItemCount(8));

    // Delete item
    await listPage.goto();
    await listPage.getItemAt(0).then((it) => it.delete());
    new Toast(page).waitForToastWithText(`${itemData.name} was deleted`);

    // Validate list card shows no items
    await listsPage.goto();
    await listsPage.getListAt(0).then((l) => l.assertItemCount(0));
});
