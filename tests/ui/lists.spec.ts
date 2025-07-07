import { expect, test } from "../fixtures";
import { ListsPage } from "../pageObjects/lists.page";
import { addUserToGroup, createUser, randomString } from "../util";

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

    const manageListPage = await (await list.click()).manage();
    await manageListPage.at();
    const newListName = randomString();
    await (await manageListPage.setName(newListName)).save();

    await listsPage.goto();
    expect(await listsPage.getListCount()).toEqual(listCount);
    await list.assertName(newListName);
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
    const manageListPage = await (await newList.click()).manage();
    await manageListPage.delete();

    await listsPage.at();
    await listsPage.expectListCount(countBefore);
});

test("multiple users and list filter", async ({ page: user1Page, browser, userData }) => {
    const user1ListsPage = new ListsPage(user1Page);
    await user1ListsPage.goto();

    await user1ListsPage.expectListCount(1);
    const user1List = await user1ListsPage.getListAt(0);
    await user1List.assertOwner(userData.name);

    const user2 = await createUser(browser);
    await addUserToGroup(user1Page, user2.getUserData().name);
    const user2ListsPage = new ListsPage(user2.getPage());
    await user2ListsPage.goto();
    const user2List = await user2ListsPage.getListAt(0);
    await user2List.assertOwner(user2.getUserData().name);

    await user1ListsPage.expectListCount(2);
    await user2ListsPage.expectListCount(2);

    // Assert second list from User 1's perspective is User 2's list
    (await user1ListsPage.getListAt(1)).assertOwner(user2.getUserData().name);
    // Assert second list from User 2's perspective is User 1's list
    (await user2ListsPage.getListAt(1)).assertOwner(userData.name);

    // Filter by user 1 lists
    await user1ListsPage.filterLists(userData.name);
    await user1ListsPage.expectListCount(1);
    await user1ListsPage.getListAt(0).then((list) => list.assertOwner(userData.name));

    await user1ListsPage.clearFilter();
    await user1ListsPage.expectListCount(2);

    // Filter by user 2 lists
    await user1ListsPage.filterLists(user2.getUserData().name);
    await user1ListsPage.expectListCount(1);
    await user1ListsPage.getListAt(0).then((list) => list.assertOwner(user2.getUserData().name));

    await user2.cleanup();
});
