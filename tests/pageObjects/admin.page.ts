import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { GroupSettingsPage } from "./group-settings.page";

export class AdminPage extends BasePage {
    private readonly header: Locator;
    private readonly usersTab: Locator;
    private readonly groupsTab: Locator;
    private readonly settingsTab: Locator;
    private readonly actionsTab: Locator;
    private readonly aboutTab: Locator;

    constructor(page: Page) {
        super(page, "/admin");
        this.header = page.getByRole("heading", { name: "Administration" });
        this.usersTab = page.locator(".tab-label", { hasText: "Users" });
        this.groupsTab = page.locator(".tab-label", { hasText: "Groups" });
        this.settingsTab = page.locator(".tab-label", { hasText: "Settings" });
        this.actionsTab = page.locator(".tab-label", { hasText: "Actions" });
        this.aboutTab = page.locator(".tab-label", { hasText: "About" });
    }

    async at() {
        await expect(this.header).toBeVisible();
    }

    async clickUsersTab() {
        await this.usersTab.click();
    }

    async clickGroupsTab() {
        await this.groupsTab.click();
    }

    async clickSettingsTab() {
        await this.settingsTab.click();
    }

    async clickActionsTab() {
        await this.actionsTab.click();
    }

    async clickAboutTab() {
        await this.aboutTab.click();
    }

    async clickTableItem(text: string) {
        const gridCell = this.page.getByRole("gridcell", { name: text });
        await expect(gridCell).toBeVisible();
        await gridCell.click();
    }

    async navigateToGroup(name: string) {
        await this.clickGroupsTab();
        await this.clickTableItem(name);
        return new GroupSettingsPage(this.page, { name });
    }
}
