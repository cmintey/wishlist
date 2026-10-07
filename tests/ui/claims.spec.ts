import { test } from "../fixtures";
import { GroupSettingsPage } from "../pageObjects/group-settings.page";
import { ListPage } from "../pageObjects/list.page";
import { ListsPage } from "../pageObjects/lists.page";
import { randomString } from "../util";

test("claim single", async ({ page: ownerPage, userData: owner, additionalPage: claimerPage }) => {
    await test.step("create item", async () => {
        const ownerLists = new ListsPage(ownerPage);
        await ownerLists.goto();
        const ownerListPage = await ownerLists.getListAt(0).then((list) => list.click());

        const createItemPage = await ownerListPage.createItem();
        await createItemPage.getForm().then((f) => f.fillName(randomString()));
        await createItemPage.create();
    });

    const claimerLists = new ListsPage(claimerPage);
    await test.step("user claims item", async () => {
        await claimerLists.goto();
        await claimerLists
            .getListByName(`${owner.name}'s Wishes`)
            .then((card) => card.click())
            .then((listPage) => listPage.getItemAt(0))
            .then((item) => item.claimSingle());
    });

    await test.step("list card shows none available", async () => {
        await claimerLists.goto();

        await claimerLists.getListByName(`${owner.name}'s Wishes`).then((card) => card.assertAvailableCount(0));
    });
});

test("partial claim", async ({ page: ownerPage, userData: owner, additionalPage: claimerPage }) => {
    const quantity = 4;

    await test.step("create item", async () => {
        const ownerLists = new ListsPage(ownerPage);
        await ownerLists.goto();
        const ownerListPage = await ownerLists.getListAt(0).then((list) => list.click());

        const createItemPage = await ownerListPage.createItem();
        await createItemPage
            .getForm()
            .then((f) => f.fillName(randomString()))
            .then((f) => f.fillQuantity(quantity));
        await createItemPage.create();
    });

    const claimerLists = new ListsPage(claimerPage);
    await test.step("user claims half items", async () => {
        await claimerLists.goto();
        await claimerLists
            .getListByName(`${owner.name}'s Wishes`)
            .then((card) => card.click())
            .then((listPage) => listPage.getItemAt(0))
            .then((item) => item.claimAmount(quantity / 2));
    });

    await test.step("list card shows half available", async () => {
        await claimerLists.goto();

        await claimerLists
            .getListByName(`${owner.name}'s Wishes`)
            .then((card) => card.assertAvailableCount(quantity / 2));
    });
});

test("claim unlimited item", async ({ page: ownerPage, userData: owner, additionalPage: claimerPage }) => {
    await test.step("create item", async () => {
        const ownerLists = new ListsPage(ownerPage);
        await ownerLists.goto();
        const ownerListPage = await ownerLists.getListAt(0).then((list) => list.click());

        const createItemPage = await ownerListPage.createItem();
        await createItemPage
            .getForm()
            .then((f) => f.fillName(randomString()))
            .then((f) => f.checkNoLimit());
        await createItemPage.create();
    });

    const claimerLists = new ListsPage(claimerPage);
    await test.step("user claims many items", async () => {
        await claimerLists.goto();
        await claimerLists
            .getListByName(`${owner.name}'s Wishes`)
            .then((card) => card.click())
            .then((listPage) => listPage.getItemAt(0))
            .then((item) => item.claimAmount(100));
    });

    await test.step("list card shows one available", async () => {
        await claimerLists.goto();
        await claimerLists.getListByName(`${owner.name}'s Wishes`).then((card) => card.assertAvailableCount(1)); // unlimited shows as one item available
    });
});

test("claim item on own list", async ({ page: ownerPage, userData: owner, additionalPage: claimerPage }) => {
    await test.step("create item", async () => {
        const ownerLists = new ListsPage(ownerPage);
        await ownerLists.goto();
        const ownerListPage = await ownerLists.getListAt(0).then((list) => list.click());

        const createItemPage = await ownerListPage.createItem();
        await createItemPage.getForm().then((f) => f.fillName(randomString()));
        await createItemPage.create();
    });

    const listPage = new ListPage(ownerPage, { name: owner.name });
    await test.step("validate claim button is missing", async () => {
        const listPage = new ListPage(ownerPage, { name: owner.name });
        await listPage.getItemAt(0).then((item) => item.assertNoClaimButton());
    });

    await test.step("mark list as 'not for me'", async () => {
        await listPage
            .manage()
            .then((mp) => mp.setNotForMe(true))
            .then((mp) => mp.save());
    });

    await test.step("validate owner can claim", async () => {
        await listPage.getItemAt(0).then((item) => item.assertClaimedQuantity(0));
        await listPage.getItemAt(0).then((item) => item.claimSingle());
        await listPage.getItemAt(0).then((item) => item.assertClaimedQuantity(1));
    });

    await test.step("validate owner can unclaim", async () => {
        await listPage.getItemAt(0).then((item) => item.unclaimSingle());
        await listPage.getItemAt(0).then((item) => item.assertClaimedQuantity(0));
    });

    await test.step("allow owner to claim items on group settings", async () => {
        const groupSettingsPage = new GroupSettingsPage(ownerPage, owner.groups[0]);
        await groupSettingsPage.goto();
        await groupSettingsPage.setShowForListOwner(true);
    });

    await test.step("allow owner to claim items", async () => {
        await listPage.goto({ skipAssert: true });
        const manageListPage = await listPage.manage();
        await manageListPage.getForm().then((form) => form.assertAllowOwnerClaimsDisabled());
        await manageListPage
            .setNotForMe(false)
            .then((mp) => mp.setAllowOwnerClaims(true))
            .then((mp) => mp.save());
    });

    await test.step("validate owner can claim", async () => {
        await listPage.getItemAt(0).then((item) => item.assertClaimedQuantity(0));
        await listPage.getItemAt(0).then((item) => item.claimSingle());
        await listPage.getItemAt(0).then((item) => item.assertClaimedQuantity(1));
    });

    await test.step("validate owner can unclaim", async () => {
        await listPage.getItemAt(0).then((item) => item.unclaimSingle());
        await listPage.getItemAt(0).then((item) => item.assertClaimedQuantity(0));
    });

    await test.step("another user can still claim item", async () => {
        const claimerLists = new ListsPage(claimerPage);
        await claimerLists.goto();
        await claimerLists
            .getListByName(`${owner.name}'s Wishes`)
            .then((card) => card.click())
            .then((listPage) => listPage.getItemAt(0))
            .then((item) => item.claimSingle());
    });
});
