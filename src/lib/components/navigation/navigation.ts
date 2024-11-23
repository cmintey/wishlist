import { getFormatter } from "$lib/i18n";

export const navItems = getFormatter().then(($t) => [
    {
        label: $t("app.home"),
        href: "/",
        icon: "ion:home"
    },
    {
        label: $t("wishes.my-wishes"),
        href: "/wishlists/me",
        icon: "ion:gift"
    },
    {
        label: $t("app.my-claims"),
        href: "/claims",
        icon: "ion:albums"
    }
]) satisfies Promise<NavItem[]>;
