import type { ItemOnListDTO } from "$lib/dtos/item-dto";
import type { Item } from "@prisma/client";
import { toItemOnListDTO, type FullItem } from "./dtos/item-mapper";

const ITEM_UPDATE = "item_update";
const ITEM_CREATE = "item_create";
const ITEM_DELETE = "item_delete";
const ITEMS_UPDATE = "items_update";

export const ItemEvent = { ITEMS_UPDATE, ITEM_CREATE, ITEM_UPDATE, ITEM_DELETE } as const;

interface ItemDeleteEvent {
    id: number;
    lists: { id: string }[];
}

export interface BaseEventHandler<D, T> {
    listId: string;
    getEventId: () => string;
    handle: (data: D) => T;
    predicate: (data: D) => boolean;
}

export class ItemUpdateHandler implements BaseEventHandler<FullItem, ItemOnListDTO> {
    static event = ItemEvent.ITEM_UPDATE;
    listId: string;
    constructor(listId: string) {
        this.listId = listId;
    }

    getEventId() {
        return ItemUpdateHandler.event;
    }

    handle(data: FullItem) {
        return toItemOnListDTO(data, this.listId);
    }

    predicate(data: FullItem) {
        return data.lists.map((l) => l.listId).includes(this.listId);
    }

    static listen(source: EventSource, callback: (data: ItemOnListDTO) => void) {
        source.addEventListener(ItemUpdateHandler.event, (e) => {
            const message = JSON.parse(e.data) as ItemOnListDTO;
            callback(message);
        });
    }
}

export class ItemCreateHandler implements BaseEventHandler<FullItem, ItemOnListDTO> {
    static event = ItemEvent.ITEM_CREATE;
    listId: string;
    constructor(listId: string) {
        this.listId = listId;
    }

    getEventId() {
        return ItemCreateHandler.event;
    }

    handle(data: FullItem) {
        return toItemOnListDTO(data, this.listId);
    }

    predicate(data: FullItem) {
        return data.lists.map((l) => l.listId).includes(this.listId);
    }

    static listen(source: EventSource, callback: (data: ItemOnListDTO) => void) {
        source.addEventListener(ItemCreateHandler.event, (e) => {
            const message = JSON.parse(e.data) as ItemOnListDTO;
            callback(message);
        });
    }
}

export class ItemDeleteHandler implements BaseEventHandler<ItemDeleteEvent, Pick<Item, "id">> {
    static event = ItemEvent.ITEM_DELETE;
    listId: string;
    constructor(listId: string) {
        this.listId = listId;
    }

    getEventId() {
        return ItemDeleteHandler.event;
    }

    handle(event: ItemDeleteEvent) {
        return { id: event.id };
    }

    predicate(data: ItemDeleteEvent) {
        return data.lists.map((l) => l.id).includes(this.listId);
    }

    static listen(source: EventSource, callback: (data: ItemDeleteEvent) => void) {
        source.addEventListener(ItemDeleteHandler.event, (e) => {
            const message = JSON.parse(e.data) as ItemDeleteEvent;
            callback(message);
        });
    }
}

export class ItemsUpdateHandler implements BaseEventHandler<void, void> {
    static event = ItemEvent.ITEMS_UPDATE;
    listId: string;
    constructor(listId: string) {
        this.listId = listId;
    }

    getEventId() {
        return ItemsUpdateHandler.event;
    }

    handle(_event: void) {
        return;
    }

    predicate(_data: void) {
        return true;
    }

    static listen(source: EventSource, callback: (_data: void) => void) {
        source.addEventListener(ItemsUpdateHandler.event, () => {
            callback();
        });
    }
}
