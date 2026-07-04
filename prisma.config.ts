import "dotenv/config";
import { defineConfig } from "prisma/config";
import { isPostgresUrl } from "./prisma/db-adapter";

const databaseUrl = process.env.DATABASE_URL || "prisma/dev.db";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: isPostgresUrl(databaseUrl) ? "prisma/migrations-postgres" : "prisma/migrations",
        seed: "tsx prisma/seed.ts"
    },
    datasource: {
        url: databaseUrl
    }
});
