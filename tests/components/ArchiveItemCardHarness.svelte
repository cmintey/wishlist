<script lang="ts">
    import { setFormatter, setLocale } from "$lib/i18n";
    import type { MessageFormatter } from "$lib/server/i18n";
    import { readable } from "svelte/store";
    import ArchiveItemCard from "../../src/routes/archive/ArchiveItemCard.svelte";
    import type { PageData } from "../../src/routes/archive/$types";

    const {
        item,
        isTileView = false,
        pending = false,
        onrestore = () => {}
    }: {
        item: PageData["items"][number];
        isTileView?: boolean;
        pending?: boolean;
        onrestore?: (id: number) => void;
    } = $props();

    const format: MessageFormatter = (key, options) => {
        const values = options?.values ?? {};
        switch (key) {
            case "wishes.quantity-desired":
                return `Desired: ${values.quantity}`;
            case "wishes.no-limit":
                return "No limit";
            case "archive.for":
                return `For ${values.name}`;
            case "archive.claim":
                return `${values.name}: ${values.quantity} claimed`;
            case "archive.restore":
                return "Restore";
            case "wishes.most-wanted":
                return "Most wanted";
            case "a11y.default-item-image":
                return "default item image";
            default:
                return key;
        }
    };
    setFormatter(readable(format));
    setLocale("en");
</script>

<ArchiveItemCard {isTileView} {item} {onrestore} {pending} />
