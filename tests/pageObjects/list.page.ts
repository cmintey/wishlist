import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { ManageListPage } from "./manage-list.page";
import { CreateItemPage } from "./create-item.page";
import { ItemCard } from "../modules/item-card";

interface Props {
    id?: string;
    name: string;
}

export class ListPage extends BasePage {
    private readonly id: string;
    private readonly name: string;
    private readonly header: Locator;
    private readonly manageButton: Locator;
    private readonly shareListButton: Locator;
    private readonly copyToClipboardButton: Locator;
    private readonly publicUrlLink: Locator;
    private readonly createItemButton: Locator;
    private readonly approvalsContainer: Locator;
    private readonly itemsContainer: Locator;
    private readonly noItemsText: Locator;

    constructor(page: Page, props: Props) {
        const id = props.id ?? new URL(page.url()).pathname.split("/").at(-1);
        super(page, `/lists/${id}`);
        this.id = id!;
        this.name = props.name;
        this.header = page.getByRole("heading", { name: props.name });
        this.manageButton = page.getByRole("button", { name: "Manage" });
        this.shareListButton = page.getByRole("button", { name: "Share List" });
        this.copyToClipboardButton = page.getByRole("button", { name: "Copy to clipboard" });
        this.publicUrlLink = page.getByRole("link", { name: "Public URL" });
        this.createItemButton = page.getByRole("button", { name: "add item" });
        this.noItemsText = page.getByText("No wishes yet");
        this.approvalsContainer = page.getByTestId("approvals-container");
        this.itemsContainer = page.getByTestId("items-container");
    }

    async at() {
        await expect(this.header).toBeVisible();
        return this;
    }

    getUrl() {
        return `/lists/${this.id}`;
    }

    getId() {
        return this.id;
    }

    async waitForNavigate() {
        await this.page.waitForURL(this.getUrl(), { waitUntil: "load" });
        return this;
    }

    async manage() {
        await this.manageButton.click();
        return new ManageListPage(this.page);
    }

    async getShareListButton() {
        return this.shareListButton;
    }

    async assertShareFunctionality() {
        await this.shareListButton.click();
        await expect(this.publicUrlLink).toBeVisible();
        await expect(this.copyToClipboardButton).toBeVisible();
        expect(await this.publicUrlLink.getAttribute("href")).toContain(this.getUrl());
    }

    async assertNoItems() {
        await expect(this.noItemsText).toBeVisible();
        await expect(this.itemsContainer).not.toBeVisible();
    }

    async createItem() {
        await this.createItemButton.click();
        return new CreateItemPage(this.page, { listId: this.id });
    }

    async assertCreateItemNotAvailable() {
        await expect(this.createItemButton).not.toBeVisible();
    }

    async getItemAt(index: number) {
        return new ItemCard(this.itemsContainer.locator("div.card").nth(index));
    }

    async getItemForApprovalAt(index: number) {
        return new ItemCard(this.approvalsContainer.locator("div.card").nth(index));
    }
}
