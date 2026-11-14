import type { APIRequestContext, Page } from "@playwright/test";
import { createHash } from "node:crypto";
import { expect, test } from "../fixtures";
import { GroupSettingsPage } from "../pageObjects/group-settings.page";
import { ListsPage } from "../pageObjects/lists.page";
import type { GroupData } from "../types";
import { randomString } from "../util";

async function createPublicItem(page: Page, group: GroupData, quantity = 1) {
    const settings = new GroupSettingsPage(page, group);
    await settings.goto();
    await settings.allowPublicLists();

    const lists = new ListsPage(page);
    await lists.goto();
    const list = await lists.getListAt(0).then((card) => card.click());
    const manage = await list.manage();
    await manage.getForm().then((form) => form.makePublic());
    await list.goto();

    const itemName = randomString();
    const create = await list.createItem();
    await create.getForm().then((form) => form.fillName(itemName));
    await create.getForm().then((form) => form.fillQuantity(quantity));
    await create.create();
    await list.getItemAt(0).then((item) => item.edit());
    const itemId = Number(new URL(page.url()).pathname.split("/")[2]);
    await list.goto();
    return { list, itemId, itemName, groupId: group.id };
}

async function claimAsGuest(request: APIRequestContext, listId: string, itemId: number, groupId: string) {
    const name = randomString();
    const publicUser = await request.post("/api/users/public", {
        data: { groupId, username: `${randomString()}@example.com`, name }
    });
    expect(publicUser.ok()).toBeTruthy();
    const { id }: { id: string } = await publicUser.json();
    const response = await request.put(`/api/lists/${listId}/items/${itemId}/claims`, {
        data: { publicClaimedById: id, quantity: 1 }
    });
    expect(response.ok()).toBeTruthy();
    const claim: { claimId: string; token: string } = await response.json();
    return { ...claim, name };
}

test("email claim link reuses the item controls and consumes only its token", async ({
    page,
    userData,
    anonymousPage
}) => {
    const { list, itemId, itemName, groupId } = await createPublicItem(page, userData.groups[0]);
    const claim = await claimAsGuest(anonymousPage.request, list.getId(), itemId, groupId);
    const publicResponse = await anonymousPage.request.get(list.getUrl());
    const publicHtml = await publicResponse.text();
    expect(publicHtml).not.toContain(claim.token);
    expect(publicHtml).not.toContain(createHash("sha3-256").update(claim.token).digest("hex"));

    const response = await anonymousPage.goto(`/claims/manage?token=${claim.token}`);
    expect(response?.headers()["referrer-policy"]).toBe("no-referrer");
    expect(response?.headers()["cache-control"]).toBe("no-store");
    await expect(anonymousPage.getByText(itemName, { exact: true }).first()).toBeVisible();
    await anonymousPage.getByRole("button", { name: "Unclaim", exact: true }).click();
    await expect(anonymousPage.getByText("Unclaimed item")).toBeVisible();
    const replay = await anonymousPage.request.delete("/api/claims/public", { data: { token: claim.token } });
    expect(replay.status()).toBe(404);
    const spentLink = await anonymousPage.request.get(`/claims/manage?token=${claim.token}`);
    expect(spentLink.status()).toBe(404);
});

test("public cancellation rejects malformed tokens and does not release a registered claim", async ({
    page,
    userData,
    additionalPage,
    additionalUserData,
    anonymousPage
}) => {
    const { list, itemId, groupId } = await createPublicItem(page, userData.groups[0]);
    const publicUser = await anonymousPage.request.post("/api/users/public", {
        data: { groupId, username: "guest@example.com" }
    });
    const { id: publicClaimedById }: { id: string } = await publicUser.json();
    const mixedIdentity = await additionalPage.request.put(`/api/lists/${list.getId()}/items/${itemId}/claims`, {
        data: { claimedById: additionalUserData.id, publicClaimedById, quantity: 1 }
    });
    expect(mixedIdentity.status()).toBe(400);
    const registered = await additionalPage.request.put(`/api/lists/${list.getId()}/items/${itemId}/claims`, {
        data: { claimedById: additionalUserData.id, quantity: 1 }
    });
    expect(registered.ok()).toBeTruthy();
    expect(await registered.text()).toBe("");
    expect((await anonymousPage.request.delete("/api/claims/public", { data: {} })).status()).toBe(422);
    expect((await anonymousPage.request.delete("/api/claims/public", { data: { token: "invalid" } })).status()).toBe(
        404
    );
    await additionalPage.goto(list.getUrl());
    await expect(additionalPage.getByRole("button", { name: "Unclaim", exact: true }).first()).toBeVisible();
    await list.goto();
    await list.getItemAt(0).then((item) => item.assertClaimedQuantityHidden());
    await expect(page.getByRole("button", { name: "Unclaim", exact: true })).toHaveCount(0);
});

test("simultaneous releases consume the guest token once", async ({ page, userData, anonymousPage }) => {
    const { list, itemId, groupId } = await createPublicItem(page, userData.groups[0]);
    const claim = await claimAsGuest(anonymousPage.request, list.getId(), itemId, groupId);
    const responses = await Promise.all([
        anonymousPage.request.delete("/api/claims/public", { data: { token: claim.token } }),
        anonymousPage.request.delete("/api/claims/public", { data: { token: claim.token } })
    ]);
    expect(responses.map((response) => response.status()).sort()).toEqual([200, 404]);
});

test("guests can undo their own claim after reloading without giving cancellation access to other visitors", async ({
    page,
    userData,
    anonymousPage,
    browser
}) => {
    const { list } = await createPublicItem(page, userData.groups[0]);
    await anonymousPage.goto(list.getUrl());
    await anonymousPage.getByRole("button", { name: "Claim", exact: true }).first().click();
    const dialog = anonymousPage.getByRole("dialog");
    await dialog.getByLabel("Email", { exact: true }).fill("guest@example.com");
    await dialog.getByRole("button", { name: "Claim", exact: true }).click();
    await expect(anonymousPage.getByRole("button", { name: "Unclaim", exact: true }).first()).toBeVisible();
    await anonymousPage.reload();
    await expect(anonymousPage.getByRole("button", { name: "Unclaim", exact: true }).first()).toBeVisible();

    const otherVisitor = await browser.newPage();
    try {
        await otherVisitor.goto(anonymousPage.url());
        await expect(otherVisitor.getByRole("button", { name: "Unclaim", exact: true })).toHaveCount(0);
        await expect(otherVisitor.getByRole("button", { name: "Claim", exact: true })).toHaveCount(0);
    } finally {
        await otherVisitor.close();
    }

    await anonymousPage.getByRole("button", { name: "Unclaim", exact: true }).first().click();
    await expect(anonymousPage.getByRole("button", { name: "Claim", exact: true }).first()).toBeVisible();
});

test("a guest cancellation link still works in a browser with a registered session", async ({
    page,
    userData,
    anonymousPage,
    additionalPage
}) => {
    const { list, itemId, groupId } = await createPublicItem(page, userData.groups[0]);
    const claim = await claimAsGuest(anonymousPage.request, list.getId(), itemId, groupId);
    const response = await additionalPage.goto(`/claims/manage?token=${claim.token}`);
    expect(response?.status()).toBe(200);
    expect(response?.headers()["cache-control"]).toBe("no-store");
    await additionalPage.getByRole("button", { name: "Unclaim", exact: true }).click();
    await expect(additionalPage.getByText("Unclaimed item")).toBeVisible();
});

test("a guest token releases only its own reservation", async ({ page, userData, anonymousPage }) => {
    const { list, itemId, groupId } = await createPublicItem(page, userData.groups[0], 2);
    const first = await claimAsGuest(anonymousPage.request, list.getId(), itemId, groupId);
    const second = await claimAsGuest(anonymousPage.request, list.getId(), itemId, groupId);
    expect(first.token).not.toBe(second.token);

    await anonymousPage.goto(list.getUrl());
    await expect(anonymousPage.getByTestId("quantity-claimed").first()).toHaveText("2 claimed");
    const makePrivate = await page.request.post(`/lists/${list.getId()}/manage?/persist`, {
        headers: { Origin: new URL(page.url()).origin },
        form: { name: "Private list" }
    });
    expect(makePrivate.ok()).toBeTruthy();
    const management = await anonymousPage.request.get(`/claims/manage?token=${first.token}`);
    expect(management.status()).toBe(200);
    const managementHtml = await management.text();
    expect(managementHtml).toContain(first.name);
    expect(managementHtml).not.toContain(second.name);
    expect(managementHtml).not.toContain(second.claimId);

    expect((await anonymousPage.request.delete("/api/claims/public", { data: { token: first.token } })).status()).toBe(
        200
    );
    const remaining = await anonymousPage.request.get(`/claims/manage?token=${second.token}`);
    expect(remaining.status()).toBe(200);
    expect((await anonymousPage.request.delete("/api/claims/public", { data: { token: second.token } })).status()).toBe(
        200
    );
});

test("guests can claim and cancel without an email when the group permits it", async ({
    page,
    userData,
    anonymousPage
}) => {
    const { list, itemId, groupId } = await createPublicItem(page, userData.groups[0]);
    const settings = await page.request.post(`/admin/groups/${groupId}/settings`, {
        headers: { Origin: new URL(page.url()).origin },
        form: { allowPublicLists: "true" }
    });
    expect(settings.ok()).toBeTruthy();
    const publicUser = await anonymousPage.request.post("/api/users/public", { data: { groupId } });
    expect(publicUser.ok()).toBeTruthy();
    const { id }: { id: string } = await publicUser.json();
    const response = await anonymousPage.request.put(`/api/lists/${list.getId()}/items/${itemId}/claims`, {
        data: { publicClaimedById: id, quantity: 1 }
    });
    expect(response.ok()).toBeTruthy();
    const { token }: { token: string } = await response.json();
    expect((await anonymousPage.request.delete("/api/claims/public", { data: { token } })).status()).toBe(200);
});
