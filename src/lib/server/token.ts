import { env } from "$env/dynamic/private";

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

export const isTokenTimeValid = (tokenDate: Date) => {
    const expiresIn = (env.TOKEN_TIME ? Number.parseInt(env.TOKEN_TIME) : 72) * 3600000;
    const expiry = tokenDate.getTime() + expiresIn;
    return Date.now() < expiry;
};

export default generateToken;
