import { expect, type Locator, type Page } from "@playwright/test";
import { CreateAccountForm } from "../modules/create-account-form";

export class SetupWizardPage {
    private readonly page: Page;
    private readonly getStartedHeader: Locator;
    private readonly getStartedButton: Locator;
    private readonly nextButton: Locator;
    private readonly createAccountHeader: Locator;
    private readonly createAccountForm: CreateAccountForm;
    private readonly settingsHeader: Locator;
    private readonly inviteUsersHeader: Locator;
    private readonly completeButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.getStartedHeader = page.getByText("Let's get started");
        this.getStartedButton = page.getByRole("button", { name: "Get Started" });
        this.nextButton = page.getByRole("button", { name: "Next" });
        this.createAccountHeader = page.getByText("Create your account");
        this.createAccountForm = new CreateAccountForm(page);
        this.settingsHeader = page.getByText("Global Settings");
        this.inviteUsersHeader = page.getByText("Invite Users");
        this.completeButton = page.getByRole("button", { name: "Complete" });
    }

    async getStarted() {
        await expect(this.getStartedHeader).toBeVisible({ timeout: 10000 });
        await this.getStartedButton.click();
    }

    async createAdminAccount() {
        await expect(this.createAccountHeader).toBeVisible();
        await this.createAccountForm.fill("Carter", "cmintey", "cmintey8@gmail.com", "Really-Strong-Test-Pwd");
        await this.nextButton.click();
        await expect(this.createAccountHeader).not.toBeVisible();
    }

    async completeSteps() {
        while (await this.nextButton.isVisible()) {
            await this.nextButton.click();
            await this.page.waitForTimeout(200);
        }

        await expect(this.completeButton).toBeVisible();
        await this.completeButton.click();
        await this.page.waitForTimeout(100);
    }
}
