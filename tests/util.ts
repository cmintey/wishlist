import type { Page, test as t } from "@playwright/test";

class TestUtil {
    readonly adminAuthFile = "playwright/.auth/admin.json";

    async saveAdminAuth(page: Page) {
        await page.context().storageState({ path: this.adminAuthFile });
    }

    useAdminAuth(test: typeof t) {
        test.use({ storageState: this.adminAuthFile });
    }
}

export const testUtil = new TestUtil();
