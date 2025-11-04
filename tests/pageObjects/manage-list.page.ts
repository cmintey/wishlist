import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { ListForm } from "../modules/list-form";
import { Modal } from "../modules/modal";
import { ListPage } from "./list.page";

interface Props {
    id?: string;
}

export class ManageListPage extends BasePage {
    private readonly listId: string;
    private readonly header: Locator;
    private readonly listForm: ListForm;

    constructor(page: Page, props?: Props) {
        const id = props?.id ?? new URL(page.url()).pathname.split("/").at(-1);
        super(page, `/lists/${id}/manage`);
        this.listId = id!;
        this.header = page.getByRole("heading", { name: "Manage List" });
        this.listForm = new ListForm(page);
    }

    getUrl() {
        return `/lists/${this.listId}/manage`;
    }

    async at() {
        await expect(this.header).toBeVisible();
        return this;
    }

    async waitForNavigate() {
        await this.page.waitForURL(this.getUrl(), { waitUntil: "load" });
        return this;
    }

    async save() {
        const name = await this.listForm.getName();
        await this.listForm.save();
        const listPage = new ListPage(this.page, { id: this.listId, name });
        return await listPage.waitForNavigate();
    }

    async setName(name: string) {
        await this.listForm.setName(name);
        return this;
    }

    async makePublic() {
        await this.listForm.makePublic();
    }

    async cancel() {
        return this.listForm.cancel();
    }

    async delete() {
        await this.listForm.delete();
        const modal = new Modal(this.page, { modalName: "Please Confirm", submitButtonText: "Confirm" });
        await modal.submit();
    }

    async getManagers() {
        return await this.listForm.getListManagers().getManagers();
    }

    async expectNoManagers() {
        await this.listForm.getListManagers().expectNoManagers();
        return this;
    }

    async addManager(name: string) {
        await this.listForm.getListManagers().addManager(name);
        return this;
    }

    async removeManager(name: string) {
        await this.listForm.getListManagers().removeManager(name);
        return this;
    }
}
