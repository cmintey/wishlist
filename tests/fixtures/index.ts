import { test as base, type Page as BasePage } from "@playwright/test";
import { adminAuthFile } from "../constants";
import type { UserData } from "../types";
import { createUser } from "../util";

interface Fixtures {
    adminPage: BasePage;
    anonymousPage: BasePage;
    page: BasePage;
    userData: UserData;
    additionalUserData: UserData;
    additionalPage: BasePage;
}

export const test = base.extend<Fixtures>({
    adminPage: async ({ browser }, use) => {
        const context = await browser.newContext({ storageState: adminAuthFile });
        await use(await context.newPage());
        await context.close();
    },
    anonymousPage: async ({ browser }, use) => {
        const page = await browser.newPage();
        await use(page);
        await page.close();
    },
    userData: async ({ adminPage }, use) => {
        const userData = await createUser(adminPage.request);
        await use(userData);
    },
    page: async ({ page, userData, baseURL }, use) => {
        await page.request.post("/login", {
            form: { username: userData.username, password: userData.password },
            headers: {
                Origin: baseURL!
            }
        });
        await page.goto("/");
        await use(page);
    },
    additionalUserData: async ({ adminPage, userData }, use) => {
        const additionalUserData = await createUser(adminPage.request, userData.groups[0]);
        await use(additionalUserData);
    },
    additionalPage: async ({ browser, additionalUserData: userData, baseURL }, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.request.post("/login", {
            form: { username: userData.username, password: userData.password },
            headers: {
                Origin: baseURL!
            }
        });
        await page.goto("/");
        await use(page);
        await context.close();
    }
});
export { expect } from "@playwright/test";
