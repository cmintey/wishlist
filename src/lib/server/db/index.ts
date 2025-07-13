import { env } from "$env/dynamic/private";
import { SerializePlugin } from "kysely-plugin-serialize";
import type { DB } from "./types";
import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

const dialect = new SqliteDialect({
    database: new SQLite(env.DATABASE_URL)
});

export const db = new Kysely<DB>({
    dialect,
    plugins: [new SerializePlugin()]
});

export * from "./types";
