import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { ManageListPage } from "./manage-list.page";

interface Props {
    id?: string;
    name: string;
}

export class ListPage extends BasePage {
    private readonly id: string;
    private readonly name: string;
    private readonly header: Locator;
    private readonly manageButton: Locator;

    constructor(page: Page, props: Props) {
        const id = props.id ?? new URL(page.url()).pathname.split("/").at(-1);
        super(page, `/lists/${id}`);
        this.id = id!;
        this.name = props.name;
        this.header = page.getByRole("heading", { name: props.name });
        this.manageButton = page.getByRole("button", { name: "Manage" });
    }

    async at() {
        await expect(this.header).toBeVisible();
    }

    async manage() {
        await this.manageButton.click();
        return new ManageListPage(this.page);
    }
}
