import { expect, test } from "../fixtures";
import { Toast } from "../modules/toast";
import { ListsPage } from "../pageObjects/lists.page";
import { randomString } from "../util";

test("create list with default values", async ({ page, userData }) => {
    const listsPage = new ListsPage(page);
    await listsPage.goto();
    const countBefore = await listsPage.getListCount();

    const createListPage = await listsPage.create();
    await createListPage.at();
    await createListPage.createDefault();

    await listsPage.goto();
    await listsPage.expectListCount(countBefore + 1);

    const listCount = await listsPage.getListCount();
    const newList = await listsPage.getListAt(listCount - 1);
    await newList.assertName(`${userData.name}'s Wishes`);
    await newList.assertOwner(userData.name);
});

test("create list with name", async ({ page, userData }) => {
    const listsPage = new ListsPage(page);
    await listsPage.goto();
    const countBefore = await listsPage.getListCount();

    const listName = randomString();
    const createListPage = await listsPage.create();
    await createListPage.at();
    await createListPage.create(listName);

    await listsPage.goto();
    await listsPage.expectListCount(countBefore + 1);

    const listCount = await listsPage.getListCount();
    const newList = await listsPage.getListAt(listCount - 1);
    await newList.assertName(listName);
    await newList.assertOwner(userData.name);
});

test("change list name", async ({ page }) => {
    const listsPage = new ListsPage(page);
    await listsPage.goto();

    const listCount = await listsPage.getListCount();
    const list = await listsPage.getListAt(0);

    const manageListPage = await list.click().then((list) => list.manage());
    await manageListPage.at();
    const newListName = randomString();
    await manageListPage.setName(newListName).then((p) => p.save());

    await listsPage.goto();
    expect(await listsPage.getListCount()).toEqual(listCount);
    await list.assertName(newListName);
});

test("hide owner removes the owner from the list card", async ({ page, userData }) => {
    const listsPage = new ListsPage(page);
    await listsPage.goto();

    // The owner is shown on the card by default
    const list = await listsPage.getListAt(0);
    await list.assertOwner(userData.name);

    // Enable "Hide Owner" in the manage form and save
    await list
        .click()
        .then((listPage) => listPage.manage())
        .then((manage) => manage.at())
        .then((manage) => manage.setHideOwner(true))
        .then((manage) => manage.save());

    // The owner should no longer be rendered on the list card
    await listsPage.goto();
    await listsPage.getListAt(0).then((card) => card.assertOwnerHidden());
});

test("delete list", async ({ page }) => {
    const listsPage = new ListsPage(page);
    await listsPage.goto();

    const countBefore = await listsPage.getListCount();

    const createListPage = await listsPage.create();
    await createListPage.at();
    await createListPage.createDefault();

    await listsPage.goto();
    await listsPage.expectListCount(countBefore + 1);

    const newList = await listsPage.getListAt(countBefore);
    const manageListPage = await newList.click().then((list) => list.manage());
    await manageListPage.delete();

    await listsPage.at();
    await listsPage.expectListCount(countBefore);
});

test("list card counts a partially claimed multi-quantity item", async ({
    page: ownerPage,
    userData: owner,
    additionalPage: claimerPage
}) => {
    // Owner adds an item with a desired quantity of 7 to their list
    const ownerLists = new ListsPage(ownerPage);
    await ownerLists.goto();
    const ownerListPage = await ownerLists.getListAt(0).then((list) => list.click());
    await ownerListPage.assertNoItems();

    const itemName = randomString();
    const createItemPage = await ownerListPage.createItem();
    await createItemPage
        .getForm()
        .then((f) => f.fillName(itemName))
        .then((f) => f.fillQuantity(7));
    await createItemPage.create();
    await ownerListPage.at();
    await new Toast(ownerPage).waitForToastWithText("Item created");

    // A different user claims 3 of the 7 (a partial claim)
    const claimerLists = new ListsPage(claimerPage);
    await claimerLists.goto();
    await claimerLists
        .getListByName(`${owner.name}'s Wishes`)
        .then((card) => card.click())
        .then((listPage) => listPage.getItemAt(0))
        .then((item) => item.claim(3));

    // The list card should reflect the partial claim: 4 Available, 3 of 7 Claimed.
    // Regression guard: previously claimedCount only counted fully-claimed items,
    // so this showed "7 Available, 0 of 7 Claimed" (see PR #281).
    await claimerLists.goto();
    await claimerLists
        .getListByName(`${owner.name}'s Wishes`)
        .then((card) => card.assertAvailableCount(4))
        .then((card) => card.assertClaimedCount(3, 7));
});

test("list card does not count a claimed unlimited item as claimed", async ({
    page: ownerPage,
    userData: owner,
    additionalPage: claimerPage
}) => {
    // Owner adds an item with no quantity limit (unlimited) to their list
    const ownerLists = new ListsPage(ownerPage);
    await ownerLists.goto();
    const ownerListPage = await ownerLists.getListAt(0).then((list) => list.click());
    await ownerListPage.assertNoItems();

    const itemName = randomString();
    const createItemPage = await ownerListPage.createItem();
    await createItemPage
        .getForm()
        .then((f) => f.fillName(itemName))
        .then((f) => f.checkNoLimit());
    await createItemPage.create();
    await ownerListPage.at();
    await new Toast(ownerPage).waitForToastWithText("Item created");

    // A different user claims the unlimited item
    const claimerLists = new ListsPage(claimerPage);
    await claimerLists.goto();
    await claimerLists
        .getListByName(`${owner.name}'s Wishes`)
        .then((card) => card.click())
        .then((listPage) => listPage.getItemAt(0))
        .then((item) => item.claim(3));

    // The unlimited item counts as 1 toward the total but never toward the claimed
    // total, so the card shows "1 Available, 0 of 1 Claimed" even after the claim.
    await claimerLists.goto();
    await claimerLists
        .getListByName(`${owner.name}'s Wishes`)
        .then((card) => card.assertAvailableCount(1))
        .then((card) => card.assertClaimedCount(0, 1));
});

test("multiple users and list filter", async ({
    page: user1Page,
    userData,
    additionalPage: user2Page,
    additionalUserData: user2
}) => {
    const user1ListsPage = new ListsPage(user1Page);
    await user1ListsPage.goto();

    const user1List = await user1ListsPage.getListAt(0);
    await user1List.assertOwner(userData.name);

    const user2ListsPage = new ListsPage(user2Page);
    await user2ListsPage.goto();
    const user2List = await user2ListsPage.getListAt(0);
    await user2List.assertOwner(user2.name);

    await user1ListsPage.expectListCount(2);
    await user2ListsPage.expectListCount(2);

    // Assert second list from User 1's perspective is User 2's list
    await user1ListsPage.getListAt(1).then((list) => list.assertOwner(user2.name));
    // Assert second list from User 2's perspective is User 1's list
    await user2ListsPage.getListAt(1).then((list) => list.assertOwner(userData.name));

    // Filter by user 1 lists
    await user1ListsPage.filterLists(userData.name);
    await user1ListsPage.expectListCount(1);
    await user1ListsPage.getListAt(0).then((list) => list.assertOwner(userData.name));

    await user1ListsPage.clearFilter();
    await user1ListsPage.expectListCount(2);

    // Filter by user 2 lists
    await user1ListsPage.filterLists(user2.name);
    await user1ListsPage.expectListCount(1);
    await user1ListsPage.getListAt(0).then((list) => list.assertOwner(user2.name));
});
