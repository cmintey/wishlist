<script lang="ts">
    import type { User } from "@prisma/client";
    import BaseChip from "./BaseChip.svelte";
    import { defaultLang, getFormatter, getLocale } from "$lib/i18n";
    import type { ClassValue } from "svelte/elements";

    type PartialUser = Pick<User, "id" | "name" | "picture">;

    interface Props {
        users: PartialUser[];
        class?: ClassValue;
    }

    const props: Props = $props();
    const t = getFormatter();
    const locale = getLocale();

    const users = $state(props.users);

    const prefix = "ion:people";
    const searchParam = "users";
    const defaultOption: Option = {
        value: "",
        displayValue: $t("general.all")
    };
    const options: Option[] = [defaultOption, ...getUniqueUsers(users)];

    function getUniqueUsers(users: PartialUser[]) {
        const uniqueIds = new Set();
        return users
            .filter((u) => {
                const unique = !uniqueIds.has(u.id);
                if (unique) uniqueIds.add(u.id);
                return unique;
            })
            .map((user) => ({ value: user.id, displayValue: user.name }) as Option)
            .toSorted((a, b) => a.displayValue.localeCompare(b.displayValue, locale || defaultLang.code));
    }
</script>

<BaseChip class={props.class} {defaultOption} multiselect {options} {prefix} {searchParam} testId="list-filter" />
