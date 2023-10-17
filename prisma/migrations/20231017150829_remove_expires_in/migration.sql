-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_password_resets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "redeemed" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_password_resets" ("createdAt", "hashedToken", "id", "redeemed", "userId") SELECT "createdAt", "hashedToken", "id", "redeemed", "userId" FROM "password_resets";
DROP TABLE "password_resets";
ALTER TABLE "new_password_resets" RENAME TO "password_resets";
CREATE UNIQUE INDEX "password_resets_id_key" ON "password_resets"("id");
CREATE INDEX "password_resets_hashedToken_idx" ON "password_resets"("hashedToken");
CREATE TABLE "new_signup_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hashedToken" TEXT NOT NULL,
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    "groupId" TEXT NOT NULL DEFAULT 'global'
);
INSERT INTO "new_signup_tokens" ("createdAt", "groupId", "hashedToken", "id", "redeemed") SELECT "createdAt", "groupId", "hashedToken", "id", "redeemed" FROM "signup_tokens";
DROP TABLE "signup_tokens";
ALTER TABLE "new_signup_tokens" RENAME TO "signup_tokens";
CREATE UNIQUE INDEX "signup_tokens_id_key" ON "signup_tokens"("id");
CREATE INDEX "signup_tokens_hashedToken_idx" ON "signup_tokens"("hashedToken");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
