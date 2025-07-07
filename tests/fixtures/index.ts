import { test as base, expect, type Page as BasePage } from "@playwright/test";
import { adminAuthFile } from "../constants";
import { UserMenu } from "../modules/user-menu";
import { SignupPage } from "../pageObjects/signup.page";
import type { UserData } from "../types";
import { SigninPage } from "../pageObjects/signin.page";

interface UserPage extends BasePage {
    groupName: string;
}

interface Fixtures {
    adminPage: BasePage;
    anonymousPage: BasePage;
    page: UserPage;
    userData: UserData;
}

export const test = base.extend<Fixtures>({
    adminPage: async ({ browser }, use) => {
        const context = await browser.newContext({ storageState: adminAuthFile });
        await use(await context.newPage());
        await context.close();
    },
    anonymousPage: async ({ browser }, use) => {
        await use(await browser.newPage());
    },
    userData: async ({ browser }, use) => {
        const page = await browser.newPage();
        const signupPage = new SignupPage(page);
        await signupPage.goto();
        const userData = await signupPage.createAccount();
        await page.close();
        await use(userData);
    },
    page: async ({ page, userData }, use) => {
        const loginPage = new SigninPage(page);
        await loginPage.goto();
        await loginPage.login(userData);
        const userMenu = new UserMenu(page);
        const groupName = await userMenu.createGroup();
        await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible();
        Object.assign(page, { groupName });
        await use(page);
    }
});
export { expect } from "@playwright/test";
