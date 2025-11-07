import { expect, type Locator, type Page } from "@playwright/test";
import { Modal } from "./modal";

export class DeleteItemModal extends Modal {
    private readonly allListsButton: Locator;
    private readonly thisListButton: Locator;

    constructor(page: Page) {
        super(page, { modalName: "Please Confirm", submitButtonText: "Confirm" });
        this.allListsButton = page.getByRole("button", { name: "All lists" });
        this.thisListButton = page.getByRole("button", { name: "This list" });
    }

    async allLists() {
        await expect(this.modal).toBeVisible();
        await this.allListsButton.click();
    }

    async thisList() {
        await expect(this.modal).toBeVisible();
        await this.thisListButton.click();
    }

    async assertAllListsVisible() {
        await expect(this.modal).toBeVisible();
        await expect(this.allListsButton).toBeVisible();
        return this;
    }

    async assertAllListsNotVisible() {
        await expect(this.modal).toBeVisible();
        await expect(this.allListsButton).not.toBeVisible();
        return this;
    }

    async assertThisListsVisible() {
        await expect(this.modal).toBeVisible();
        await expect(this.thisListButton).toBeVisible();
        return this;
    }

    async assertThisListsNotVisible() {
        await expect(this.modal).toBeVisible();
        await expect(this.thisListButton).not.toBeVisible();
        return this;
    }
}
