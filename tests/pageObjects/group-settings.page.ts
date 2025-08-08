import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { AddMemberModal } from "../modules/add-member-modal";
import { ListSettings } from "../modules/list-settings";
import { Toast } from "../modules/toast";
import { SuggestionsSettings } from "../modules/suggestions-settings";

interface Props {
    name: string;
    id?: string;
}

type WishlistMode = "standard" | "registry";

export class GroupSettingsPage extends BasePage {
    private readonly header: Locator;
    private readonly groupNameHeader: Locator;
    private readonly editNameButton: Locator;
    private readonly membersTab: Locator;
    private readonly settingsTab: Locator;
    private readonly addMemberButton: Locator;
    private readonly inviteUserButton: Locator;
    private readonly deleteButton: Locator;
    private readonly clearListsButton: Locator;
    private readonly clearClaimedItemsButton: Locator;
    private readonly suggestionsSettings: SuggestionsSettings;
    private readonly wishlistModeDropdown: Locator;
    private readonly saveSettingsButton: Locator;

    constructor(page: Page, props?: Props) {
        const id = props?.id ?? new URL(page.url()).pathname.split("/").at(-1);
        super(page, `/admin/groups/${id}`);
        this.header = page.getByRole("heading", { name: "Group Settings" });
        this.groupNameHeader = page.getByRole("heading", { level: 2, name: props?.name });
        this.editNameButton = page.getByRole("button", { name: "edit group name" });
        this.membersTab = page.locator(".tab-label", { hasText: "Members" });
        this.settingsTab = page.locator(".tab-label", { hasText: "Settings" });
        this.addMemberButton = page.getByRole("button", { name: "Add Member" });
        this.inviteUserButton = page.getByRole("button", { name: "Invite User" });
        this.deleteButton = page.getByRole("button", { name: "Delete Group" });
        this.clearListsButton = page.getByRole("button", { name: "Clear Lists" });
        this.clearClaimedItemsButton = page.getByRole("button", { name: "Clear Claimed Items" });
        this.suggestionsSettings = new SuggestionsSettings(page);
        this.wishlistModeDropdown = page.getByLabel("Wishlist Mode");
        this.saveSettingsButton = page.getByRole("button", { name: "Save", exact: true });
    }

    async at() {
        await expect(this.header).toBeVisible();
    }

    async clickMembersTab() {
        await this.membersTab.click();
        return this;
    }

    async clickSettingsTab() {
        await this.settingsTab.click();
        return this;
    }

    async allowPublicLists() {
        await this.clickSettingsTab();
        const listSettings = new ListSettings(this.page);
        await listSettings.allowPublicLists();
        return this.saveSettings();
    }

    async addMember(name: string) {
        await this.clickMembersTab();
        await this.addMemberButton.click();
        const modal = new AddMemberModal(this.page);
        await modal.searchAndSelect(name);
    }

    async getSuggestionsSettings() {
        return this.suggestionsSettings;
    }

    async changeWishlistMode(mode: WishlistMode) {
        await this.wishlistModeDropdown.selectOption(mode);
        await this.saveSettings();
        return this;
    }

    async saveSettings() {
        await this.saveSettingsButton.click();
        await new Toast(this.page).waitForToastWithText("Settings saved successfully");
        return this;
    }
}
