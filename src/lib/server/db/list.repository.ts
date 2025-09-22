import { init } from "@paralleldrive/cuid2";
import { db, type NewList } from ".";
import { sql } from "kysely";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";

class ListRepository {
    async findByOwnerIdAndGroupId(ownerId: string, groupId: string) {
        return db
            .selectFrom("list")
            .selectAll()
            .where("ownerId", "=", ownerId)
            .where("groupId", "=", groupId)
            .executeTakeFirst();
    }

    async create(list: Omit<NewList, "id">) {
        const id = init({ length: 10 });
        return db
            .insertInto("list")
            .values({ id: id(), ...list })
            .returningAll()
            .executeTakeFirst();
    }

    async getListsForLoggedInUser(ownerId: string, groupId: string) {
        return db
            .selectFrom("list as l")
            .innerJoin("user as u", "u.id", "l.ownerId")
            .leftJoin("list_item as li", "li.listId", "l.id")
            .leftJoin("items as i", "li.itemId", "i.id")
            .select([
                "l.id",
                "l.name",
                "l.icon",
                "l.iconColor",
                "u.id as ownerId",
                "u.name as ownerName",
                "u.username",
                "u.picture"
            ])
            .select(({ fn, eb }) =>
                fn
                    .sum<number>(
                        eb.case().when("li.id", "is", null).then(0).when("li.approved", "=", true).then(0).else(1).end()
                    )
                    .as("notApprovedCount")
            )
            .select(({ fn, eb }) =>
                fn.sum<number>(eb.case().when("li.id", "is", "null").then(0).else(1).end()).as("totalCount")
            )
            .where("l.ownerId", "=", ownerId)
            .where("l.groupId", "=", groupId)
            .groupBy("l.id")
            .execute();
    }

    async getListsForNonLoggedInUser(ownerId: string, groupId: string) {
        return db
            .selectFrom("list as l")
            .innerJoin("user as u", "u.id", "l.ownerId")
            .leftJoin("list_item as li", (join) => join.onRef("li.listId", "=", "l.id").on("li.approved", "=", true))
            .leftJoin("list_item_claim as lic", (join) =>
                join.onRef("lic.itemId", "=", "li.itemId").onRef("lic.listId", "=", "l.id")
            )
            .leftJoin("items as i", "li.itemId", "i.id")
            .select([
                "l.id",
                "l.name",
                "l.icon",
                "l.iconColor",
                "u.id as ownerId",
                "u.name as ownerName",
                "u.username",
                "u.picture"
            ])
            .select(
                ({ fn, eb }) =>
                    fn
                        .sum<number>(eb.case().when("lic.id", "is", null).then(0).else(eb.ref("lic.quantity")).end())
                        .as("claimedCount") // TODO: fix this
            )
            .select(({ fn, eb }) =>
                fn
                    // .sum<number>(
                    //     eb
                    //         .case()
                    //         .when("li.id", "is", null)
                    //         .then(0)
                    //         .when("i.quantity", "is", null)
                    //         .then(1)
                    //         .else(eb.ref("i.quantity"))
                    //         .end()
                    // )
                    .count<number>("li.id")
                    .distinct()
                    .as("totalCount")
            )
            .where("l.ownerId", "!=", ownerId)
            .where("l.groupId", "=", groupId)
            .groupBy("l.id")
            .orderBy("u.name", "asc")
            .orderBy("l.name", "asc")
            .execute();
    }

    async getListHashes(filters?: { groupId?: string; id?: string }): Promise<Record<string, string>> {
        const query = db
            .selectFrom("list as l")
            .leftJoin("list_item as li", "li.listId", "l.id")
            .leftJoin("items as i", "i.id", "li.itemId")
            .select("l.id as id")
            .select(({ ref }) => sql<string>`group_concat(${ref("i.id")}, '')`.as("partialHash"))
            .groupBy("l.id");

        if (filters?.groupId) query.where("l.groupId", "=", filters.groupId);
        if (filters?.id) query.where("l.id", "=", filters.id);

        return query
            .execute()
            .then((res) => res.reduce((prev, res) => ({ ...prev, [res.id]: hash(res.partialHash) }), {}));
    }
}

function hash(value: string) {
    return encodeHexLowerCase(sha256(new TextEncoder().encode(value)));
}

export const listRepository = new ListRepository();
