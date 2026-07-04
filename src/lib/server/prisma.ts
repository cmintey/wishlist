import { env } from "$env/dynamic/private";
// db-adapter.ts lives under prisma/ (not src/lib/server/) because it's also
// used by prisma/client.ts (run via `tsx` for seeding/patches), and the
// production Docker image only ships the prisma/ directory wholesale - it
// does not ship the raw src/ tree (which is instead pre-compiled into
// build/).
import { createDbAdapter } from "../../../prisma/db-adapter";
import path from "node:path";
import { pathToFileURL } from "node:url";

// The generated Prisma Client is deliberately NOT statically imported here.
//
// Wishlist supports both SQLite and Postgres from a single build/image: the
// active provider is only known at container startup, from DATABASE_URL,
// and `prisma generate` is re-run then to regenerate
// src/lib/generated/prisma/client.ts for the correct provider (see
// entrypoint.sh). A normal `import` would let Vite/Rollup inline the
// generated client into the server bundle at build time, permanently
// freezing whatever provider was active then - regenerating the file at
// startup would have no effect on the already-bundled, already-running
// server.
//
// Building the module specifier from a runtime value (`process.cwd()`)
// rather than a string literal makes it impossible for Rollup to statically
// resolve/bundle this import, so it's left as a real `import()` call that
// Node resolves fresh, from disk, every time the process starts - which is
// exactly what picks up the regenerated client.
// Type-only import: erased at compile time, so it doesn't create a bundled
// runtime dependency, but still gives us full type safety below.
type GeneratedPrismaClientModule = typeof import("../generated/prisma/client");

const generatedClientUrl = pathToFileURL(path.join(process.cwd(), "src/lib/generated/prisma/client.ts")).href;
const { PrismaClient }: GeneratedPrismaClientModule = await import(/* @vite-ignore */ generatedClientUrl);

export const client = new PrismaClient({
    // log: ["query", "info", "warn", "error"]
    log: ["warn", "error"],
    adapter: createDbAdapter(env.DATABASE_URL)
});
