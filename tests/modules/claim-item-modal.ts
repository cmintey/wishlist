import { type Locator, type Page } from "@playwright/test";

export class ClaimItemModal {
    private readonly modal: Locator;
    private readonly quantityField: Locator;
    private readonly claimButton: Locator;

    constructor(page: Page) {
        this.modal = page.getByRole("dialog");
        this.quantityField = this.modal.getByLabel("Enter the quantity to claim");
        this.claimButton = this.modal.getByRole("button", { name: "Claim" });
    }

    async at() {
        await this.modal.waitFor({ state: "visible", timeout: 5000 });
        return this;
    }

    async setQuantity(quantity: number) {
        await this.quantityField.fill(quantity.toString());
        return this;
    }

    async submit() {
        await this.claimButton.click();
        await this.modal.waitFor({ state: "detached", timeout: 5000 });
    }
}
