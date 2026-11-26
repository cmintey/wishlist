import { flushSync, mount, unmount } from "svelte";
import ArchiveItemCardHarness from "./ArchiveItemCardHarness.svelte";

let card;
window.restoreCalls = [];
window.mountArchiveCard = async (props) => {
    if (card) await unmount(card);
    card = mount(ArchiveItemCardHarness, {
        target: document.body,
        props: { ...props, onrestore: (id) => window.restoreCalls.push(id) }
    });
    flushSync();
};
