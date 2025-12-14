import { expect, type Locator, type Page } from "@playwright/test";

export class Toast {
    private readonly page: Page;
    private readonly toast: Locator;
    private readonly dismissToastButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.toast = page.getByTestId("toast");
        this.dismissToastButton = this.toast.getByRole("button", { name: "Dismiss toast" });
    }

    async waitForToastWithText(text: string) {
        await expect(this.toast.filter({ hasText: new RegExp(text) })).toBeVisible();
        return this;
    }

    async dismissToast() {
        await this.dismissToastButton.click();
    }
}
