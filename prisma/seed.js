import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const main = async () => {
	const userRole = await prisma.role.create({
		data: {
			name: "USER"
		}
	});
	const adminRole = await prisma.role.create({
		data: {
			name: "ADMIN"
		}
	});
	console.log({ userRole, adminRole });
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
