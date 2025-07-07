import { expect, type Locator, type Page } from "@playwright/test";
import { Modal } from "./modal";

export class AddMemberModal extends Modal {
    private readonly searchInput: Locator;
    private readonly searchResultsContainer: Locator;

    constructor(page: Page) {
        super(page, { submitButtonText: "Add User" });
        this.searchInput = page.getByLabel("Search");
        this.searchResultsContainer = page.getByRole("listbox");
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
