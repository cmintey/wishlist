import { test as base, type Page as BasePage, type Browser, type BrowserContext } from "@playwright/test";
import { adminAuthFile } from "../constants";
import type { GroupData, UserData } from "../types";
import { createUser } from "../util";

interface Fixtures {
    adminPage: BasePage;
    anonymousPage: BasePage;
    page: BasePage;
    userData: UserData;
    additionalUserData: UserData;
    additionalPage: BasePage;
    userFactory: UserFactory;
    _testCleanup: undefined;
}

type UserPageData = {
    user: UserData;
    page: BasePage;
};

type MultiUserPageData = {
    groupOwner: UserPageData;
    groupUser: UserPageData;
};

type CreateUserPageOpts = {
    group?: GroupData;
};

class UserFactory {
    private readonly browser: Browser;
    private readonly baseURL: string;

    private adminContext: BrowserContext | undefined;
    private adminPage: BasePage | undefined;
    private contexts: BrowserContext[] = [];

    constructor(browser: Browser, baseURL: string) {
        this.browser = browser;
        this.baseURL = baseURL;
    }

    public async createUserPage(opts?: CreateUserPageOpts): Promise<UserPageData> {
        return test.step("create user page", async () => {
            const userData = await this.getAdminPage().then((adminPage) => createUser(adminPage.request, opts?.group));

            const context = await this.browser.newContext();
            this.contexts.push(context);

            const page = await context.newPage();
            await page.request.post("/login", {
                form: { username: userData.username, password: userData.password },
                headers: {
                    Origin: this.baseURL!
                }
            });
            await page.goto("/");

            return { user: userData, page };
        });
    }

    public async createMultiUserPages(): Promise<MultiUserPageData> {
        const groupOwner = await this.createUserPage();
        const groupUser = await this.createUserPage({ group: groupOwner.user.groups[0] });
        return { groupOwner, groupUser };
    }

    public async getAdminPage() {
        if (this.adminPage) {
            return this.adminPage;
        }
        return test.step("create admin context", async () => {
            this.adminContext = await this.browser.newContext({ storageState: adminAuthFile });
            this.adminPage = await this.adminContext.newPage();
            return this.adminPage;
        });
    }

    public async cleanup() {
        for (const context of this.contexts) {
            await context.close();
        }
        await this.adminContext?.close();
    }
}

export const test = base.extend<Fixtures>({
    userFactory: async ({ browser, baseURL }, use) => {
        const factory = new UserFactory(browser, baseURL!);
        await use(factory);
        await factory.cleanup();
    },
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
