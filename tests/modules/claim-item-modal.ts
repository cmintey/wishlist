import { type Locator, type Page } from "@playwright/test";
import { Modal } from "./modal";

export class ClaimItemModal extends Modal {
    private readonly quantityField: Locator;
    private readonly claimButton: Locator;

    constructor(page: Page) {
        super(page, { submitButtonText: "Claim" });
        this.quantityField = this.modal.getByLabel("Enter the quantity to claim");
        this.claimButton = this.modal.getByRole("button", { name: "Claim" });
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
