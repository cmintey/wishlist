import { PrismaClient } from "../src/lib/generated/prisma/client";
import { createDbAdapter } from "./db-adapter";
import "dotenv/config";

export const prisma = new PrismaClient({
    adapter: createDbAdapter(process.env.DATABASE_URL)
});
