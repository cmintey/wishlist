import { expect, type Locator, type Page } from "@playwright/test";
import { Modal } from "./modal";

export class AddManagerModal extends Modal {
    private readonly searchInput: Locator;
    private readonly searchResultsContainer: Locator;

    constructor(page: Page) {
        super(page, { submitButtonText: "Add manager" });
        this.searchInput = this.modal.getByRole("searchbox");
        this.searchResultsContainer = this.modal.getByRole("listbox");
    }

    async searchAndSelect(name: string) {
        await expect(this.modal).toBeVisible();
        await expect(this.searchInput).toBeVisible();
        await this.searchInput.fill(name);
        const result = this.searchResultsContainer.getByRole("option", { name });
        await expect(result).toBeVisible();
        await result.click();
        await this.submit();
    }
}
