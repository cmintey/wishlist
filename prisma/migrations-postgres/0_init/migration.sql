-- CreateExtension
-- Required for case-insensitive `username`/`email` columns below. The app
-- relies on case-insensitive uniqueness AND case-insensitive lookups purely
-- at the DB level (mirrors the `COLLATE NOCASE` used on these columns in the
-- SQLite migrations).
CREATE EXTENSION IF NOT EXISTS citext;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" CITEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" CITEXT NOT NULL DEFAULT 'changeme@email.com',
    "picture" TEXT,
    "roleId" INTEGER NOT NULL DEFAULT 1,
    "hashedPassword" TEXT NOT NULL,
    "oauthId" TEXT,
    "preferredLanguage" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_user" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT DEFAULT 'ANONYMOUS_NAME',

    CONSTRAINT "system_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_group_membership" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "user_group_membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "list" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "ownerId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "iconColor" TEXT,
    "description" TEXT,

    CONSTRAINT "list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "list_manager" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listId" TEXT NOT NULL,

    CONSTRAINT "list_manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" TEXT,
    "itemPriceId" TEXT,
    "url" TEXT,
    "note" TEXT,
    "imageUrl" TEXT,
    "quantity" INTEGER,
    "mostWanted" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_price" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,

    CONSTRAINT "item_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "list_item" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "addedById" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER,

    CONSTRAINT "list_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "list_item_claim" (
    "id" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "listId" TEXT NOT NULL,
    "claimedById" TEXT,
    "publicClaimedById" TEXT,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "list_item_claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "redeemed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signup_tokens" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hashedToken" TEXT NOT NULL,
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    "groupId" TEXT NOT NULL DEFAULT 'global',

    CONSTRAINT "signup_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "key" TEXT NOT NULL,
    "value" TEXT,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("key","groupId")
);

-- CreateTable
CREATE TABLE "patch" (
    "id" TEXT NOT NULL,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "system_user_id_key" ON "system_user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "session_id_key" ON "session"("id");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "role_id_key" ON "role"("id");

-- CreateIndex
CREATE UNIQUE INDEX "group_id_key" ON "group"("id");

-- CreateIndex
CREATE UNIQUE INDEX "group_name_key" ON "group"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_group_membership_id_key" ON "user_group_membership"("id");

-- CreateIndex
CREATE INDEX "user_group_membership_userId_idx" ON "user_group_membership"("userId");

-- CreateIndex
CREATE INDEX "user_group_membership_groupId_idx" ON "user_group_membership"("groupId");

-- CreateIndex
CREATE INDEX "user_group_membership_userId_groupId_idx" ON "user_group_membership"("userId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "list_id_key" ON "list"("id");

-- CreateIndex
CREATE INDEX "list_ownerId_idx" ON "list"("ownerId");

-- CreateIndex
CREATE INDEX "list_groupId_idx" ON "list"("groupId");

-- CreateIndex
CREATE INDEX "list_ownerId_groupId_idx" ON "list"("ownerId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "list_manager_id_key" ON "list_manager"("id");

-- CreateIndex
CREATE INDEX "list_manager_listId_idx" ON "list_manager"("listId");

-- CreateIndex
CREATE UNIQUE INDEX "items_id_key" ON "items"("id");

-- CreateIndex
CREATE INDEX "items_userId_idx" ON "items"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "item_price_id_key" ON "item_price"("id");

-- CreateIndex
CREATE UNIQUE INDEX "list_item_id_key" ON "list_item"("id");

-- CreateIndex
CREATE INDEX "list_item_listId_idx" ON "list_item"("listId");

-- CreateIndex
CREATE INDEX "list_item_itemId_idx" ON "list_item"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "list_item_listId_itemId_key" ON "list_item"("listId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "list_item_claim_id_key" ON "list_item_claim"("id");

-- CreateIndex
CREATE INDEX "list_item_claim_itemId_idx" ON "list_item_claim"("itemId");

-- CreateIndex
CREATE INDEX "list_item_claim_claimedById_idx" ON "list_item_claim"("claimedById");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_id_key" ON "password_resets"("id");

-- CreateIndex
CREATE INDEX "password_resets_hashedToken_idx" ON "password_resets"("hashedToken");

-- CreateIndex
CREATE UNIQUE INDEX "signup_tokens_id_key" ON "signup_tokens"("id");

-- CreateIndex
CREATE INDEX "signup_tokens_hashedToken_idx" ON "signup_tokens"("hashedToken");

-- CreateIndex
CREATE UNIQUE INDEX "patch_id_key" ON "patch"("id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group_membership" ADD CONSTRAINT "user_group_membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group_membership" ADD CONSTRAINT "user_group_membership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group_membership" ADD CONSTRAINT "user_group_membership_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list" ADD CONSTRAINT "list_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list" ADD CONSTRAINT "list_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_manager" ADD CONSTRAINT "list_manager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_manager" ADD CONSTRAINT "list_manager_listId_fkey" FOREIGN KEY ("listId") REFERENCES "list"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_itemPriceId_fkey" FOREIGN KEY ("itemPriceId") REFERENCES "item_price"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_item" ADD CONSTRAINT "list_item_listId_fkey" FOREIGN KEY ("listId") REFERENCES "list"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_item" ADD CONSTRAINT "list_item_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_item" ADD CONSTRAINT "list_item_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_item_claim" ADD CONSTRAINT "list_item_claim_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_item_claim" ADD CONSTRAINT "list_item_claim_listId_fkey" FOREIGN KEY ("listId") REFERENCES "list"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_item_claim" ADD CONSTRAINT "list_item_claim_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_item_claim" ADD CONSTRAINT "list_item_claim_publicClaimedById_fkey" FOREIGN KEY ("publicClaimedById") REFERENCES "system_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
