import { expect, type Locator } from "@playwright/test";
import { EditItemPage } from "../pageObjects/edit-item.page";
import { Modal } from "./modal";

export class ItemCard {
    private readonly card: Locator;
    private readonly name: Locator;
    private readonly image: Locator;
    private readonly price: Locator;
    private readonly quantity: Locator;
    private readonly quantityDesired: Locator;
    private readonly quantityClaimed: Locator;
    private readonly addedBy: Locator;
    private readonly notes: Locator;
    private readonly editButton: Locator;
    private readonly deleteButton: Locator;

    constructor(card: Locator) {
        this.card = card;
        this.name = card.getByTestId("name");
        this.image = card.getByTestId("image");
        this.price = card.getByTestId("price");
        this.quantity = card.getByTestId("quantity");
        this.quantityDesired = card.getByTestId("quantity-desired");
        this.quantityClaimed = card.getByTestId("quantity-claimed");
        this.addedBy = card.getByTestId("added-by");
        this.notes = card.getByTestId("notes");
        this.editButton = card.getByRole("button", { name: "Edit" });
        this.deleteButton = card.getByRole("button", { name: "Delete" });
    }

    async assertDefaultImage() {
        await expect(this.image).toHaveAccessibleName("default item image");
        return this;
    }

    async assertHasLink() {
        await expect(this.name).toHaveRole("link");
        return this;
    }

    async assertNoLink() {
        await expect(this.name).not.toHaveRole("link");
        return this;
    }

    async assertName(name: string) {
        await expect(this.name).toHaveText(name);
        return this;
    }

    async assertHasImage() {
        await expect(this.image).toHaveAttribute("src");
        return this;
    }

    async assertPrice(price: string) {
        await expect(this.price).toHaveText(price);
        return this;
    }

    async assertNoPrice() {
        await expect(this.price).not.toBeVisible({ timeout: 100 });
        return this;
    }

    async assertNoQuantity() {
        await expect(this.quantity).not.toBeVisible({ timeout: 100 });
        return this;
    }

    async assertDesiredQuantity(quantity: number) {
        await expect(this.quantityDesired).toHaveText(`${quantity} desired`);
        return this;
    }

    async assertClaimedQuantity(quantity: number) {
        await expect(this.quantityClaimed).toHaveText(`${quantity} claimed`);
        return this;
    }

    async assertClaimedQuantityHidden() {
        await expect(this.quantityClaimed).not.toBeVisible({ timeout: 100 });
        return this;
    }

    async assertAddedBy(addedBy: string) {
        await expect(this.addedBy).toHaveText(`Added by ${addedBy}`);
        return this;
    }

    async assertNotes(notes: string) {
        await expect(this.notes).toHaveText(notes);
        return this;
    }

    async assertNoNotes() {
        await expect(this.notes).not.toBeVisible({ timeout: 100 });
        return this;
    }

    async edit() {
        await this.editButton.click();
        await this.card.page().waitForURL(/\/items\/\d+\/edit/);
        return new EditItemPage(this.card.page());
    }

    async delete() {
        await this.deleteButton.click();
        const modal = new Modal(this.card.page(), { modalName: "Please Confirm", submitButtonText: "Confirm" });
        await modal.submit();
    }
}
