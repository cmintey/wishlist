import { scryptAsync } from "@noble/hashes/scrypt";
import { constantTimeEqual } from "@oslojs/crypto/subtle";
import { decodeHex, encodeHexLowerCase } from "@oslojs/encoding";

const generateScryptKey = async (data: string, salt: string, blockSize = 16) => {
    const encodedData = new TextEncoder().encode(data);
    const encodedSalt = new TextEncoder().encode(salt);

    const keyUint8Array = await scryptAsync(encodedData, encodedSalt, {
        N: 16384,
        r: blockSize,
        p: 1,
        dkLen: 64
    });

    return new Uint8Array(keyUint8Array);
};

export const hashPassword = async (password: string) => {
    const salt = encodeHexLowerCase(crypto.getRandomValues(new Uint8Array(16)));
    const key = await generateScryptKey(password.normalize("NFKC"), salt);
    return `s2:${salt}:${encodeHexLowerCase(key)}`;
};

export const verifyPasswordHash = async (hash: string, password: string) => {
    const parts = hash.split(":");
    if (parts.length === 2) {
        const [salt, key] = parts;
        const targetKey = await generateScryptKey(password.normalize("NFKC"), salt, 8);
        const result = constantTimeEqual(targetKey, decodeHex(key));
        return result;
    }
    if (parts.length !== 3) return false;
    const [version, salt, key] = parts;
    if (version === "s2") {
        const targetKey = await generateScryptKey(password.normalize("NFKC"), salt);
        return constantTimeEqual(targetKey, decodeHex(key));
    }
    return false;
};
