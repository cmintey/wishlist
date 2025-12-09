import { env } from "$env/dynamic/private";
import { PrismaClient } from "$lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

export const client = new PrismaClient({
    // log: ["query", "info", "warn", "error"]
    log: ["warn", "error"],
    adapter: new PrismaBetterSqlite3({
        url: env.DATABASE_URL
    })
});
