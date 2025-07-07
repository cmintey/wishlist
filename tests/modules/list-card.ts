import { expect, type Locator } from "@playwright/test";
import { ListPage } from "../pageObjects/list.page";

export class ListCard {
    private readonly card: Locator;
    private readonly name: Locator;
    private readonly owner: Locator;

    constructor(card: Locator) {
        this.card = card;
        this.name = card.getByTestId("list-name");
        this.owner = card.getByTestId("list-owner");
    }

    async assertName(name: string) {
        await expect(this.name).toHaveText(name);
    }

    async assertOwner(name: string) {
        await expect(this.owner).toHaveText(name);
    }

    async click() {
        const name = await this.getName();
        expect(name).not.toBeNull();
        await this.card.click();
        return new ListPage(this.card.page(), { name: name! });
    }

    async getName() {
        return this.name.textContent();
    }
}
