import { init } from "@paralleldrive/cuid2";
import type { Browser, BrowserContext, Page } from "@playwright/test";
import { AdminPage } from "./pageObjects/admin.page";
import { UserMenu } from "./modules/user-menu";
import type { UserData } from "./types";
import { SignupPage } from "./pageObjects/signup.page";

export class ExtraUser {
    private readonly context: BrowserContext;
    private readonly page: Page;
    private readonly userData: UserData;

    constructor(context: BrowserContext, page: Page, userData: UserData) {
        this.context = context;
        this.page = page;
        this.userData = userData;
    }

    getUserData() {
        return this.userData;
    }

    getPage() {
        return this.page;
    }

    async cleanup() {
        await this.page.close();
        await this.context.close();
    }
}

export const randomString = (length = 8) => init({ length })();

export const addAdminToGroup = async (pageWithAdminContext: Page, groupName: string) => {
    const adminPage = new AdminPage(pageWithAdminContext);
    await adminPage.goto();
    const groupPage = await adminPage.navigateToGroup(groupName);
    await groupPage.addMember("Admin");
    await adminPage.goto();
};

export const addUserToGroup = async (pageWithGroupManagerContext: Page, userName: string) => {
    const previousUrl = pageWithGroupManagerContext.url();
    const userMenu = new UserMenu(pageWithGroupManagerContext);
    const groupSettingsPage = await userMenu.manageGroup();
    await groupSettingsPage.at();
    await groupSettingsPage.addMember(userName);
    await pageWithGroupManagerContext.goto(previousUrl);
};

export const createUser = async (browser: Browser) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const signupPage = new SignupPage(page);
    await signupPage.goto();
    const userData = await signupPage.createAccount();
    return new ExtraUser(context, page, userData);
};
