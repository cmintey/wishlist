<script lang="ts">
    import type { User } from "@prisma/client";
    import BaseChip from "./BaseChip.svelte";
    import { t, locale } from "svelte-i18n";

    type PartialUser = Pick<User, "id" | "name" | "picture">;

    interface Props {
        users: PartialUser[];
    }

    const props: Props = $props();
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
            .toSorted((a, b) => a.displayValue.localeCompare(b.displayValue, $locale || "en-US"));
    }
</script>

<BaseChip {defaultOption} multiselect {options} {prefix} {searchParam} />
