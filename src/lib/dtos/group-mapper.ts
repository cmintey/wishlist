import { Role } from "$lib/schema";

export const toGroupInformation = (membership: {
    id: string;
    name: string;
    active: boolean;
    roleId: number;
}): GroupInformation => {
    return {
        id: membership.id,
        name: membership.name,
        active: membership.active,
        isManager: membership.roleId === Role.GROUP_MANAGER || membership.roleId === Role.ADMIN
    };
};
