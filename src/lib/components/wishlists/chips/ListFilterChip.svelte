<script lang="ts">
    import type { User } from "@prisma/client";
    import BaseChip from "./BaseChip.svelte";
    import { locale } from "svelte-i18n";

    type PartialUser = Pick<User, "id" | "name">;

    interface Props {
        users: PartialUser[];
    }

    const props: Props = $props();
    const users = $state(props.users);

    const searchParam = "users";
    const defaultOption: Option = {
        value: "",
        displayValue: "All"
    };
    const options: Option[] = [
        defaultOption,
        ...users
            .map((user) => ({ value: user.id, displayValue: user.name }) as Option)
            .toSorted((a, b) => a.displayValue.localeCompare(b.displayValue, $locale || "en-US"))
    ];
</script>

<BaseChip {defaultOption} {options} {searchParam} />
