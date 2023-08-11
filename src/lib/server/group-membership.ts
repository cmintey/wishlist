import { redirect } from "@sveltejs/kit";
import type { User } from "lucia";
import { client } from "./prisma";

export const getActiveMembership = async (user: User) => {
	let activeMembership = await client.userGroupMembership.findFirst({
		where: {
			userId: user.userId,
			active: true
		}
	});

	if (!activeMembership) {
		const membership = await client.userGroupMembership.findFirst({
			where: {
				userId: user.userId
			}
		});
		if (!membership) {
			throw redirect(302, "/group-error");
		}
		await client.userGroupMembership.update({
			where: {
				id: membership.id
			},
			data: {
				active: true
			}
		});
		activeMembership = membership;
	}

	return activeMembership;
};
