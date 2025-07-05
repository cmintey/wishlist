import { expect, type Locator, type Page } from "@playwright/test";

export class Modal {
    protected readonly page: Page;
    protected readonly modal: Locator;
    private readonly modalHeader: Locator;
    private readonly cancelButton: Locator;
    private readonly submitButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.modal = page.getByRole("dialog");
        this.modalHeader = this.modal.getByRole("heading");
        this.cancelButton = this.modal.getByRole("button", { name: "Cancel" });
        this.submitButton = this.modal.getByRole("button", { name: "Submit" });
    }

    async assertTitle(title: string) {
        await expect(this.modal).toBeVisible();
        await expect(this.modalHeader).toHaveText(title);
    }

    async cancel() {
        await expect(this.modal).toBeVisible();
        await this.cancelButton.click();
    }

    async submit() {
        await expect(this.modal).toBeVisible();
        await this.submitButton.click();
    }
}
