import { env } from "$env/dynamic/private";
import { defaultSerializer, SerializePlugin } from "kysely-plugin-serialize";
import type { DB } from "./types";
import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

const dialect = new SqliteDialect({
    database: new SQLite(env.DATABASE_URL.replace("file:", ""))
});

export const db = new Kysely<DB>({
    dialect,
    plugins: [
        new SerializePlugin({
            serializer(value) {
                if (typeof value === "boolean") {
                    return value ? 1 : 0;
                }
                return defaultSerializer(value);
            }
        })
    ],
    log(event) {
        if (event.level === "error") {
            console.error("Query failed : ", {
                durationMs: event.queryDurationMillis,
                error: event.error,
                sql: event.query.sql,
                params: event.query.parameters
            });
        } else {
            // `'query'`
            console.log("Query executed : ", {
                durationMs: event.queryDurationMillis,
                sql: event.query.sql,
                params: event.query.parameters
            });
        }
    }
});

export * from "./types";
