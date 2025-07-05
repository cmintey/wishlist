import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { ListForm } from "../modules/list-form";

interface Props {
    id?: string;
}

export class ManageListPage extends BasePage {
    private readonly header: Locator;
    private readonly listForm: ListForm;

    constructor(page: Page, props?: Props) {
        const id = props?.id ?? new URL(page.url()).pathname.split("/").at(-1);
        super(page, `/lists/${id}/manage`);
        this.header = page.getByRole("heading", { name: "Manage List" });
        this.listForm = new ListForm(page);
    }

    async at() {
        await expect(this.header).toBeVisible();
    }

    async save() {
        const name = await this.listForm.getName();
        await this.listForm.save();
        await expect(this.page.getByRole("heading", { name })).toBeVisible();
    }

    async setName(name: string) {
        await this.listForm.setName(name);
        return this;
    }

    async cancel() {
        return this.listForm.cancel();
    }

    async delete() {
        return this.listForm.delete();
    }
}
