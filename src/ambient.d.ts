declare module "@samirrayani/metascraper-shopping" {
	export default function rules(): import("metascraper").Rule;
}

type NavItem = {
	label: string;
	href: string;
	icon: string;
};
