import { PrismaClient } from "../src/lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import "dotenv/config";

export const prisma = new PrismaClient({
    adapter: new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL
    })
});
