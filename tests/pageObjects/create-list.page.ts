import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { ListForm } from "../modules/list-form";

export class CreateListPage extends BasePage {
    private readonly header: Locator;
    private readonly listForm: ListForm;

    constructor(page: Page) {
        super(page, "/lists/create");
        this.header = page.getByRole("heading", { name: "Create List" });
        this.listForm = new ListForm(page);
    }

    async at() {
        await expect(this.header).toBeVisible();
        return this;
    }

    async createDefault() {
        await this.listForm.create();
        await expect(this.page.getByRole("heading", { name: "My Wishes" })).toBeVisible();
    }

    async create(name: string) {
        await this.listForm.create(name);
        await expect(this.page.getByRole("heading", { name })).toBeVisible();
    }

    async cancel() {
        return this.listForm.cancel();
    }
}
