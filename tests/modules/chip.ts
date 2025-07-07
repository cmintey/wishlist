import { expect, type Locator, type Page } from "@playwright/test";

export class Chip {
    protected readonly page: Page;
    private readonly triggerButton: Locator;
    private readonly dropdown: Locator;
    private readonly applyButton: Locator;

    constructor(page: Page, testId: string) {
        this.page = page;
        const chipContainer = page.getByTestId(testId);
        this.triggerButton = chipContainer.getByRole("button").first();
        this.dropdown = chipContainer.getByRole("navigation");
        this.applyButton = chipContainer.getByRole("button", { name: "Apply" });
    }

    async open() {
        await this.triggerButton.click();
        await expect(this.dropdown).toBeVisible();
    }

    async selectOption(text: string) {
        const option = this.dropdown.getByText(text);
        await expect(option).toBeVisible();
        await option.click();
    }

    async applyFilter() {
        await this.applyButton.click();
        await this.page.waitForTimeout(200);
    }
}
