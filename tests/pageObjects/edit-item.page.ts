import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { ItemForm } from "../modules/item-form";

interface Props {
    itemId?: string;
}

export class EditItemPage extends BasePage {
    private readonly header: Locator;
    private readonly itemForm: ItemForm;
    private readonly saveButton: Locator;

    constructor(page: Page, props?: Props) {
        const itemId = props?.itemId ?? new URL(page.url()).pathname.split("/").at(-2);
        super(page, `/items/${itemId}/edit`);
        this.header = page.getByRole("heading", { name: "Edit Wish" });
        this.itemForm = new ItemForm(page);
        this.saveButton = page.getByRole("button", { name: "Save" });
    }

    async at() {
        await expect(this.header).toBeVisible();
    }

    async getForm() {
        return this.itemForm;
    }

    async save() {
        await this.saveButton.click();
    }
}
