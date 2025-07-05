import { expect, type Locator, type Page } from "@playwright/test";
import { Modal } from "./modal";
import { randomString } from "../util";

export class CreateGroupModal extends Modal {
    private readonly input: Locator;

    constructor(page: Page) {
        super(page);
        this.input = this.modal.getByRole("textbox");
    }

    async createGroup(name?: string) {
        await expect(this.modal).toBeVisible();
        await this.input.fill(name ?? randomString());
        await this.submit();
        await expect(this.modal).not.toBeVisible();
        await this.page.reload();
    }
}
