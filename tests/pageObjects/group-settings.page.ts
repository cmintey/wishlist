import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { AddMemberModal } from "../modules/add-member-modal";

interface Props {
    name: string;
    id?: string;
}

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
    }

    async at() {
        await expect(this.header).toBeVisible();
    }

    async clickMembersTab() {
        await this.membersTab.click();
    }

    async clickSettingsTab() {
        await this.settingsTab.click();
    }

    async addMember(name: string) {
        await this.clickMembersTab();
        await this.addMemberButton.click();
        const modal = new AddMemberModal(this.page);
        await modal.searchAndSelect(name);
    }
}
