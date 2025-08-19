import type { Locator, Page } from "@playwright/test";

export type Method = "surprise" | "auto-approval" | "approval";

export class SuggestionsSettings {
    private readonly enableCheckbox: Locator;
    private readonly methodDropdown: Locator;

    constructor(page: Page) {
        const suggestionsSection = page.getByRole("region", { name: "Suggestions" });
        this.enableCheckbox = suggestionsSection.getByLabel("Enable");
        this.methodDropdown = suggestionsSection.getByLabel("Suggestion Method");
    }

    async enable() {
        await this.enableCheckbox.check();
        return this;
    }

    async disable() {
        await this.enableCheckbox.uncheck();
        return this;
    }

    async selectMethod(method: Method) {
        await this.methodDropdown.selectOption(method);
        return this;
    }
}
