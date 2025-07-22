import { expect, type Locator, type Page } from "@playwright/test";

export class Toast {
    private readonly page: Page;
    private readonly toast: Locator;

    constructor(page: Page) {
        this.page = page;
        this.toast = page.getByTestId("toast");
    }

    async waitForToastWithText(text: string) {
        await expect(this.toast.filter({ hasText: new RegExp(text) })).toBeVisible();
    }
}
