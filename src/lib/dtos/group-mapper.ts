import { Role } from "$lib/schema";
import type { Group, Role as RoleModel } from "$lib/generated/prisma/client";

export const toGroupInformation = (membership: {
    group: Group;
    active: boolean;
    role: RoleModel;
}): GroupInformation => {
    return {
        ...membership.group,
        active: membership.active,
        isManager: membership.role.id === Role.GROUP_MANAGER || membership.role.id === Role.ADMIN
    };
};
