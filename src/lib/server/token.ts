const { randomBytes, createHash } = await import("node:crypto");

export const generateToken = (): Promise<string> => {
	return new Promise((resolve, reject) =>
		randomBytes(48, (err, buffer) => {
			if (err) {
				reject(err.message);
			} else {
				const token = buffer.toString("hex");
				resolve(token);
			}
		})
	);
};

export const hashToken = (token: string): string => {
	return createHash("sha3-256").update(token).digest("hex");
};

export default generateToken;
