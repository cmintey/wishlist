declare module "@samirrayani/metascraper-shopping" {
    export default function rules(): import("metascraper").Rule;
}

declare module "virtual:pwa-register" {
    import type { RegisterSWOptions } from "vite-plugin-pwa/types";

    export type { RegisterSWOptions };

    export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

type NavItem = {
    labelKey: string;
    href: string;
    icon: string;
};

type ProductData = {
    brand: string | null;
    name: string | null;
    url: string | null;
    image: string | null;
    currency: string | null;
    condition: string | null;
    sku: string | null;
    mpn: string | null;
    availability: string | null;
    price: number | null;
    asin: string | null;
    hostname: string | null;
    retailer: string | null;
    title: string | null;
};

type SuggestionMethod = "surprise" | "auto-approval" | "approval";

type ListMode = "standard" | "registry";

type SMTPConfig =
    | {
          enable: false;
          host?: string | null;
          port?: number | null;
          user?: string | null;
          pass?: string | null;
          from?: string | null;
          fromName?: string | null;
      }
    | {
          enable: true;
          host: string;
          port: number;
          user: string;
          pass: string;
          from: string;
          fromName: string;
      };

type OIDCConfig =
    | {
          enable: false;
          discoveryUrl?: string | null;
          clientId?: string | null;
          clientSecret?: string | null;
          providerName?: string | null;
          autoRedirect?: boolean | null;
          autoRegister?: boolean | null;
      }
    | {
          enable: true;
          discoveryUrl: string;
          clientId: string;
          clientSecret: string;
          providerName?: string | null;
          autoRedirect: boolean;
          autoRegister: boolean;
      };

type Config = {
    enableSignup: boolean;
    suggestions: {
        enable: boolean;
        method: SuggestionMethod;
    };
    smtp: SMTPConfig;
    claims: {
        showName: boolean;
        requireEmail: boolean;
    };
    listMode: ListMode;
    security: {
        passwordStrength: number;
        disablePasswordLogin: boolean;
    };
    defaultGroup?: string | null;
    enableDefaultListCreation: boolean;
    allowPublicLists: boolean;
    oidc: OIDCConfig;
};

type Option = {
    value: string;
    direction?: Direction;
    displayValue: string;
};
type Direction = "asc" | "desc";

type GroupInformation = import("@prisma/client").Group & {
    isManager: boolean;
    active: boolean;
};

type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

type InviteMethod = "email" | "link";

type LocalUser = Omit<import("@prisma/client").User, "hashedPassword">;
