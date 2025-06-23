import { test as base, type Page } from "@playwright/test";
import { adminAuthFile } from "../constants";

interface Fixtures {
    admin: Page;
}

export const test = base.extend<Fixtures>({
    admin: async ({ browser }, use) => {
        const context = await browser.newContext({ storageState: adminAuthFile });
        await use(await context.newPage());
        await context.close();
    }
});
export { expect } from "@playwright/test";
