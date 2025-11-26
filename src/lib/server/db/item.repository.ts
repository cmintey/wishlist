import { db } from ".";
import type { GetItemsOptions } from "../list";

class ItemRepository {
    async getItemsForList(listId: string, options: GetItemsOptions) {
        const qb = db
            .selectFrom("list_item as li")
            .innerJoin("items as i", "li.itemId", "i.id")
            .innerJoin("user as uf", "uf.id", "i.userId")
            .innerJoin("user as ua", "ua.id", "li.addedById")
            .leftJoin("item_price as ip", "ip.id", "i.itemPriceId")
            // TODO: create CTE for this, need to pull claimed users groups as well
            .leftJoin("list_item_claim as lic", (join) =>
                join.onRef("lic.itemId", "=", "li.itemId").onRef("lic.listId", "=", "li.listId")
            )
            .leftJoin("user as uc", "uc.id", "lic.claimedById")
            .leftJoin("system_user as suc", "suc.id", "lic.publicClaimedById")
            .select([
                // Item selects
                "li.listId",
                "i.id",
                "i.name",
                "ip.value as priceValue",
                "ip.currency",
                "i.url",
                "i.imageUrl",
                "i.note",
                "i.quantity",
                // Users
                "uf.id as userId",
                "uf.name as userName",
                "ua.id as addedById",
                "ua.name as addedByName",
                // Claims
                "lic.id as claimId",
                "lic.quantity as claimedQuantity",
                "lic.purchased",
                "uc.id as claimedById",
                "uc.name as claimedByName",
                "suc.id as publicClaimedById",
                "suc.name as publicClaimedByName"
            ])
            .where("li.listId", "=", listId);

        if (this.isApprovalModeAndNotOwnerOrManager(options)) {
            qb.where("li.approved", "=", true);
        }
        if (this.isSurpriseModeAndOwnerOrManager(options)) {
            const filter = [options.loggedInUserId, ...(options.listManagers || [])];
            qb.where("li.addedById", "in", filter);
        }
        if (options.sort === "price") {
            qb.orderBy("ip.value", (ob) => (options.sortDir === "asc" ? ob.asc().nullsLast() : ob.desc().nullsLast()));
        } else {
            qb.orderBy("li.displayOrder");
        }

        return qb.execute();
    }

    private isApprovalModeAndNotOwnerOrManager(options: GetItemsOptions) {
        return (
            options.suggestionMethod === "approval" &&
            !options.loggedInUserId &&
            options.loggedInUserId !== options.listOwnerId &&
            !options.listManagers?.has(options.loggedInUserId || "")
        );
    }

    private isSurpriseModeAndOwnerOrManager(options: GetItemsOptions) {
        return (
            options.suggestionMethod === "surprise" &&
            (options.loggedInUserId === options.listOwnerId ||
                (options.loggedInUserId && options.listManagers?.has(options.loggedInUserId)))
        );
    }
}

export const itemRepository = new ItemRepository();
