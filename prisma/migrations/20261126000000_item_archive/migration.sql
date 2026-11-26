-- Add archive state without rewriting existing wishes or their associations.
ALTER TABLE "items" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;
