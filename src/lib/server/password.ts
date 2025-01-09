import { scryptAsync } from "@noble/hashes/scrypt";
import { constantTimeEqual } from "@oslojs/crypto/subtle";
import { decodeHex, encodeHexLowerCase } from "@oslojs/encoding";

const generateScryptKey = async (data: string, salt: string) => {
    const encodedData = new TextEncoder().encode(data);
    const encodedSalt = new TextEncoder().encode(salt);

    const keyUint8Array = await scryptAsync(encodedData, encodedSalt, {
        N: 16384,
        r: 8,
        p: 1,
        dkLen: 64
    });

    return new Uint8Array(keyUint8Array);
};

export const hashPassword = async (password: string) => {
    const salt = encodeHexLowerCase(crypto.getRandomValues(new Uint8Array(16)));
    const key = await generateScryptKey(password.normalize("NFKC"), salt);
    return `${salt}:${encodeHexLowerCase(key)}`;
};

export const verifyPasswordHash = async (password: string, hash: string) => {
    const parts = hash.split(":");
    if (parts.length !== 2) return false;

    const [salt, key] = parts;
    const targetKey = await generateScryptKey(password.normalize("NFKC"), salt);
    return constantTimeEqual(targetKey, decodeHex(key));
};
