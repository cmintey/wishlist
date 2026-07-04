import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Wishlist is SQLite-first (zero config), but also supports an external,
 * self-hosted Postgres database as an opt-in. The provider is inferred
 * purely from the `DATABASE_URL` scheme - there is no separate config flag.
 *
 * - `file:...`                        -> sqlite (default)
 * - `postgres://...` / `postgresql://...` -> postgres
 */
export function isPostgresUrl(databaseUrl: string | undefined): boolean {
    return !!databaseUrl && /^postgres(ql)?:\/\//i.test(databaseUrl);
}

export function createDbAdapter(databaseUrl: string | undefined) {
    if (isPostgresUrl(databaseUrl)) {
        return new PrismaPg(databaseUrl as string);
    }

    return new PrismaBetterSqlite3({
        url: databaseUrl
    });
}
