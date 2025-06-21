import { test as base } from "@playwright/test";

interface Fixtures {}

export const test = base.extend<Fixtures>({});
export { expect } from "@playwright/test";
