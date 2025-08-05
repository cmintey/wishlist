import { init } from "@paralleldrive/cuid2";
import type { APIRequestContext, BrowserContext, Page } from "@playwright/test";
import { AdminPage } from "./pageObjects/admin.page";
import { UserMenu } from "./modules/user-menu";
import type { GroupData, UserData } from "./types";

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

export const createUser = async (request: APIRequestContext, existingGroup?: GroupData): Promise<UserData> => {
    const name = randomString();
    const username = randomString();
    const email = username + "@example.com";
    const password = randomString(12);

    const userId = await request
        .put("/api/users", { data: { name, username, email, password } })
        .then((response) => response.json())
        .then(({ id }) => id as string);

    let group: GroupData;
    if (existingGroup) {
        group = existingGroup;
    } else {
        group = await request
            .put("/api/groups", { data: { name: randomString(), createOnly: true } })
            .then((response) => response.json())
            .then(({ group }) => group);
    }

    await request.put(`/api/groups/${group.id}/users/${userId}`, { data: { manager: true } });
    await request.patch(`/api/users/${userId}/groups/${group.id}`, { data: { active: true } });

    return {
        id: userId,
        name,
        username,
        email,
        password,
        groups: [group]
    };
};
