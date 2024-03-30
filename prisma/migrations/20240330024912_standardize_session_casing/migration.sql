-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_session" ("expiresAt", "id", "userId") SELECT "expiresAt", "id", "user_id" FROM "session";
DROP TABLE "session";
ALTER TABLE "new_session" RENAME TO "session";
CREATE UNIQUE INDEX "session_id_key" ON "session"("id");
CREATE INDEX "session_userId_idx" ON "session"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
