DELETE FROM "session";

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_session" ("id", "user_id") SELECT "id", "user_id" FROM "session";
DROP TABLE "session";
ALTER TABLE "new_session" RENAME TO "session";
CREATE UNIQUE INDEX "session_id_key" ON "session"("id");
CREATE INDEX "session_user_id_idx" ON "session"("user_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
