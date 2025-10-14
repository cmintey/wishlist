import { expect, type Page } from "@playwright/test";
import { Modal } from "./modal";

export class ChangeGroupModal extends Modal {
    constructor(page: Page) {
        super(page, { submitButtonText: "Change Group" });
    }

    async selectGroup(name: string) {
        await expect(this.modal).toBeVisible();
        await this.modal.getByText(name).click();
        await this.submit();
        await expect(this.modal).not.toBeVisible();
    }
}
