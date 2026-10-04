import sharp from "sharp";
import { unlink } from "fs/promises";
import { logger } from "$lib/server/logger";
import { Readable } from "stream";
import { finished } from "stream/promises";
import { ReadableStream } from "stream/web";
import { createWriteStream } from "node:fs";
import { error } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { getSafeUrl } from "./safeurl";

const DEFAULT_MAX_IMAGE_SIZE = 5000000;

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

const fetchImage = async (imageUrl: string, redirectNum: number = 0) => {
    if (redirectNum === 5) {
        logger.error("Unable to fetch image after 5 redirects");
        return null;
    }
    try {
        const url = await getSafeUrl(imageUrl);
        if (!url) {
            logger.error("URL resolved to a private access - blocking the request.");
            return null;
        }
        const resp = await fetch(url, { redirect: "manual" });
        if (resp.type === "opaqueredirect" && resp.headers.has("Location")) {
            fetchImage(resp.headers.get("Location")!, redirectNum + 1);
        } else if (resp.ok && resp.body) {
            return Readable.fromWeb(resp.body as unknown as ReadableStream<any>);
        } else {
            return null;
        }
    } catch (err) {
        logger.error({ err }, "Failed to fetch image");
        return null;
    }
};

export const isValidImage = (image: File) => {
    const maxImageSize = env.MAX_IMAGE_SIZE
        ? Number.parseInt(env.MAX_IMAGE_SIZE) || DEFAULT_MAX_IMAGE_SIZE
        : DEFAULT_MAX_IMAGE_SIZE;
    return image.size > 0 && image.size <= maxImageSize;
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
        let failure = false;
        const fname = slugify(filename) + "-" + Date.now().toString() + ".webp";
        const writeStream = createWriteStream(`uploads/${fname}`);
        const transformer = sharp()
            .rotate()
            .resize(300)
            .webp()
            .on("error", (err) => {
                logger.error({ err }, "Unable to transform image");
                failure = true;
            });
        await finished(dataStream.pipe(transformer).pipe(writeStream));

        if (!failure) return fname;
    } catch (err) {
        logger.error({ err }, "Unable to write image to file");
    }

    error(422, "Unable to process image");
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
