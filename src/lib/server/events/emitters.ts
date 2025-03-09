import { EventEmitter } from "node:events";
import type {
    ItemCreateHandler,
    ItemDeleteHandler,
    ItemEvent,
    ItemsUpdateHandler,
    ItemUpdateHandler
} from "../../events";

interface ItemEvents {
    [ItemEvent.ITEM_UPDATE]: Parameters<ItemUpdateHandler["handle"]>;
    [ItemEvent.ITEM_CREATE]: Parameters<ItemCreateHandler["handle"]>;
    [ItemEvent.ITEM_DELETE]: Parameters<ItemDeleteHandler["handle"]>;
    [ItemEvent.ITEMS_UPDATE]: Parameters<ItemsUpdateHandler["handle"]>;
}

export const itemEmitter = new EventEmitter<ItemEvents>();
