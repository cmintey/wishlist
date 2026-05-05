import { expect, type Locator, type Page } from "@playwright/test";
import { CreateAccountForm } from "../modules/create-account-form";
import { randomString } from "../util";

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

    async fillAdmin() {
        await expect(this.createAccountHeader).toBeVisible();
        await this.createAccountForm.fill("Admin", "admin", "admin@example.com", randomString());
    }

    async next() {
        await this.nextButton.click();
    }

    async complete() {
        await this.completeButton.click();
    }

    async completeSteps() {
        // Step 1: Admin
        await this.fillAdmin();
        await this.next();
        await this.page.waitForURL("/setup-wizard/step/2", { waitUntil: "domcontentloaded" });

        // Step 2: Settings
        await this.next();
        await this.page.waitForURL("/setup-wizard/step/3", { waitUntil: "domcontentloaded" });

        // Step 3: Invite
        await this.complete();
        await this.page.waitForLoadState("load");
    }
}
