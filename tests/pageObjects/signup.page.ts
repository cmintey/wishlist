import { expect, type Locator, type Page } from "@playwright/test";
import { CreateAccountForm } from "../modules/create-account-form";
import { randomString } from "../util";
import { BasePage } from "./base.page";
import type { UserData } from "../types";

export class SignupPage extends BasePage {
    private readonly header: Locator;
    private readonly form: CreateAccountForm;
    private readonly submitButton: Locator;

    constructor(page: Page) {
        super(page, "/signup");
        this.header = page.getByRole("heading", { name: "Create Account" });
        this.form = new CreateAccountForm(page);
        this.submitButton = page.getByRole("button", { name: "Create account" });
    }

    async at() {
        await expect(this.header).toBeVisible();
    }

    async createAccount(): Promise<UserData> {
        const name = randomString();
        const username = randomString();
        const email = username + "@example.com";
        const password = randomString(12);
        await this.form.fill(name, username, email, password);
        await this.submitButton.click();
        return { name, username, email, password };
    }
}
