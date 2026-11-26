import { expect, test } from "../fixtures";
import { ListsPage } from "../pageObjects/lists.page";
import { randomString } from "../util";
import { setSuggestionMethod } from "../helpers/suggestions";
import { ListPage } from "../pageObjects/list.page";
import { UserMenu } from "../modules/user-menu";

test("only the creator can change archive state and other users cannot see archived wishes", async ({
    page: creator,
    additionalPage: other,
    anonymousPage
}) => {
    const wish = randomString();
    const lists = new ListsPage(creator);
    await lists.goto();
    const list = await lists.getListAt(0).then((card) => card.click());
    const create = await list.createItem();
    await create.getForm().then((form) => form.fillName(wish));
    await create.create();
    await list.getItemAt(0).then((item) => item.edit());
    const itemId = new URL(creator.url()).pathname.split("/")[2];
    const endpoint = `/api/items/${itemId}/archive`;

    expect((await other.request.patch(endpoint, { data: { archived: true } })).status()).toBe(404);
    expect((await anonymousPage.request.patch(endpoint, { data: { archived: true } })).status()).toBe(401);
    expect((await creator.request.patch(endpoint, { data: { archived: true } })).status()).toBe(200);

    expect((await creator.request.get(`/items/${itemId}/edit`)).status()).toBe(404);
    expect(
        (
            await creator.request.post(`/items/${itemId}/edit`, {
                multipart: { name: "attempted change", quantity: "1", lists: list.getId() }
            })
        ).ok()
    ).toBe(false);
    expect((await creator.request.delete(`/api/items/${itemId}`)).status()).toBe(404);
    expect((await creator.request.delete(`/api/lists/${list.getId()}/items/${itemId}`)).status()).toBe(404);
    expect(
        (
            await creator.request.patch(`/api/lists/${list.getId()}/items/${itemId}`, { data: { approved: false } })
        ).status()
    ).toBe(404);
    expect(
        (
            await creator.request.patch(`/api/lists/${list.getId()}/items`, {
                data: [{ itemId: Number(itemId), displayOrder: 0 }]
            })
        ).status()
    ).toBe(404);
    expect((await creator.request.patch(`/api/items/${itemId}x/archive`, { data: { archived: true } })).status()).toBe(
        400
    );
    expect((await creator.request.patch(endpoint, { data: { archived: "yes" } })).status()).toBe(400);

    const listResponse = await other.request.get(list.getUrl());
    expect(await listResponse.text()).not.toContain(wish);
    const archiveResponse = await other.request.get("/archive");
    expect(await archiveResponse.text()).not.toContain(wish);
    expect((await other.request.patch(endpoint, { data: { archived: false } })).status()).toBe(404);
    expect((await creator.request.get("/archive")).status()).toBe(200);
    expect(await (await creator.request.get("/archive")).text()).toContain(wish);
    expect((await creator.request.patch(endpoint, { data: { archived: false } })).status()).toBe(200);
});

test("archive shows all claims from different groups without depending on the active group", async ({
    page: owner,
    userData,
    additionalPage: firstPage,
    additionalUserData: first,
    userFactory,
    adminPage
}) => {
    const second = await userFactory.createUserPage();
    const groupId = second.user.groups[0].id;
    expect(
        (
            await adminPage.request.put(`/api/groups/${groupId}/users/${userData.id}`, { data: { manager: true } })
        ).status()
    ).toBe(201);
    const firstLists = new ListsPage(owner);
    await firstLists.goto();
    const firstList = await firstLists.getListAt(0).then((card) => card.click());
    expect(
        (await adminPage.request.patch(`/api/users/${userData.id}/groups/${groupId}`, { data: { active: true } })).ok()
    ).toBe(true);
    await firstLists.goto();
    const secondList = await firstLists.getListAt(0).then((card) => card.click());
    const wish = randomString();
    const form = new FormData();
    form.append("name", wish);
    form.append("quantity", "5");
    form.append("lists", firstList.getId());
    form.append("lists", secondList.getId());
    const created = await owner.request.post(`${secondList.getUrl()}/create-item`, {
        multipart: form,
        headers: { Origin: "http://localhost:3280" }
    });
    expect(created.status(), await created.text()).toBeLessThan(400);
    await secondList.goto();
    await secondList.getItemAt(0).then((item) => item.edit());
    const itemId = new URL(owner.url()).pathname.split("/")[2];
    expect(
        (
            await firstPage.request.put(`/api/lists/${firstList.getId()}/items/${itemId}/claims`, {
                data: { claimedById: first.id, quantity: 2 }
            })
        ).status()
    ).toBe(200);
    expect(
        (
            await second.page.request.put(`/api/lists/${secondList.getId()}/items/${itemId}/claims`, {
                data: { claimedById: second.user.id, quantity: 3 }
            })
        ).status()
    ).toBe(200);
    expect((await owner.request.patch(`/api/items/${itemId}/archive`, { data: { archived: true } })).status()).toBe(
        200
    );
    for (const page of [owner, firstPage, second.page]) {
        const body = await (await page.request.get("/archive")).text();
        expect(body).toContain(wish);
        expect(body).toContain(first.name);
        expect(body).toContain(second.user.name);
        expect(body).toContain("2 claimed");
        expect(body).toContain("3 claimed");
    }
    expect((await owner.request.patch(`/api/items/${itemId}/archive`, { data: { archived: false } })).status()).toBe(
        200
    );
    expect(await (await firstPage.request.get("/claims")).text()).toContain(wish);
    expect(await (await second.page.request.get("/claims")).text()).toContain(wish);
});

test("claimant sees archived claims and cannot change them until restore", async ({
    page: owner,
    userData,
    additionalPage: claimant,
    additionalUserData
}) => {
    const wish = randomString();
    const lists = new ListsPage(owner);
    await lists.goto();
    const list = await lists.getListAt(0).then((card) => card.click());
    const create = await list.createItem();
    await create.getForm().then((form) => form.fillName(wish));
    await create.create();
    await list.getItemAt(0).then((item) => item.edit());
    const itemId = new URL(owner.url()).pathname.split("/")[2];

    const otherList = new ListPage(claimant, { id: list.getId(), name: `${userData.name}'s Wishes` });
    await otherList.goto();
    await otherList.getItemAt(0).then((item) => item.claimSingle());
    await claimant.goto("/claims");
    const purchaseResponse = claimant.waitForResponse(
        (response) => response.request().method() === "PATCH" && /\/api\/claims\//.test(response.url())
    );
    await claimant.getByRole("button", { name: "Mark item as purchased" }).click();
    const claimId = new URL((await purchaseResponse).url()).pathname.split("/").at(-1);
    expect(claimId).toBeTruthy();

    expect((await owner.request.patch(`/api/items/${itemId}/archive`, { data: { archived: true } })).status()).toBe(
        200
    );
    expect(await (await claimant.request.get("/claims")).text()).not.toContain(wish);
    const archive = await claimant.request.get("/archive");
    const body = await archive.text();
    expect(body).toContain(wish);
    expect(body).toContain(additionalUserData.name);
    expect(body).not.toContain(userData.email);
    expect(body).toContain(`${additionalUserData.name}: 1 claimed`);
    expect((await claimant.request.patch(`/api/claims/${claimId}`, { data: { purchased: true } })).ok()).toBe(false);
    expect((await claimant.request.delete(`/api/claims/${claimId}`)).ok()).toBe(false);
    expect(
        (
            await claimant.request.put(`/api/lists/${list.getId()}/items/${itemId}/claims`, {
                data: { claimedById: additionalUserData.id, quantity: 1 }
            })
        ).ok()
    ).toBe(false);

    expect((await owner.request.patch(`/api/items/${itemId}/archive`, { data: { archived: false } })).status()).toBe(
        200
    );
    expect(await (await claimant.request.get("/claims")).text()).toContain(wish);
    expect((await claimant.request.patch(`/api/claims/${claimId}`, { data: { purchased: true } })).status()).toBe(200);
});

test("a pending suggestion cannot be archived", async ({ page: owner, additionalPage: suggester, userData }) => {
    await setSuggestionMethod(owner, "approval");
    const lists = new ListsPage(owner);
    await lists.goto();
    const list = await lists.getListAt(0).then((card) => card.click());
    const otherList = new ListPage(suggester, { id: list.getId(), name: `${userData.name}'s Wishes` });
    await otherList.goto();
    const create = await otherList.createItem();
    const wish = randomString();
    await create.getForm().then((form) => form.fillName(wish));
    await create.create();
    await list.goto();
    await owner.getByTestId("approvals-container").locator("div.card").filter({ hasText: wish }).click();
    const itemId = new URL(owner.url()).searchParams.get("item-id");
    expect(itemId).toBeTruthy();
    expect((await suggester.request.patch(`/api/items/${itemId}/archive`, { data: { archived: true } })).status()).toBe(
        409
    );
});

test("archiving reveals a surprise only in eligible archives and restoration hides it again", async ({
    page: recipient,
    userData,
    additionalPage: creator,
    additionalUserData
}) => {
    await setSuggestionMethod(recipient, "surprise");
    const lists = new ListsPage(recipient);
    await lists.goto();
    const list = await lists.getListAt(0).then((card) => card.click());
    const before = await (await recipient.request.get(list.getUrl())).text();
    const wish = randomString();
    const creatorList = new ListPage(creator, { id: list.getId(), name: `${userData.name}'s Wishes` });
    await creatorList.goto();
    const create = await creatorList.createItem();
    await create.getForm().then((form) => form.fillName(wish));
    await create.create();
    await creatorList.getItemAt(0).then((item) => item.edit());
    const itemId = new URL(creator.url()).pathname.split("/")[2];
    const hidden = await (await recipient.request.get(list.getUrl())).text();
    expect(before).not.toContain(wish);
    expect(hidden).not.toContain(wish);
    expect(await (await recipient.request.get("/archive")).text()).not.toContain(wish);
    expect((await creator.request.patch(`/api/items/${itemId}/archive`, { data: { archived: true } })).status()).toBe(
        200
    );
    const archived = await (await recipient.request.get("/archive")).text();
    expect(archived).toContain(wish);
    expect(archived).not.toContain(additionalUserData.email);
    expect(await (await recipient.request.get(list.getUrl())).text()).not.toContain(wish);
    expect((await creator.request.patch(`/api/items/${itemId}/archive`, { data: { archived: false } })).status()).toBe(
        200
    );
    expect(await (await recipient.request.get(list.getUrl())).text()).not.toContain(wish);
});

test("a claim racing with archive cannot be added after archive", async ({
    page: creator,
    additionalPage: claimant,
    additionalUserData
}) => {
    const lists = new ListsPage(creator);
    await lists.goto();
    const list = await lists.getListAt(0).then((card) => card.click());
    const create = await list.createItem();
    await create
        .getForm()
        .then((form) => form.fillName(randomString()))
        .then((form) => form.fillQuantity(20));
    await create.create();
    await list.getItemAt(0).then((item) => item.edit());
    const itemId = new URL(creator.url()).pathname.split("/")[2];
    const archiveUrl = `/api/items/${itemId}/archive`;
    const claimUrl = `/api/lists/${list.getId()}/items/${itemId}/claims`;
    const [archive] = await Promise.all([
        creator.request.patch(archiveUrl, { data: { archived: true } }),
        ...Array.from({ length: 5 }, () =>
            claimant.request.put(claimUrl, { data: { claimedById: additionalUserData.id, quantity: 1 } })
        )
    ]);
    expect(archive.status()).toBe(200);
    const before = await (await creator.request.get("/archive")).text();
    expect(
        (await claimant.request.put(claimUrl, { data: { claimedById: additionalUserData.id, quantity: 1 } })).ok()
    ).toBe(false);
    const after = await (await creator.request.get("/archive")).text();
    expect(after).toBe(before);
});

test("former group members keep their archive roles without retaining access to the list", async ({
    page: recipient,
    userData,
    additionalPage: creator,
    additionalUserData,
    userFactory,
    adminPage
}) => {
    await setSuggestionMethod(recipient, "auto-approval");
    const claimant = await userFactory.createUserPage({ group: userData.groups[0] });
    const wish = randomString();
    const lists = new ListsPage(recipient);
    await lists.goto();
    const list = await lists.getListAt(0).then((card) => card.click());
    const creatorList = new ListPage(creator, { id: list.getId(), name: `${userData.name}'s Wishes` });
    await creatorList.goto();
    const create = await creatorList.createItem();
    await create.getForm().then((form) => form.fillName(wish));
    await create.create();
    await creatorList.getItemAt(0).then((item) => item.edit());
    const itemId = new URL(creator.url()).pathname.split("/")[2];
    const claimantList = new ListPage(claimant.page, { id: list.getId(), name: `${userData.name}'s Wishes` });
    await claimantList.goto();
    await claimantList.getItemAt(0).then((item) => item.claimSingle());
    expect((await creator.request.patch(`/api/items/${itemId}/archive`, { data: { archived: true } })).status()).toBe(
        200
    );

    for (const user of [additionalUserData, claimant.user]) {
        const newGroup = await adminPage.request.put("/api/groups", {
            data: { name: randomString(), createOnly: true }
        });
        const groupId = (await newGroup.json()).group.id;
        expect(
            (
                await adminPage.request.put(`/api/groups/${groupId}/users/${user.id}`, { data: { manager: false } })
            ).status()
        ).toBe(201);
        expect(
            (await adminPage.request.patch(`/api/users/${user.id}/groups/${groupId}`, { data: { active: true } })).ok()
        ).toBe(true);
        expect((await adminPage.request.delete(`/api/groups/${userData.groups[0].id}/users/${user.id}`)).ok()).toBe(
            true
        );
    }
    expect((await creator.request.get(list.getUrl())).status()).toBe(404);
    expect(await (await creator.request.get("/archive")).text()).toContain(wish);
    expect(await (await claimant.page.request.get("/archive")).text()).toContain(wish);
    expect((await creator.request.patch(`/api/items/${itemId}/archive`, { data: { archived: false } })).status()).toBe(
        200
    );
});

test("surprise archive transitions do not send item or invalidation events to the recipient", async ({
    page: recipient,
    additionalPage: creator,
    userData
}) => {
    await setSuggestionMethod(recipient, "surprise");
    const lists = new ListsPage(recipient);
    await lists.goto();
    const list = await lists.getListAt(0).then((card) => card.click());
    const manage = await list.manage();
    await manage.setNotForMe(true);
    await manage.save();
    await list.goto();
    const connection = recipient.waitForRequest((request) => request.url().endsWith("/events"));
    await recipient.evaluate((listId) => {
        const records: string[] = [];
        (window as unknown as { archiveEvents: string[] }).archiveEvents = records;
        const source = new EventSource(`/lists/${listId}/events`);
        for (const type of ["item_create", "item_update", "item_delete", "items_update"]) {
            source.addEventListener(type, (event) => records.push(`${type}:${(event as MessageEvent).data}`));
        }
    }, list.getId());
    await connection;
    const creatorList = new ListPage(creator, { id: list.getId(), name: `${userData.name}'s Wishes` });
    await creatorList.goto();
    const wish = randomString();
    const create = await creatorList.createItem();
    await create.getForm().then((form) => form.fillName(wish));
    await create.create();
    await creatorList.getItemAt(0).then((item) => item.edit());
    const itemId = new URL(creator.url()).pathname.split("/")[2];
    expect((await creator.request.patch(`/api/items/${itemId}/archive`, { data: { archived: true } })).status()).toBe(
        200
    );
    expect((await creator.request.patch(`/api/items/${itemId}/archive`, { data: { archived: false } })).status()).toBe(
        200
    );
    await recipient.waitForTimeout(250);
    const events = await recipient.evaluate(() => (window as unknown as { archiveEvents: string[] }).archiveEvents);
    expect(events).toEqual([]);
    expect(await (await recipient.request.get(list.getUrl())).text()).not.toContain(wish);
});

test("archive hides a multi-list wish and its counts from public viewers, then restores it", async ({
    page: owner,
    additionalPage: viewer,
    anonymousPage,
    userData
}) => {
    await new UserMenu(owner).manageGroup().then((p) => p.allowPublicLists());
    const lists = new ListsPage(owner);
    await lists.goto();
    const newListName = randomString();
    await lists.create().then((page) => page.create(newListName));
    const list = new ListPage(owner, { name: newListName });
    await list.manage().then((page) => page.makePublic());
    await lists.goto();
    const firstCard = await lists.getListByName(`${userData.name}'s Wishes`);
    const firstName = await firstCard.getName();
    await firstCard.click();
    await list.goto();
    const wish = randomString();
    const create = await list.createItem();
    await create
        .getForm()
        .then((form) => form.fillName(wish))
        .then((form) => form.fillQuantity(4))
        .then((form) => form.selectList(firstName));
    await create.create();
    expect(await (await anonymousPage.request.get(list.getUrl())).text()).toContain(wish);
    await list.getItemAt(0).then((item) => item.edit());
    const itemId = new URL(owner.url()).pathname.split("/")[2];
    expect((await owner.request.patch(`/api/items/${itemId}/archive`, { data: { archived: true } })).status()).toBe(
        200
    );
    expect(await (await anonymousPage.request.get(list.getUrl())).text()).not.toContain(wish);
    expect(await (await viewer.request.get(list.getUrl())).text()).not.toContain(wish);
    for (const filter of ["claimed", "unclaimed"]) {
        expect(await (await viewer.request.get(`${list.getUrl()}?filter=${filter}`)).text()).not.toContain(wish);
    }
    await lists.goto();
    await lists.getListByName(firstName).then((card) => card.assertItemCount(0));
    await lists.getListByName(newListName).then((card) => card.assertItemCount(0));
    const archive = await (await owner.request.get("/archive")).text();
    expect(archive.split(wish).length - 1).toBe(2); // HTML and hydration payload
    expect((await owner.request.patch(`/api/items/${itemId}/archive`, { data: { archived: false } })).status()).toBe(
        200
    );
    expect(await (await anonymousPage.request.get(list.getUrl())).text()).toContain(wish);
    await lists.goto();
    await lists.getListByName(newListName).then((card) => card.assertItemCount(4));
});

test("all eligible viewers see registered and anonymous claims without anonymous email", async ({
    page: owner,
    additionalPage: firstPage,
    additionalUserData: first,
    userData,
    userFactory,
    anonymousPage
}) => {
    await new UserMenu(owner).manageGroup().then((p) => p.allowPublicLists());
    const second = await userFactory.createUserPage({ group: userData.groups[0] });
    const lists = new ListsPage(owner);
    await lists.goto();
    const list = await lists.getListAt(0).then((card) => card.click());
    await list.manage().then((page) => page.makePublic());
    await list.goto();
    const wish = randomString();
    const create = await list.createItem();
    await create
        .getForm()
        .then((form) => form.fillName(wish))
        .then((form) => form.checkNoLimit());
    await create.create();
    await list.getItemAt(0).then((item) => item.edit());
    const itemId = new URL(owner.url()).pathname.split("/")[2];
    const claimUrl = `/api/lists/${list.getId()}/items/${itemId}/claims`;
    expect((await firstPage.request.put(claimUrl, { data: { claimedById: first.id, quantity: 2 } })).status()).toBe(
        200
    );
    expect(
        (await second.page.request.put(claimUrl, { data: { claimedById: second.user.id, quantity: 3 } })).status()
    ).toBe(200);
    const email = `${randomString()}@example.com`;
    const publicUser = await anonymousPage.request.post("/api/users/public", {
        data: { groupId: userData.groups[0].id, name: "Guest Claimant", username: email }
    });
    expect(publicUser.ok()).toBe(true);
    const publicId = (await publicUser.json()).id;
    expect(
        (await anonymousPage.request.put(claimUrl, { data: { publicClaimedById: publicId, quantity: 4 } })).status()
    ).toBe(200);
    expect((await owner.request.patch(`/api/items/${itemId}/archive`, { data: { archived: true } })).status()).toBe(
        200
    );
    for (const page of [owner, firstPage, second.page]) {
        const body = await (await page.request.get("/archive")).text();
        expect(body).toContain(wish);
        expect(body).toContain(first.name);
        expect(body).toContain(second.user.name);
        expect(body).toContain("Guest Claimant");
        expect(body).not.toContain(email);
        expect(body).toContain("2 claimed");
        expect(body).toContain("3 claimed");
        expect(body).toContain("4 claimed");
    }
    expect((await anonymousPage.request.get("/archive")).url()).toContain("/login");
});

test("list deletion still cascades archived claims", async ({ page, additionalPage, additionalUserData }) => {
    const wish = randomString();
    const lists = new ListsPage(page);
    await lists.goto();
    const list = await lists.getListAt(0).then((card) => card.click());
    const create = await list.createItem();
    await create.getForm().then((form) => form.fillName(wish));
    await create.create();
    await list.getItemAt(0).then((item) => item.edit());
    const itemId = new URL(page.url()).pathname.split("/")[2];
    expect(
        (
            await additionalPage.request.put(`/api/lists/${list.getId()}/items/${itemId}/claims`, {
                data: { claimedById: additionalUserData.id, quantity: 1 }
            })
        ).status()
    ).toBe(200);
    expect((await page.request.patch(`/api/items/${itemId}/archive`, { data: { archived: true } })).status()).toBe(200);
    expect(await (await page.request.get("/archive")).text()).toContain(additionalUserData.name);
    await list.goto();
    await list.manage().then((manage) => manage.delete());
    await expect.poll(async () => (await page.request.get("/archive")).text()).not.toContain(additionalUserData.name);
    expect(await (await additionalPage.request.get("/archive")).text()).not.toContain(wish);
});

test("a list manager who is not an archive role cannot access archived data", async ({
    page: owner,
    additionalPage: manager,
    additionalUserData
}) => {
    const wish = randomString();
    const lists = new ListsPage(owner);
    await lists.goto();
    const list = await lists.getListAt(0).then((card) => card.click());
    const manage = await list.manage();
    await manage.addManager(additionalUserData.name);
    await manage.save();
    await list.goto();
    const create = await list.createItem();
    await create.getForm().then((form) => form.fillName(wish));
    await create.create();
    await list.getItemAt(0).then((item) => item.edit());
    const itemId = new URL(owner.url()).pathname.split("/")[2];
    expect((await owner.request.patch(`/api/items/${itemId}/archive`, { data: { archived: true } })).status()).toBe(
        200
    );
    expect(await (await manager.request.get("/archive")).text()).not.toContain(wish);
    expect(await (await manager.request.get(list.getUrl())).text()).not.toContain(wish);
    expect((await manager.request.get(`/items/${itemId}/edit`)).status()).toBe(404);
    expect((await manager.request.delete(`/api/lists/${list.getId()}/items/${itemId}`)).status()).toBe(404);
});

test("mixed approval archives the whole wish when one association is approved", async ({
    page: recipient,
    userData,
    additionalPage: creator
}) => {
    await setSuggestionMethod(recipient, "approval");
    const lists = new ListsPage(recipient);
    await lists.goto();
    const secondName = randomString();
    await lists.create().then((page) => page.create(secondName));
    const secondList = new ListPage(recipient, { name: secondName });
    await lists.goto();
    const recipientList = await lists.getListByName(`${userData.name}'s Wishes`).then((card) => card.click());
    const creatorLists = new ListsPage(creator);
    await creatorLists.goto();
    const creatorList = await creatorLists.getListByName(`${userData.name}'s Wishes`).then((card) => card.click());
    const wish = randomString();
    const create = await creatorList.createItem();
    await create
        .getForm()
        .then((form) => form.fillName(wish))
        .then((form) => form.selectList(secondName));
    await create.create();
    await recipientList.goto();
    await recipient.getByTestId("approvals-container").locator("div.card").filter({ hasText: wish }).click();
    const itemId = new URL(recipient.url()).searchParams.get("item-id");
    expect(itemId).toBeTruthy();
    await recipient.getByRole("dialog").getByRole("button", { name: "close" }).click();
    expect((await creator.request.patch(`/api/items/${itemId}/archive`, { data: { archived: true } })).status()).toBe(
        409
    );
    expect(
        (
            await recipient.request.patch(`/api/lists/${secondList.getId()}/items/${itemId}`, {
                data: { approved: true }
            })
        ).status()
    ).toBe(200);
    expect((await creator.request.patch(`/api/items/${itemId}/archive`, { data: { archived: true } })).status()).toBe(
        200
    );
    expect(await (await recipient.request.get(recipientList.getUrl())).text()).not.toContain(wish);
    expect(await (await creator.request.get(secondList.getUrl())).text()).not.toContain(wish);
    expect(await (await recipient.request.get("/archive")).text()).toContain(wish);
    expect((await creator.request.patch(`/api/items/${itemId}/archive`, { data: { archived: false } })).status()).toBe(
        200
    );
    await recipientList.goto();
    await expect(
        recipient.getByTestId("approvals-container").getByTestId("name").filter({ hasText: wish })
    ).toBeVisible();
    expect(await (await creator.request.get(secondList.getUrl())).text()).toContain(wish);
});

test("self-claim does not duplicate archive entries and remains read-only", async ({ page, userData }) => {
    const lists = new ListsPage(page);
    await lists.goto();
    const list = await lists.getListAt(0).then((card) => card.click());
    const manage = await list.manage();
    await manage.setNotForMe(true);
    await manage.save();
    await list.goto();
    const wish = randomString();
    const create = await list.createItem();
    await create.getForm().then((form) => form.fillName(wish));
    await create.create();
    await list.getItemAt(0).then((item) => item.claimSingle());
    await list.getItemAt(0).then((item) => item.edit());
    const itemId = new URL(page.url()).pathname.split("/")[2];
    expect((await page.request.patch(`/api/items/${itemId}/archive`, { data: { archived: true } })).status()).toBe(200);
    await page.goto("/archive");
    await expect(page.getByTestId("archive-container").locator("article")).toHaveCount(1);
    await expect(page.getByText(`${userData.name}: 1 claimed`)).toBeVisible();
    await expect(page.getByRole("button", { name: "Unclaim" })).toHaveCount(0);
});

test("archived wishes are absent from anonymous registry responses", async ({ page, anonymousPage }) => {
    await new UserMenu(page)
        .manageGroup()
        .then((group) => group.clickSettingsTab())
        .then((group) => group.changeWishlistMode("registry"));
    await page.goto("/lists");
    const list = new ListPage(page, { name: "My Wishes" });
    const wish = randomString();
    const create = await list.createItem();
    await create.getForm().then((form) => form.fillName(wish));
    await create.create();
    expect(await (await anonymousPage.request.get(list.getUrl())).text()).toContain(wish);
    await list.getItemAt(0).then((item) => item.edit());
    const itemId = new URL(page.url()).pathname.split("/")[2];
    expect((await page.request.patch(`/api/items/${itemId}/archive`, { data: { archived: true } })).status()).toBe(200);
    expect(await (await anonymousPage.request.get(list.getUrl())).text()).not.toContain(wish);
    expect((await page.request.patch(`/api/items/${itemId}/archive`, { data: { archived: false } })).status()).toBe(
        200
    );
    expect(await (await anonymousPage.request.get(list.getUrl())).text()).toContain(wish);
});
