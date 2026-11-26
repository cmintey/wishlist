// Run with: node --test tests/archive-migration.test.mjs
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");
const archiveMigration = "20261126000000_item_archive";

function workspace() {
    const tempRoot = existsSync("/tmp/opencode") ? "/tmp/opencode" : tmpdir();
    const dir = mkdtempSync(join(tempRoot, "wishlist-archive-migration-"));
    const prismaDir = join(dir, "prisma");
    cpSync(join(root, "prisma.config.ts"), join(dir, "prisma.config.ts"));
    cpSync(join(root, "prisma", "schema.prisma"), join(prismaDir, "schema.prisma"));
    cpSync(join(root, "prisma", "migrations"), join(prismaDir, "migrations"), {
        recursive: true,
        filter: (path) => path !== join(root, "prisma", "migrations", archiveMigration)
    });
    // The copied repository config imports Prisma and dotenv from the project's dependencies.
    symlinkSync(join(root, "node_modules"), join(dir, "node_modules"), "dir");
    return dir;
}

function deploy(dir) {
    execFileSync(
        process.execPath,
        [
            join(root, "node_modules/prisma/build/index.js"),
            "migrate",
            "deploy",
            "--config",
            join(dir, "prisma.config.ts")
        ],
        {
            cwd: dir,
            env: { ...process.env, DATABASE_URL: `file:${join(dir, "test.db")}` },
            stdio: "pipe"
        }
    );
}

function addArchiveMigration(dir) {
    const migrations = join(root, "prisma", "migrations");
    if (readdirSync(migrations).includes(archiveMigration)) {
        cpSync(join(migrations, archiveMigration), join(dir, "prisma", "migrations", archiveMigration), {
            recursive: true
        });
    }
}

function withWorkspace(run) {
    const dir = workspace();
    try {
        run(dir);
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
}

function rows(db, table) {
    return db
        .prepare(`SELECT * FROM "${table}" ORDER BY id`)
        .all()
        .map((row) => ({ ...row }));
}

test("migration preserves existing wishes, list associations and claims", () => {
    withWorkspace((dir) => {
        deploy(dir);
        const dbPath = join(dir, "test.db");
        let db = new DatabaseSync(dbPath);
        db.exec(`
            PRAGMA foreign_keys = ON;
            INSERT INTO role (id, name) VALUES (1, 'user');
            INSERT INTO "user" (id, username, name, email, roleId, hashedPassword) VALUES
                ('creator', 'creator', 'Creator', 'creator@example.com', 1, 'hash'),
                ('recipient', 'recipient', 'Recipient', 'recipient@example.com', 1, 'hash'),
                ('claimant', 'claimant', 'Claimant', 'claimant@example.com', 1, 'hash');
            INSERT INTO "group" (id, name) VALUES ('group-1', 'Group 1'), ('group-2', 'Group 2');
            INSERT INTO list (id, name, ownerId, groupId) VALUES
                ('list-1', 'List 1', 'recipient', 'group-1'),
                ('list-2', 'List 2', 'recipient', 'group-2');
            INSERT INTO items (id, name, price, url, note, imageUrl, quantity, mostWanted, userId, createdById) VALUES
                (1, 'Finite wish', '15', 'https://example.com', 'note', 'https://example.com/image', 4, true, 'recipient', 'creator'),
                (2, 'Unlimited wish', NULL, NULL, NULL, NULL, NULL, false, 'creator', 'creator');
            INSERT INTO list_item (id, listId, itemId, addedById, approved, displayOrder) VALUES
                ('association-1', 'list-1', 1, 'creator', true, 3),
                ('association-2', 'list-2', 1, 'creator', false, 4),
                ('association-3', 'list-1', 2, 'creator', true, NULL);
            INSERT INTO system_user (id, username, name) VALUES ('anonymous', 'guest', 'Guest');
            INSERT INTO list_item_claim (id, itemId, listId, claimedById, publicClaimedById, purchased, quantity) VALUES
                ('claim-1', 1, 'list-1', 'claimant', NULL, true, 2),
                ('claim-2', 1, 'list-2', NULL, 'anonymous', false, 1);
        `);
        const before = Object.fromEntries(
            ["items", "list_item", "list_item_claim"].map((table) => [table, rows(db, table)])
        );
        db.close();

        addArchiveMigration(dir);
        deploy(dir);
        db = new DatabaseSync(dbPath);
        try {
            const items = rows(db, "items");
            assert.deepEqual(
                items.map((item) => item.archived),
                [0, 0],
                "existing wishes must default to active"
            );
            assert.deepEqual(
                items.map((item) => Object.fromEntries(Object.entries(item).filter(([key]) => key !== "archived"))),
                before.items
            );
            assert.deepEqual(rows(db, "list_item"), before.list_item);
            assert.deepEqual(rows(db, "list_item_claim"), before.list_item_claim);
            assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);

            db.exec("INSERT INTO items (id, name, userId, createdById) VALUES (3, 'New wish', 'creator', 'creator')");
            assert.equal(db.prepare("SELECT archived FROM items WHERE id = 3").get().archived, 0);
            db.exec("UPDATE items SET archived = true WHERE id = 3");
            assert.throws(() => db.exec("UPDATE items SET archived = NULL WHERE id = 3"), /NOT NULL/);
        } finally {
            db.close();
        }
        db = new DatabaseSync(dbPath);
        try {
            assert.equal(db.prepare("SELECT archived FROM items WHERE id = 3").get().archived, 1);
        } finally {
            db.close();
        }
    });
});

test("fresh databases have a non-null active archive default", () => {
    withWorkspace((dir) => {
        addArchiveMigration(dir);
        deploy(dir);
        const db = new DatabaseSync(join(dir, "test.db"));
        try {
            const column = db
                .prepare("PRAGMA table_info(items)")
                .all()
                .find((entry) => entry.name === "archived");
            assert.ok(column, "archived column must exist");
            assert.equal(column.notnull, 1);
            assert.match(column.dflt_value, /^(false|0)$/i);
            assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
        } finally {
            db.close();
        }
    });
});
