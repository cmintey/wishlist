-- CreateTable
CREATE TABLE "signup_tokens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresIn" INTEGER NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "redeemed" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "signup_tokens_id_key" ON "signup_tokens"("id");

-- CreateIndex
CREATE INDEX "signup_tokens_hashedToken_idx" ON "signup_tokens"("hashedToken");

-- CreateIndex
CREATE INDEX "password_resets_hashedToken_idx" ON "password_resets"("hashedToken");
