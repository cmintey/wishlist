import { expect, type Locator, type Page } from "@playwright/test";
import { AddManagerModal } from "./add-manager-modal";

export class ListManagersSelector {
    private readonly page: Page;
    private readonly field: Locator;
    private readonly list: Locator;
    private readonly addButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.field = page.getByRole("group", { name: "List managers" });
        this.list = this.field.getByTestId("list-managers-list");
        this.addButton = this.field.getByRole("button", { name: "Add manager" });
    }

    async getManagers() {
        return this.list.locator(`[data-part="name"]`).allTextContents();
    }

    async expectNoManagers() {
        return expect(this.list.getByText("No managers")).toBeVisible();
    }

    async removeManager(name: string) {
        await this.list.getByRole("button", { name: `Remove ${name}` }).click();
        return this;
    }

    async addManager(name: string) {
        await this.addButton.click();
        const modal = new AddManagerModal(this.page);
        await modal.searchAndSelect(name);
        return this;
    }
}
