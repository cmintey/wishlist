import { expect, type Locator, type Page } from "@playwright/test";
import { randomString } from "../util";

export class ItemForm {
    private readonly page: Page;
    private readonly urlField: Locator;
    private readonly nameField: Locator;
    private readonly priceField: Locator;
    private readonly currencyField: Locator;
    private readonly quantityField: Locator;
    private readonly noLimitCheckbox: Locator;
    private readonly uploadImageField: Locator;
    private readonly uploadImageButton: Locator;
    private readonly imageUrlField: Locator;
    private readonly mostWantedCheckbox: Locator;
    private readonly notesField: Locator;
    private readonly notesWriteTab: Locator;
    private readonly notesPreviewTab: Locator;
    private readonly notesPreviewContainer: Locator;
    private readonly listSelectorField: Locator;
    private readonly hangTightBackdrop: Locator;

    constructor(page: Page) {
        this.page = page;
        this.urlField = page.getByLabel("Item URL");
        this.nameField = page.getByLabel("Item Name");
        this.priceField = page.locator("#formatted-price");
        this.currencyField = page.getByTestId("currency");
        this.quantityField = page.getByLabel("Quantity");
        this.noLimitCheckbox = page.getByLabel("No limit");
        this.uploadImageField = page.getByLabel("Upload Image");
        this.uploadImageButton = page.getByRole("button", { name: "Select File" });
        this.mostWantedCheckbox = page.getByLabel("Most wanted");
        this.imageUrlField = page.getByLabel("Image URL");
        this.notesField = page.getByLabel("Notes");
        this.notesWriteTab = page.getByRole("tab", { name: "Write" });
        this.notesPreviewTab = page.getByRole("tab", { name: "Preview" });
        this.notesPreviewContainer = page.getByTestId("markdown-preview");
        this.listSelectorField = page.getByRole("group", { name: "Lists" });
        this.hangTightBackdrop = page.getByText("Hang tight, gathering product data");
    }

    async fillViaUrl(url: string) {
        await this.urlField.focus();
        await this.urlField.fill(url);
        await this.nameField.focus();
        await expect(this.hangTightBackdrop).toBeVisible();
        await expect(this.hangTightBackdrop).not.toBeVisible({ timeout: 10000 });
        if (!(await this.nameField.inputValue())) {
            await this.fillName(randomString());
        }
        return this;
    }

    async fillName(name: string) {
        await this.nameField.fill(name);
        return this;
    }

    async fillPrice(price: number | string, currency?: string) {
        await this.priceField.fill(price.toString());
        if (currency) {
            await this.currencyField.fill(currency);
        }
        return this;
    }

    async fillQuantity(quantity: number) {
        await this.quantityField.fill(quantity.toString());
        return this;
    }

    async checkNoLimit() {
        await this.noLimitCheckbox.check();
        return this;
    }

    async uncheckNoLimit() {
        await this.noLimitCheckbox.uncheck();
        return this;
    }

    async uploadImage() {
        // todo
        return this;
    }

    async checkMostWanted() {
        await this.mostWantedCheckbox.check();
        return this;
    }

    async uncheckMostWanted() {
        await this.mostWantedCheckbox.uncheck();
        return this;
    }

    async fillImageUrl(url: string) {
        await this.imageUrlField.fill(url);
        return this;
    }

    async fillNote(text: string) {
        await this.notesWriteTab.click();
        await this.notesField.fill(text);
        return this;
    }

    async viewNotePreview() {
        await this.notesPreviewTab.click();
        return this.notesPreviewContainer;
    }

    async selectList(...lists: string[]) {
        for (const list of lists) {
            await this.listSelectorField.getByLabel(list).check();
        }
        return this;
    }

    async assertListsSelected(...lists: string[]) {
        for (const list of lists) {
            await expect(this.listSelectorField.getByLabel(list)).toBeChecked();
        }
        return this;
    }
}
