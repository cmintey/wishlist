import { expect, test } from "../fixtures";
import { ListsPage } from "../pageObjects/lists.page";
import { randomString } from "../util";

test("create list with default values", async ({ page, userData }) => {
    const listPage = new ListsPage(page);
    await listPage.at();
    const countBefore = await listPage.getListCount();

    const createListPage = await listPage.create();
    await createListPage.at();
    await createListPage.createDefault();

    await listPage.goto();
    await listPage.expectListCount(countBefore + 1);

    const listCount = await listPage.getListCount();
    const newList = await listPage.getListAt(listCount - 1);
    await newList.assertName(`${userData.name}'s Wishes`);
    await newList.assertOwner(userData.name);
});

test("create list with name", async ({ page, userData }) => {
    const listPage = new ListsPage(page);
    await listPage.at();
    const countBefore = await listPage.getListCount();

    const listName = randomString();
    const createListPage = await listPage.create();
    await createListPage.at();
    await createListPage.create(listName);

    await listPage.goto();
    await listPage.expectListCount(countBefore + 1);

    const listCount = await listPage.getListCount();
    const newList = await listPage.getListAt(listCount - 1);
    await newList.assertName(listName);
    await newList.assertOwner(userData.name);
});

test("change list name", async ({ page, userData }) => {
    const listsPage = new ListsPage(page);
    await listsPage.at();

    const listName = randomString();
    const createListPage = await listsPage.create();
    await createListPage.at();
    await createListPage.create(listName);

    await listsPage.goto();

    const listCount = await listsPage.getListCount();
    const newList = await listsPage.getListByName(listName);
    await newList.assertName(listName);
    await newList.assertOwner(userData.name);

    const manageListPage = await (await newList.click()).manage();
    await manageListPage.at();
    const newListName = randomString();
    await (await manageListPage.setName(newListName)).save();

    await listsPage.goto();
    expect(await listsPage.getListCount()).toEqual(listCount);
    (await listsPage.getListByName(newListName)).assertName(newListName);
});
