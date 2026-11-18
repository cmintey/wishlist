ALTER TABLE "list_item_claim" ADD COLUMN "hashedToken" TEXT;

CREATE INDEX "list_item_claim_hashedToken_idx" ON "list_item_claim"("hashedToken");
