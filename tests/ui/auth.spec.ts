import { test, expect } from "../fixtures";
import { UserMenu } from "../modules/user-menu";
import { ListsPage } from "../pageObjects/lists.page";
import { SigninPage } from "../pageObjects/signin.page";
import { SignupPage } from "../pageObjects/signup.page";
import { createUser } from "../util";

test("unauthenticated", async ({ anonymousPage: page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
});

test("admin authenticated", async ({ adminPage: page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible();
    const userMenu = new UserMenu(page);
    await userMenu.assertAdminButtonVisible();
});

test("user authenticated", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Lists" })).toBeVisible();
    const userMenu = new UserMenu(page);
    await userMenu.assertAdminButtonNotVisible();
});

test("user signup", async ({ anonymousPage: page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    await signupPage.createAccount();

    const userMenu = new UserMenu(page);
    await userMenu.isVisible();
});

test("user login/logout", async ({ anonymousPage: page, adminPage }) => {
    const userData = await createUser(adminPage.request);

    await page.goto("/");
    const signinPage = new SigninPage(page);
    await signinPage.at();
    await signinPage.login(userData);

    const userMenu = new UserMenu(page);
    await userMenu.isVisible();

    await userMenu.signOut();
    await signinPage.at();
});

test("add user to a group", async ({ page, userData, adminPage, anonymousPage: newUserPage }) => {
    const newUser = await createUser(adminPage.request);

    await page.goto("/");
    const userMenu = new UserMenu(page);
    await userMenu.manageGroup().then((p) => p.addMember(newUser.name));

    const listsPage = new ListsPage(page);
    await listsPage.goto().then((p) => p.expectListCount(2));

    const signinPage = new SigninPage(newUserPage);
    await signinPage.goto();
    await signinPage.login(newUser);

    const newUserMenu = new UserMenu(newUserPage);
    await newUserMenu.changeGroup(userData.groups[0].name);
    const newUserlistsPage = new ListsPage(newUserPage);
    await newUserlistsPage.goto().then((p) => p.expectListCount(2));
});
