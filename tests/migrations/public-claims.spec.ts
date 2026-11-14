import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

test("the guest-token migration preserves existing claims and indexes", () => {
    const db = new DatabaseSync(":memory:");
    try {
        db.exec(`
            CREATE TABLE list_item_claim (
                id TEXT PRIMARY KEY,
                itemId INTEGER NOT NULL,
                listId TEXT NOT NULL,
                claimedById TEXT,
                publicClaimedById TEXT,
                purchased BOOLEAN NOT NULL DEFAULT false,
                quantity INTEGER NOT NULL DEFAULT 1
            );
            CREATE INDEX list_item_claim_itemId_idx ON list_item_claim(itemId);
            CREATE INDEX list_item_claim_claimedById_idx ON list_item_claim(claimedById);
            INSERT INTO list_item_claim VALUES ('registered', 1, 'list', 'user', NULL, true, 2);
            INSERT INTO list_item_claim VALUES ('guest', 1, 'list', NULL, 'public-user', false, 3);
        `);
        const claims = db.prepare("SELECT * FROM list_item_claim ORDER BY id").all();
        const indexes = db.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'index' ORDER BY name").all();
        const sql = readFileSync(
            new URL("../../prisma/migrations/20261029213001_add_claim_token/migration.sql", import.meta.url),
            "utf-8"
        );
        db.exec(sql);
        const migrated = db.prepare("SELECT * FROM list_item_claim ORDER BY id").all();
        expect(migrated).toEqual(claims.map((claim) => ({ ...claim, hashedToken: null })));
        const retainedIndexes = db
            .prepare("SELECT name, sql FROM sqlite_master WHERE type = 'index' AND name != ? ORDER BY name")
            .all("list_item_claim_hashedToken_idx");
        expect(retainedIndexes).toEqual(indexes);
        expect(db.prepare("PRAGMA integrity_check").get()).toEqual({ integrity_check: "ok" });
    } finally {
        db.close();
    }
});
