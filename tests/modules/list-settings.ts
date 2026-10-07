import type { Locator, Page } from "@playwright/test";

export class ListSettings {
    private readonly page: Page;
    private readonly allowPublicListsCheckbox: Locator;
    private readonly showForListOwnerCheckbox: Locator;

    constructor(page: Page) {
        this.page = page;
        this.allowPublicListsCheckbox = page.getByLabel("Allow Public Lists");
        this.showForListOwnerCheckbox = page.getByLabel("Show for list owner");
    }

    async allowPublicLists() {
        await this.allowPublicListsCheckbox.check();
    }

    async setShowForListOwner(value = true) {
        await this.showForListOwnerCheckbox.setChecked(value);
    }
}
