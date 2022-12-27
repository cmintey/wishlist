import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const main = async () => {
	const roleCount = await prisma.role.count();
	if (roleCount == 0) {
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

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);

		await prisma.$disconnect();
		process.exit(1);
	});
