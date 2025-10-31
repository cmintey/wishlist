import type { Page } from "@playwright/test";
import { UserMenu } from "../modules/user-menu";
import type { Method } from "../modules/suggestions-settings";
import { test } from "../fixtures";

export async function setSuggestionMethod(page: Page, method: Method) {
    await test.step(`set suggestion method to '${method}'`, async () => {
        await new UserMenu(page)
            .manageGroup()
            .then((page) => page.clickSettingsTab())
            .then(async (page) => {
                await page
                    .getSuggestionsSettings()
                    .then((s) => s.enable())
                    .then((s) => s.selectMethod(method));
                return page;
            })
            .then((page) => page.saveSettings());
    });
}

export async function disableSuggestions(page: Page) {
    await new UserMenu(page)
        .manageGroup()
        .then((page) => page.clickSettingsTab())
        .then(async (page) => {
            await page.getSuggestionsSettings().then((s) => s.disable());
            return page;
        })
        .then((page) => page.saveSettings());
}
