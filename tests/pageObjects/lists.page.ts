import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { ListCard } from "../modules/list-card";
import { CreateListPage } from "./create-list.page";
import { Chip } from "../modules/chip";

export class ListsPage extends BasePage {
    private readonly header: Locator;
    private readonly createButton: Locator;
    private readonly listContainer: Locator;
    private readonly listItems: Locator;
    private readonly listFilterChip: Chip;

    constructor(page: Page) {
        super(page, "/lists");
        this.header = page.getByRole("heading", { name: "Lists" });
        this.createButton = page.getByRole("button", { name: "Create List" });
        this.listContainer = page.getByTestId("list-container");
        this.listItems = this.listContainer.locator("a.card");
        this.listFilterChip = new Chip(page, "list-filter");
    }

    async at() {
        await expect(this.header).toBeVisible();
        return this;
    }

    async create() {
        await this.createButton.click();
        return new CreateListPage(this.page);
    }

    async expectListCount(count: number) {
        await expect(this.listItems).toHaveCount(count);
    }

    async getListCount() {
        return this.listItems.count();
    }

    async getListAt(index: number) {
        const list = this.listItems.nth(index);
        await expect(list).toBeVisible();
        return new ListCard(list);
    }

    async getListByName(name: string) {
        const list = this.listItems.filter({ has: this.page.getByTestId("list-name").filter({ hasText: name }) });
        await expect(list).toBeVisible();
        return new ListCard(list);
    }

    async filterLists(...options: string[]) {
        await this.listFilterChip.open();
        for (const opt of options) {
            await this.listFilterChip.selectOption(opt);
        }
        await this.listFilterChip.applyFilter();
    }

    async clearFilter() {
        await this.listFilterChip.open();
        await this.listFilterChip.selectOption("All");
        await this.listFilterChip.applyFilter();
    }
}
