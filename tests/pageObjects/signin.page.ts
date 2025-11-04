import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";
import type { UserData } from "../types";
import { UserMenu } from "../modules/user-menu";

export class SigninPage extends BasePage {
    private readonly header: Locator;
    private readonly usernameField: Locator;
    private readonly passwordField: Locator;
    private readonly submitButton: Locator;

    constructor(page: Page) {
        super(page, "/login");
        this.header = page.getByRole("heading", { name: "Sign In" });
        this.usernameField = page.getByLabel("Username");
        this.passwordField = page.getByLabel("Password", { exact: true });
        this.submitButton = page.getByRole("button", { name: "Sign in" });
    }

    async at() {
        await expect(this.header).toBeVisible();
        return this;
    }

    async login(userData: UserData) {
        await this.usernameField.fill(userData.username);
        await this.passwordField.fill(userData.password);
        await this.submitButton.click();
        await new UserMenu(this.page).isVisible();
    }
}
