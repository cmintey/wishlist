import { expect, type Locator } from "@playwright/test";

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
    // TODO: add buttons

    constructor(card: Locator) {
        this.card = card;
        this.name = card.locator("header.card-header");
        this.image = card.getByRole("img");
        this.price = card.getByTestId("price");
        this.quantity = card.getByTestId("quantity");
        this.quantityDesired = card.getByTestId("quantity-desired");
        this.quantityClaimed = card.getByTestId("quantity-claimed");
        this.addedBy = card.getByTestId("added-by");
        this.notes = card.getByTestId("notes");
    }

    async assertDefaultImage() {
        await expect(this.image).toHaveAccessibleName("default item image");
    }
}
