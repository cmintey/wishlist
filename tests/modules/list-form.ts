import { type Locator, type Page } from "@playwright/test";

export class ListForm {
    private readonly createButton: Locator;
    private readonly saveButton: Locator;
    private readonly deleteButton: Locator;
    private readonly cancelButton: Locator;
    private readonly nameField: Locator;
    // TODO: Add the other list options

    constructor(page: Page) {
        this.createButton = page.getByRole("button", { name: "Create" });
        this.saveButton = page.getByRole("button", { name: "Save" });
        this.deleteButton = page.getByRole("button", { name: "Delete" });
        this.cancelButton = page.getByRole("button", { name: "Cancel" });
        this.nameField = page.getByLabel("Name", { exact: true });
    }

    async setName(name: string) {
        await this.nameField.fill(name);
    }

    async getName() {
        return this.nameField.inputValue();
    }

    async create(name?: string) {
        if (name) await this.setName(name);
        await this.createButton.click();
    }

    async save() {
        return this.saveButton.click();
    }

    async delete() {
        return this.deleteButton.click();
    }

    async cancel() {
        await this.cancelButton.click();
    }
}
