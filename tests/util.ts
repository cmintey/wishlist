import { init } from "@paralleldrive/cuid2";

export const randomString = (length = 8) => init({ length })();
