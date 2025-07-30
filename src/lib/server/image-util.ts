import sharp from "sharp";
import { unlink } from "fs/promises";
import { logger } from "$lib/server/logger";
import { getRequestEvent } from "$app/server";
import { Readable } from "stream";
import { finished } from "stream/promises";
import type { ReadableStream } from "stream/web";
import { createWriteStream } from "node:fs";

const slugify = (str: string) => {
    return str
        .normalize("NFKD") // split accented characters into their base characters and diacritical marks
        .replace(/[\u0300-\u036f]/g, "") // remove all the accents, which happen to be all in the \u03xx UNICODE block.
        .trim() // trim leading or trailing whitespace
        .toLowerCase() // convert to lowercase
        .replace(/[^a-z0-9 -]/g, "") // remove non-alphanumeric characters
        .replace(/\s+/g, "-") // replace spaces with hyphens
        .substring(0, 64) // trim to a reasonable file name limit
        .replace(/-+/g, "-"); // remove consecutive hyphens
};

const fetchImage = async (imageUrl: string) => {
    try {
        const url = new URL(imageUrl);
        const resp = await getRequestEvent().fetch(url);
        if (resp.ok && resp.body) {
            return Readable.fromWeb(resp.body as unknown as ReadableStream<any>);
        } else {
            return null;
        }
    } catch {
        return null;
    }
};

export const isValidImage = (image: File) => {
    return image.size > 0 && image.size <= 5000000;
};

export const createImage = async (filename: string, image: File | string | null | undefined) => {
    if (!image) {
        return null;
    }

    let dataStream: Readable;
    if (typeof image === "string") {
        const res = await fetchImage(image);
        if (res) {
            dataStream = res;
        } else {
            return null;
        }
    } else if (isValidImage(image)) {
        dataStream = Readable.fromWeb(image.stream() as unknown as ReadableStream<any>);
    } else {
        return null;
    }

    try {
        const fname = slugify(filename) + "-" + Date.now().toString() + ".webp";
        const writeStream = createWriteStream(`uploads/${fname}`);
        const transformer = sharp().rotate().resize(300).webp();
        await finished(dataStream.pipe(transformer).pipe(writeStream));

        return fname;
    } catch (err) {
        logger.error({ err }, "Unable to write image to file");
    }

    return null;
};

export const deleteImage = async (filename: string): Promise<void> => {
    try {
        await unlink(`uploads/${filename}`);
    } catch (err) {
        logger.warn({ err }, "Unable to delete file: %s", filename);
    }
};

export const tryDeleteImage = async (imageUrl: string): Promise<void> => {
    try {
        new URL(imageUrl);
    } catch {
        await deleteImage(imageUrl);
    }
};
