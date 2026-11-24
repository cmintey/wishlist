import { expect, type Page } from "@playwright/test";
import { test } from "../fixtures";
import { ListsPage } from "../pageObjects/lists.page";
import { randomString } from "../util";

// A list's owner never receives its claims: not in the list page's data, not in its live updates.
// Upstream hid them on screen only; the claimer's name and the claim ids reached the owner's browser.

async function createItem(ownerPage: Page) {
    const ownerLists = new ListsPage(ownerPage);
    await ownerLists.goto();
    const listPage = await ownerLists.getListAt(0).then((list) => list.click());
    const listId = new URL(ownerPage.url()).pathname.split("/").at(-1)!;
    const createItemPage = await listPage.createItem();
    await createItemPage.getForm().then((f) => f.fillName(randomString()));
    await createItemPage.create();
    return listId;
}

async function claimFirst(claimerPage: Page, ownerName: string, index = 0) {
    const claimerLists = new ListsPage(claimerPage);
    await claimerLists.goto();
    await claimerLists
        .getListByName(`${ownerName}'s Wishes`)
        .then((card) => card.click())
        .then((listPage) => listPage.getItemAt(index))
        .then((item) => item.claimSingle());
}

// Collects the raw text of every event on the list's live stream, in the page's own session
async function listen(page: Page, listId: string) {
    await page.evaluate((id) => {
        const w = window as unknown as { __events: string[] };
        w.__events = [];
        const source = new EventSource(`/lists/${id}/events`);
        source.onmessage = (e) => w.__events.push(e.data);
        for (const kind of ["item_create", "item_update", "item_delete", "items_update"]) {
            source.addEventListener(kind, (e) => w.__events.push((e as MessageEvent).data));
        }
    }, listId);
}

const events = (page: Page) => page.evaluate(() => (window as unknown as { __events: string[] }).__events.join("\n"));

test("the owner's list data carries no claim", async ({
    page: ownerPage,
    userData: owner,
    additionalPage: claimerPage,
    additionalUserData: claimer
}) => {
    const listId = await createItem(ownerPage);
    await claimFirst(claimerPage, owner.name);

    const asClaimer = await claimerPage.request.get(`/lists/${listId}/__data.json`).then((r) => r.text());
    expect(asClaimer, "control: another member's data names the claimer").toContain(claimer.name);

    const asOwner = await ownerPage.request.get(`/lists/${listId}/__data.json`).then((r) => r.text());
    expect(asOwner).not.toContain(claimer.name);
    expect(asOwner).not.toContain(claimer.username);
});

test("the owner's live updates carry no claim", async ({
    page: ownerPage,
    userData: owner,
    additionalPage: claimerPage,
    additionalUserData: claimer
}) => {
    const listId = await createItem(ownerPage);
    await createItem(ownerPage);

    await ownerPage.goto(`/lists/${listId}`);
    await listen(ownerPage, listId);
    const watcher = await claimerPage.context().newPage();
    await watcher.goto(`/lists/${listId}`);
    await listen(watcher, listId);

    await claimFirst(claimerPage, owner.name, 1);

    await expect
        .poll(() => events(watcher), { message: "control: another member's stream names the claimer" })
        .toContain(claimer.name);
    await expect.poll(() => events(ownerPage).then((t) => t.length)).toBeGreaterThan(0);
    expect(await events(ownerPage)).not.toContain(claimer.name);
    expect(await events(ownerPage)).not.toContain(claimer.username);
});
