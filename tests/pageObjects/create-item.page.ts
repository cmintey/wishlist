import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { ItemForm } from "../modules/item-form";

interface Props {
    listId?: string;
}

export class CreateItemPage extends BasePage {
    private readonly header: Locator;
    private readonly itemForm: ItemForm;
    private readonly createButton: Locator;
    private readonly createAndStayButton: Locator;
    private readonly approvalRequiredAlert: Locator;

    constructor(page: Page, props?: Props) {
        const listId = props?.listId ?? new URL(page.url()).pathname.split("/").at(-2);
        super(page, `/lists/${listId}/create-item`);
        this.header = page.getByRole("heading", { name: "Create Wish" });
        this.itemForm = new ItemForm(page);
        this.createButton = page.getByRole("button", { name: "Create item" });
        this.createAndStayButton = page.getByRole("button", { name: "Create and add another" });
        this.approvalRequiredAlert = page.getByText("Heads up!");
    }

    async at() {
        await expect(this.header).toBeVisible();
    }

    async getForm() {
        return this.itemForm;
    }

    async create() {
        await this.createButton.click();
    }

    async createAndStay() {
        await this.createAndStayButton.click();
    }

    async assertApprovalRequiredAlert() {
        await expect(this.approvalRequiredAlert).toBeVisible();
    }
}
