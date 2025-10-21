import type { Attachment } from "svelte/attachments";

export const clipboard = (dataElementId: string): Attachment<HTMLButtonElement> => {
    return (element) => {
        if (window.isSecureContext) {
            element.addEventListener("click", () => {
                const data = document.getElementById(dataElementId)?.textContent;
                if (data) navigator.clipboard.writeText(data);
            });
        }
    };
};
