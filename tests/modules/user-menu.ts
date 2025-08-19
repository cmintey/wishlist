import { expect, type Locator, type Page } from "@playwright/test";
import { CreateGroupModal } from "./create-group-modal";
import { GroupSettingsPage } from "../pageObjects/group-settings.page";
import { ChangeGroupModal } from "./change-group-modal";

export class UserMenu {
    private readonly page: Page;
    private readonly avatarButton: Locator;
    private readonly navList: Locator;
    private readonly accountButton: Locator;
    private readonly adminButton: Locator;
    private readonly manageGroupButton: Locator;
    private readonly changeGroupButton: Locator;
    private readonly createGroupButton: Locator;
    private readonly signOutButton: Locator;
    private readonly lightSwitch: Locator;

    constructor(page: Page) {
        this.page = page;
        this.avatarButton = page.getByRole("button", { name: "User Menu" });
        this.navList = page.getByTestId("user menu navigation");
        this.accountButton = page.getByRole("link", { name: "Account" });
        this.adminButton = page.getByRole("link", { name: "Admin", exact: true });
        this.manageGroupButton = page.getByRole("button", { name: "Manage Group" });
        this.changeGroupButton = page.getByRole("button", { name: "Change Group" });
        this.createGroupButton = page.getByRole("button", { name: "Create Group" });
        this.signOutButton = page.getByRole("button", { name: "Sign Out" });
        this.lightSwitch = page.getByRole("switch", { name: "Light Switch" });
    }

    async isVisible() {
        await expect(this.avatarButton).toBeVisible();
    }

    async open() {
        await this.avatarButton.click();
        await expect(this.navList).toBeVisible();
    }

    async close() {
        if (await this.navList.isVisible()) {
            await this.avatarButton.click();
            await expect(this.navList).toBeVisible();
        }
    }

    async gotoAccount() {
        await this.open();
        await this.accountButton.click();
    }

    async manageGroup() {
        await this.open();
        await this.manageGroupButton.click();
        await this.page.waitForURL(/admin\/groups\/.*/);
        return new GroupSettingsPage(this.page);
    }

    async changeGroup(name: string) {
        await this.open();
        await this.changeGroupButton.click();
        const changeGroupModal = new ChangeGroupModal(this.page);
        await changeGroupModal.selectGroup(name);
    }

    async createGroup(name?: string) {
        await this.open();
        await this.createGroupButton.click();
        const createGroupModal = new CreateGroupModal(this.page);
        return await createGroupModal.createGroup(name);
    }

    async signOut() {
        await this.open();
        await this.signOutButton.click();
    }

    async toggleLightSwitch() {
        await this.open();
        await this.lightSwitch.click();
    }

    async navigateToAdmin() {
        await this.open();
        await this.adminButton.click();
    }

    async assertAdminButtonVisible() {
        await this.open();
        await expect(this.adminButton).toBeVisible();
        await this.close();
    }

    async assertAdminButtonNotVisible() {
        await this.open();
        await expect(this.adminButton).not.toBeVisible();
        await this.close();
    }
}
