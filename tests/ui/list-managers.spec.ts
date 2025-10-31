import type { Page } from "@playwright/test";
import { expect, test } from "../fixtures";
import { ListsPage } from "../pageObjects/lists.page";
import { setSuggestionMethod } from "../helpers/suggestions";
import { randomString } from "../util";

test("user can add a list manager", async ({ userFactory }) => {
    const { page, user } = await userFactory.createUserPage();
    const { user: managerUserData } = await userFactory.createUserPage({ group: user.groups[0] });

    const manageListPage = await new ListsPage(page)
        .goto()
        .then((p) => p.getListAt(0))
        .then((c) => c.click())
        .then((lp) => lp.manage());

    await manageListPage.expectNoManagers();

    await manageListPage.addManager(managerUserData.name);
    expect(await manageListPage.getManagers()).toContainEqual(managerUserData.name);

    await manageListPage.save().then((lp) => lp.manage());

    expect(await manageListPage.getManagers()).toContainEqual(managerUserData.name);
    await manageListPage.removeManager(managerUserData.name);

    await manageListPage.save().then((lp) => lp.manage());

    await manageListPage.expectNoManagers();
});

test("manager creates item bypasses suggestions", async ({ userFactory }) => {
    const { groupOwner, groupUser } = await userFactory.createMultiUserPages();

    await setSuggestionMethod(groupOwner.page, "approval");

    await test.step("user requires approval before being manager", async () => {
        const listPage = await new ListsPage(groupUser.page)
            .goto()
            .then((p) => p.getListByName(groupOwner.user.name))
            .then((c) => c.click());
        await listPage.createItem().then((p) => p.assertApprovalRequiredAlert());
    });

    await addManager(groupOwner.page, groupUser.user.name);

    const itemName = randomString();
    await test.step("manager creates item, bypassing approval", async () => {
        const listPage = await createItem(groupUser.page, groupOwner.user.name, itemName);
        await listPage
            .getItemAt(0)
            .then((i) => i.assertName(itemName))
            .then((i) => i.assertAddedBy(groupUser.user.name));
    });

    await test.step("owner can see item without needing to approve", async () => {
        await new ListsPage(groupOwner.page)
            .goto()
            .then((p) => p.getListByName(groupOwner.user.name))
            .then((c) => c.click())
            .then((lp) => lp.getItemAt(0))
            .then((i) => i.assertName(itemName))
            .then((i) => i.assertAddedBy(groupUser.user.name));
    });
});

test("manager creates item in surprise mode is visible to owner", async ({ userFactory }) => {
    const { groupOwner, groupUser } = await userFactory.createMultiUserPages();
    await setSuggestionMethod(groupOwner.page, "surprise");

    const itemName1 = randomString();
    await test.step("user adds item to list before becoming a manager", async () => {
        const listPage = await createItem(groupUser.page, groupOwner.user.name, itemName1);
        await listPage
            .getItemAt(0)
            .then((i) => i.assertName(itemName1))
            .then((i) => i.assertAddedBy(groupUser.user.name));
    });

    await test.step("owner cannot see the item", async () => {
        await new ListsPage(groupOwner.page)
            .goto()
            .then((p) => p.getListByName(groupOwner.user.name))
            .then((c) => c.click())
            .then((lp) => lp.assertNoItems());
    });

    await addManager(groupOwner.page, groupUser.user.name);

    await test.step("owner can see item", async () => {
        await new ListsPage(groupOwner.page)
            .goto()
            .then((p) => p.getListByName(groupOwner.user.name))
            .then((c) => c.click())
            .then((lp) => lp.getItemAt(0))
            .then((i) => i.assertName(itemName1))
            .then((i) => i.assertAddedBy(groupUser.user.name));
    });

    const itemName2 = randomString();
    await test.step("manager creates another item", async () => {
        const listPage = await createItem(groupUser.page, groupOwner.user.name, itemName2);
        await listPage
            .getItemAt(1)
            .then((i) => i.assertName(itemName2))
            .then((i) => i.assertAddedBy(groupUser.user.name));
    });

    await test.step("owner can see the item", async () => {
        await new ListsPage(groupOwner.page)
            .goto()
            .then((p) => p.getListByName(groupOwner.user.name))
            .then((c) => c.click())
            .then((lp) => lp.getItemAt(1))
            .then((i) => i.assertName(itemName2))
            .then((i) => i.assertAddedBy(groupUser.user.name));
    });
});

test("manager can approve/deny/delete items", async ({ userFactory }) => {
    const { groupOwner: listOwner, groupUser: listManager } = await userFactory.createMultiUserPages();
    const user = await userFactory.createUserPage({ group: listOwner.user.groups[0] });
    await setSuggestionMethod(listOwner.page, "approval");
    await addManager(listOwner.page, listManager.user.name);

    const itemName1 = randomString();
    const userListPage = await test.step("user adds item to list requiring approval", async () => {
        const listPage = await createItem(user.page, listOwner.user.name, itemName1);
        await listPage.assertNoItems();
        return listPage;
    });

    await test.step("manager can deny item", async () => {
        await new ListsPage(listManager.page)
            .goto()
            .then((p) => p.getListByName(listOwner.user.name))
            .then((c) => c.click())
            .then((l) => l.getItemForApprovalAt(0))
            .then((i) => i.assertName(itemName1))
            .then((i) => i.deny());
    });

    const itemName2 = randomString();
    await test.step("user adds item to list requiring approval", async () => {
        const listPage = await createItem(user.page, listOwner.user.name, itemName2);
        await listPage.assertNoItems();
    });

    const item = await test.step("manager can approve item", async () => {
        return new ListsPage(listManager.page)
            .goto()
            .then((p) => p.getListByName(listOwner.user.name))
            .then((c) => c.click())
            .then((l) => l.getItemForApprovalAt(0))
            .then((i) => i.assertName(itemName2))
            .then((i) => i.approve());
    });

    await test.step("user can see item once approved", async () => {
        await userListPage
            .getItemAt(0)
            .then((i) => i.assertName(itemName2))
            .then((i) => i.assertAddedBy(user.user.name));
    });

    await test.step("manager can delete item", async () => {
        await item.delete();
    });

    await test.step("item is no longer visible by user", async () => {
        await userListPage.assertNoItems();
    });
});

test.skip("manager can only remove item from list not delete from all lists", async () => {});

test.skip("list owner can still delete from all lists", async () => {});

test.skip("manager can edit item", async () => {});

async function addManager(ownerPage: Page, managerName: string) {
    await test.step("add manager", async () => {
        const manageListPage = await new ListsPage(ownerPage)
            .goto()
            .then((p) => p.getListAt(0))
            .then((c) => c.click())
            .then((lp) => lp.manage());

        await manageListPage
            .addManager(managerName)
            .then((mlp) => mlp.save())
            .then((lp) => lp.manage());
    });
}

async function createItem(page: Page, listName: string, itemName: string) {
    const listPage = await new ListsPage(page)
        .goto()
        .then((p) => p.getListByName(listName))
        .then((c) => c.click());
    const createItemPage = await listPage.createItem();
    await createItemPage.getForm().then((f) => f.fillName(itemName));
    await createItemPage.create();
    return listPage;
}
