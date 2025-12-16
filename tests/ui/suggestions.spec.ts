import { expect, test } from "../fixtures";
import { CreateItemPage } from "../pageObjects/create-item.page";
import { ListPage } from "../pageObjects/list.page";
import { ListsPage } from "../pageObjects/lists.page";
import { randomString } from "../util";
import { disableSuggestions, setSuggestionMethod } from "../helpers/suggestions";

test("add item to another users list - disabled", async ({ page: user1Page, userData, additionalPage: user2Page }) => {
    // setup -- disable suggestions
    await disableSuggestions(user1Page);

    const user1ListsPage = new ListsPage(user1Page);
    await user1ListsPage.goto();

    const user1List = await user1ListsPage.getListAt(0);
    const user1ListPage = await user1List.click();

    const user1ListWithUser2 = new ListPage(user2Page, {
        id: user1ListPage.getId(),
        name: `${userData.name}'s Wishes`
    });
    await user1ListWithUser2.goto();
    await user1ListWithUser2.assertCreateItemNotAvailable();
    await new CreateItemPage(user2Page, { listId: user1ListWithUser2.getId() }).goto({ skipAssert: true });
    await expect(user2Page.getByText("Suggestions are disabled")).toBeVisible();
});

test("add item to another users list - surprise", async ({
    page: user1Page,
    userData,
    additionalPage: user2Page,
    additionalUserData: user2
}) => {
    await setSuggestionMethod(user1Page, "surprise");

    const user1ListsPage = new ListsPage(user1Page);
    await user1ListsPage.goto();

    // assert list has no items from user 1 perspective
    const user1List = await user1ListsPage.getListAt(0);
    await user1List.assertOwner(userData.name);
    const user1ListPage = await user1List.click();
    await user1ListPage.assertNoItems();

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
        .then((i) => i.assertAddedBy(user2.name));

    // assert list has no items from user 1 perspective
    await user1ListPage.assertNoItems();
    await user1Page.reload();
    await user1ListPage.assertNoItems();
});

test("add item to another users list - auto-approval", async ({
    page: user1Page,
    userData,
    additionalPage: user2Page,
    additionalUserData: user2
}) => {
    await setSuggestionMethod(user1Page, "auto-approval");

    const user1ListsPage = new ListsPage(user1Page);
    await user1ListsPage.goto();

    // assert list has no items from user 1 perspective
    const user1List = await user1ListsPage.getListAt(0);
    await user1List.assertOwner(userData.name);
    const user1ListPage = await user1List.click();
    await user1ListPage.assertNoItems();

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
        .then((i) => i.assertAddedBy(user2.name));

    // assert list has item added by user 2
    await user1ListPage
        .getItemAt(0)
        .then((i) => i.assertName(itemName))
        .then((i) => i.assertAddedBy(user2.name));
});

["approved", "denied"].forEach((result) =>
    test(`add item to another users list - approval ${result}`, async ({
        page: user1Page,
        userData,
        additionalPage: user2Page,
        additionalUserData: user2
    }) => {
        await setSuggestionMethod(user1Page, "approval");

        const user1ListsPage = new ListsPage(user1Page);
        await user1ListsPage.goto();

        // assert list has no items from user 1 perspective
        const user1List = await user1ListsPage.getListAt(0);
        await user1List.assertOwner(userData.name);
        const user1ListPage = await user1List.click();
        await user1ListPage.assertNoItems();

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
            .then((i) => i.assertAddedBy(user2.name))
            .then((i) => (result === "approved" ? i.approve() : i.deny()));

        if (result === "approved") {
            // visible for both users
            await user1ListPage
                .getItemAt(0)
                .then((i) => i.assertName(itemName))
                .then((i) => i.assertAddedBy(user2.name));
            await user1ListWithUser2
                .getItemAt(0)
                .then((i) => i.assertName(itemName))
                .then((i) => i.assertAddedBy(user2.name));
        } else {
            // item is fully gone
            await user1ListPage.assertNoItems();
            await user1ListWithUser2.assertNoItems();
        }
    })
);

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
