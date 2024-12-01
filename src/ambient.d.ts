declare module "@samirrayani/metascraper-shopping" {
    export default function rules(): import("metascraper").Rule;
}

type NavItem = {
    label: string;
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

type Config = {
    enableSignup: boolean;
    suggestions: {
        enable: boolean;
        method: SuggestionMethod;
    };
    smtp: SMTPConfig;
    claims: {
        showName: boolean;
    };
    listMode: ListMode;
    security: {
        passwordStrength: number;
    };
    defaultGroup?: string | null;
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
