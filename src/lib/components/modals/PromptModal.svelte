<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import type { HTMLInputAttributes } from "svelte/elements";
    import ConfirmModal from "./ConfirmModal.svelte";
    import type { ConfirmModalProps } from "./ConfirmModal.svelte";

    interface Props extends Omit<ConfirmModalProps, "title" | "onConfirm"> {
        title: string;
        onSubmit: (value: string | undefined) => void;
        inputProps?: Omit<HTMLInputAttributes, "value">;
    }

    const t = getFormatter();

    const { confirmText = $t("general.submit"), onSubmit, inputProps, ...rest }: Props = $props();

    let value: string | undefined = $state();
</script>

<ConfirmModal
    {confirmText}
    {...rest}
    onConfirm={() => {
        onSubmit(value);
        value = undefined;
    }}
>
    <input class="input" type="text" bind:value {...inputProps} />
</ConfirmModal>
