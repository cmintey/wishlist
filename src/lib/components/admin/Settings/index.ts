import Email from "./Email";
import General from "./General";
import Security from "./Security";
import type { MessageFormatter } from "$lib/server/i18n";

const options = [
    { label: ($t: MessageFormatter) => $t("admin.general"), hash: "#general" },
    { label: ($t: MessageFormatter) => $t("auth.email"), hash: "#email" },
    { label: ($t: MessageFormatter) => $t("admin.security"), hash: "#security" }
];

export { Email, General, Security, options };
