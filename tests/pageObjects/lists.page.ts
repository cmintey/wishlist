import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { ListCard } from "../modules/list-card";
import { CreateListPage } from "./create-list.page";

export class ListsPage extends BasePage {
    private readonly header: Locator;
    private readonly createButton: Locator;
    private readonly listContainer: Locator;
    private readonly listItems: Locator;
    // TODO: Filter module

    constructor(page: Page) {
        super(page, "/lists");
        this.header = page.getByRole("heading", { name: "Lists" });
        this.createButton = page.getByRole("button", { name: "Create List" });
        this.listContainer = page.getByTestId("list-container");
        this.listItems = this.listContainer.locator("a.card");
    }

    async at() {
        await expect(this.header).toBeVisible();
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
        const list = this.listItems.filter({ hasText: name });
        await expect(list).toBeVisible();
        return new ListCard(list);
    }
}
