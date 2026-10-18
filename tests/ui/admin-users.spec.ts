import { expect, test } from "../fixtures";
import { ListsPage } from "../pageObjects/lists.page";

test("clearing a user's sessions preserves their account and lists", async ({ adminPage, userFactory }) => {
    const { user, page: userPage } = await userFactory.createUserPage();
    const listName = `${user.name}'s saved list`;

    const listsPage = new ListsPage(userPage);
    await listsPage.goto();
    await listsPage.create().then((page) => page.create(listName));

    await adminPage.goto("/admin/users");
    await adminPage.getByRole("row").filter({ hasText: user.username }).click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/users/${user.id}$`));

    await adminPage.getByRole("button", { name: "Clear user sessions" }).click();
    await adminPage.getByRole("dialog").getByRole("button", { name: "Confirm" }).click();

    await expect(adminPage).toHaveURL(new RegExp(`/admin/users/${user.id}$`));

    await userPage.goto("/lists");
    await expect(userPage).toHaveURL(/\/login/);
    await userPage.request.post("/login", {
        form: { username: user.username, password: user.password },
        headers: { Origin: "http://localhost:3280" }
    });
    await listsPage.goto();
    await expect(userPage.getByText(listName)).toBeVisible();
});
