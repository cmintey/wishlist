import { expect, type Locator, type Page } from "@playwright/test";

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
        this.priceField = page.getByLabel("Price");
        this.currencyField = page.getByTestId("currency");
        this.quantityField = page.getByLabel("Quantity");
        this.noLimitCheckbox = page.getByLabel("No limit");
        this.uploadImageField = page.getByLabel("Upload Image");
        this.uploadImageButton = page.getByRole("button", { name: "Select File" });
        this.imageUrlField = page.getByLabel("Image URL");
        this.notesField = page.getByLabel("Notes");
        this.notesWriteTab = page.locator(".tab-label", { hasText: "Write" });
        this.notesPreviewTab = page.locator(".tab-label", { hasText: "Preview" });
        this.notesPreviewContainer = page.getByTestId("markdown-preview");
        this.listSelectorField = page.getByLabel("Lists");
        this.hangTightBackdrop = page.getByText("Hang tight, gathering product data");
    }

    async fillViaUrl(url: string) {
        await this.urlField.fill(url);
        await expect(this.hangTightBackdrop).toBeVisible();
        await expect(this.hangTightBackdrop).not.toBeVisible({ timeout: 10000 });
        await expect(this.nameField).toHaveValue(/.+/);
        await expect(this.urlField).toHaveValue(/.+/);
        await expect(this.priceField).toHaveValue(/.+/);
        await expect(this.imageUrlField).toHaveValue(/.+/);
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
        await this.noLimitCheckbox.click();
        return this;
    }

    async uploadImage() {
        // todo
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
}
