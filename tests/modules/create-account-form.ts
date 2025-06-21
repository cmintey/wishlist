import type { Locator, Page } from "@playwright/test";

export class CreateAccountForm {
    readonly page: Page;
    readonly nameField: Locator;
    readonly usernameField: Locator;
    readonly emailField: Locator;
    readonly passwordField: Locator;
    readonly confirmPasswordField: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nameField = page.getByLabel("Name", { exact: true });
        this.usernameField = page.getByLabel("Username");
        this.emailField = page.getByLabel("Email");
        this.passwordField = page.getByLabel("Password", { exact: true });
        this.confirmPasswordField = page.getByLabel("Confirm Password");
    }

    async fill(name: string, username: string, email: string, password: string) {
        await this.nameField.fill(name);
        await this.usernameField.fill(username);
        await this.emailField.fill(email);
        await this.passwordField.fill(password);
        await this.confirmPasswordField.fill(password);
    }
}
