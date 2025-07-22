import { expect, type Locator } from "@playwright/test";
import { ListPage } from "../pageObjects/list.page";

export class ListCard {
    private readonly card: Locator;
    private readonly name: Locator;
    private readonly owner: Locator;
    private readonly itemCount: Locator;

    constructor(card: Locator) {
        this.card = card;
        this.name = card.getByTestId("list-name");
        this.owner = card.getByTestId("list-owner");
        this.itemCount = card.getByTestId("item-count");
    }

    async assertName(name: string) {
        await expect(this.name).toHaveText(name);
        return this;
    }

    async assertOwner(name: string) {
        await expect(this.owner).toHaveText(name);
        return this;
    }

    async assertItemCount(count: number) {
        await expect(this.itemCount).toHaveText(count.toString());
        return this;
    }

    async click() {
        const name = await this.getName();
        expect(name).not.toBeNull();
        const owner = await this.owner.textContent();
        const listPageName = name === `${owner}'s Wishes` ? "My Wishes" : name!;
        await this.card.click();
        await this.card.page().waitForURL(/\/lists\/.*/);
        return new ListPage(this.card.page(), { name: listPageName });
    }

    async getName() {
        const name = await this.name.textContent();
        expect(name).not.toBeNull();
        return name!;
    }
}
