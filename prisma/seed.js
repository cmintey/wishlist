import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const roles = async () => {
	const roleCount = await prisma.role.count();
	if (roleCount === 0) {
		const userRole = await prisma.role.create({
			data: {
				id: 1,
				name: "USER"
			}
		});
		const adminRole = await prisma.role.create({
			data: {
				id: 2,
				name: "ADMIN"
			}
		});
		console.log("roles added");
		console.log({ userRole, adminRole });
	} else {
		console.log("roles already added");
	}
};

const groups = async () => {
	const groupCount = await prisma.group.count();
	const userCount = await prisma.user.count();

	if (userCount > 0 && groupCount === 0) {
		const defaultGroup = await prisma.group.create({
			data: {
				name: "Default"
			}
		});

		const allUsers = await prisma.user.findMany();
		for (const user of allUsers) {
			await prisma.userGroupMembership.create({
				data: {
					active: true,
					user: {
						connect: {
							id: user.id
						}
					},
					group: {
						connect: {
							id: defaultGroup.id
						}
					}
				}
			});
		}

		const allItems = await prisma.item.findMany();
		for (const item of allItems) {
			await prisma.item.update({
				where: {
					id: item.id
				},
				data: {
					group: {
						connect: {
							id: defaultGroup.id
						}
					}
				}
			});
		}
	} else {
		console.log("skipping default group creation");
	}
};

const main = async () => {
	await roles();
	await groups();
};

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);

		await prisma.$disconnect();
		process.exit(1);
	});
