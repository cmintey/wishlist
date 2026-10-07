import { expect, type Locator, type Page } from "@playwright/test";
import { ListManagersSelector } from "./list-managers-selector";

export class ListForm {
    private readonly createButton: Locator;
    private readonly saveButton: Locator;
    private readonly deleteButton: Locator;
    private readonly cancelButton: Locator;
    private readonly nameField: Locator;
    private readonly publicCheckbox: Locator;
    private readonly hideOwnerCheckbox: Locator;
    private readonly notForMeCheckbox: Locator;
    private readonly allowOwnerClaimsCheckbox: Locator;
    private readonly listManagers: ListManagersSelector;

    constructor(page: Page) {
        this.createButton = page.getByRole("button", { name: "Create" });
        this.saveButton = page.getByRole("button", { name: "Save" });
        this.deleteButton = page.getByRole("button", { name: "Delete" });
        this.cancelButton = page.getByRole("button", { name: "Cancel" });
        this.nameField = page.getByLabel("Name", { exact: true });
        this.publicCheckbox = page.getByLabel("Public", { exact: true });
        this.hideOwnerCheckbox = page.getByLabel("Hide Owner", { exact: true });
        this.notForMeCheckbox = page.getByLabel("This list is for someone else", { exact: true });
        this.allowOwnerClaimsCheckbox = page.getByLabel("Allow owner to claim items", { exact: true });
        this.listManagers = new ListManagersSelector(page);
    }

    async setName(name: string) {
        await this.nameField.fill(name);
    }

    async setHideOwner(value = true) {
        await this.hideOwnerCheckbox.setChecked(value);
    }

    async getName() {
        return this.nameField.inputValue();
    }

    async create(name?: string) {
        if (name) await this.setName(name);
        await this.createButton.click();
    }

    async makePublic() {
        await this.publicCheckbox.check();
        await this.save();
    }

    async setNotForMe(value = true) {
        await this.notForMeCheckbox.setChecked(value);
    }

    async setAllowOwnerClaims(value = true) {
        await this.allowOwnerClaimsCheckbox.setChecked(value);
    }

    async assertAllowOwnerClaimsDisabled() {
        await expect(this.allowOwnerClaimsCheckbox).toBeDisabled();
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

    getListManagers() {
        return this.listManagers;
    }
}
