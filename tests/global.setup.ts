import { expect, test as setup } from "@playwright/test";
import { SetupWizardPage } from "./pageObjects/setup-wizard.page";
import { adminAuthFile } from "./constants";

setup("setup wizard", async ({ page }) => {
    await page.goto("/");

    if (new URL(page.url()).pathname === "/login") {
        return;
    }

    const setupWizardPage = new SetupWizardPage(page);

    await setupWizardPage.getStarted();
    await setupWizardPage.createAdminAccount();
    await setupWizardPage.completeSteps();

    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible();

    await page.context().storageState({ path: adminAuthFile });
});
