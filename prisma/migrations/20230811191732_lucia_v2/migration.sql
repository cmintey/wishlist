DELETE FROM "key"
WHERE expires != null;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_key" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hashed_password" TEXT,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "key_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_key" ("hashed_password", "id", "user_id") SELECT "hashed_password", "id", "user_id" FROM "key";
DROP TABLE "key";
ALTER TABLE "new_key" RENAME TO "key";
CREATE UNIQUE INDEX "key_id_key" ON "key"("id");
CREATE INDEX "key_user_id_idx" ON "key"("user_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
