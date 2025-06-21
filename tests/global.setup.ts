import { expect, test as setup } from "@playwright/test";
import { SetupWizardPage } from "./pageObjects/setup-wizard.page";
import { testUtil } from "./util";

setup("setup wizard", async ({ page }) => {
    await page.goto("/");

    const setupWizardPage = new SetupWizardPage(page);

    await setupWizardPage.getStarted();
    await setupWizardPage.createAdminAccount();
    await setupWizardPage.completeSteps();

    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible();

    await testUtil.saveAdminAuth(page);
});
