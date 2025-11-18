import { resolve } from "$app/paths";

export const navItems = [
    {
        labelKey: "app.home",
        href: () => resolve("/lists"),
        icon: "ion:home"
    },
    {
        labelKey: "wishes.my-lists",
        href: (user) => resolve("/lists") + (user ? "?" + new URLSearchParams({ users: user.id }).toString() : ""),
        icon: "ion:gift"
    },
    {
        labelKey: "app.my-claims",
        href: () => resolve("/claims"),
        icon: "ion:albums"
    }
] satisfies NavItem[];
