import type { Locator, Page } from "@playwright/test";

export class ListSettings {
    private readonly page: Page;
    private readonly allowPublicListsCheckbox: Locator;

    constructor(page: Page) {
        this.page = page;
        this.allowPublicListsCheckbox = page.getByLabel("Allow Public Lists");
    }

    async allowPublicLists() {
        await this.allowPublicListsCheckbox.check();
    }
}
