import type { Page } from "@playwright/test";

export abstract class BasePage {
    protected readonly page: Page;
    protected readonly urlPath: string;

    constructor(page: Page, urlPath: string) {
        this.page = page;
        this.urlPath = urlPath;
    }

    abstract at(): Promise<void>;

    async goto(opts?: { skipAssert: boolean }) {
        await this.page.goto(this.urlPath);
        if (!opts?.skipAssert) await this.at();
        return this;
    }
}
