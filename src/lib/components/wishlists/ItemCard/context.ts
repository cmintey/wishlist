import type { ItemOnListDTO } from "$lib/dtos/item-dto";
import { createContext } from "svelte";

export const [getComponentId, setComponentId] = createContext<string>();
export const [getItem, setItem] = createContext<ItemOnListDTO>();
