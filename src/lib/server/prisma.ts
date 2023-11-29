import { PrismaClient } from "@prisma/client";

export const client = new PrismaClient({
    // log: ["query", "info", "warn", "error"]
    log: ["warn", "error"]
});
