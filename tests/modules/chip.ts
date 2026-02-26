import { expect, type Locator, type Page } from "@playwright/test";

export class Chip {
    protected readonly page: Page;
    private readonly triggerButton: Locator;

    constructor(page: Page, testId: string) {
        this.page = page;
        this.triggerButton = page.getByTestId(testId).getByRole("button").first();
    }

    async open() {
        await this.triggerButton.click();
        const dropdown = await this.getDropdown();
        await expect(dropdown).toBeVisible();
    }

    async selectOption(text: string) {
        const dropdown = await this.getDropdown();
        const option = dropdown.getByText(text);
        await expect(option).toBeVisible();
        await option.click();
    }

    async applyFilter() {
        const dropdown = await this.getDropdown();
        const applyButton = dropdown.getByText("Apply");
        await applyButton.click();
        await this.page.waitForTimeout(200);
    }

    private async getDropdown() {
        const id = await this.triggerButton.getAttribute("id");
        if (!id) {
            throw new Error("Couldn't find dropdown for chip");
        }
        const idParts = id.split(":");
        return this.page.locator(`#popover\\:${idParts[1]}\\:content`);
    }
}
