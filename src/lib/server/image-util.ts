import sharp from "sharp";

export const createImage = async (username: string, image: File): Promise<string | null> => {
	let filename = null;

	const create_image = image.size > 0 && image.size <= 5000000;

	if (create_image) {
		filename = username + "-" + Date.now().toString() + ".webp";
		const ab = await image.arrayBuffer();
		await sharp(ab).resize(300).webp().toFile(`uploads/${filename}`);
	}

	return filename;
};
