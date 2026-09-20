import { lookup } from "dns/promises";
import { logger as baseLogger } from "./logger";
import ipaddr, { IPv4, IPv6 } from "ipaddr.js";
import { env } from "$env/dynamic/private";

const logger = baseLogger.child({}, { msgPrefix: "[SAFEURL] " });

const allowedProtocols = new Set(["https:", "http:"]);

const allowedIps = parseAllowableIps();

interface RangeList<T> {
    [rangeName: string]: [T, number] | [T, number][];
}

export async function getSafeUrl(url: string | URL): Promise<URL | null> {
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch {
        logger.debug({ url }, "Not a valid url");
        return null;
    }

    logger.debug({ parsedUrl }, "Parsed url");

    if (!allowedProtocols.has(parsedUrl.protocol)) {
        logger.debug({ url }, "Url does not have http: or https: protocol");
        return null;
    }

    let ip: string;
    if (!ipaddr.isValid(parsedUrl.hostname)) {
        const resolvedAddress = await lookup(parsedUrl.hostname);
        ip = resolvedAddress.address;
    } else {
        ip = parsedUrl.hostname;
    }

    try {
        const processedIp = ipaddr.process(ip);
        logger.debug(
            { ip: processedIp.toString(), type: processedIp.kind(), range: processedIp.range() },
            "Resolved IP address"
        );

        const normalizedUrl = new URL(
            parsedUrl.protocol + "//" + parsedUrl.host + parsedUrl.pathname + parsedUrl.search + parsedUrl.hash
        );
        if (processedIp.range() !== "unicast") {
            if (ipaddr.subnetMatch(processedIp, allowedIps) === "allowList") {
                logger.debug({ url, ip: processedIp.toString() }, "Url resolves to a IP address within the allow list");

                try {
                    return normalizedUrl;
                } catch {
                    return null;
                }
            }

            logger.debug(
                { url, ip: processedIp.toString() },
                "Url resolves to an IP address that is not in the public ranges"
            );
            return null;
        }

        return normalizedUrl;
    } catch (err) {
        logger.error({ err }, "Error while checking IP against private ranges");
    }

    return null;
}

function parseAllowableIps(): RangeList<IPv4 | IPv6> {
    const allowedIpStrings = env.ALLOWED_IPS?.split(",") || [];
    const allowedIps = allowedIpStrings
        .map((ip) => {
            if (ipaddr.isValid(ip)) {
                return [ipaddr.parse(ip), 32] as [IPv4 | IPv6, number];
            } else if (ipaddr.isValidCIDR(ip)) {
                return ipaddr.parseCIDR(ip);
            } else {
                logger.warn({ ip }, "IP address specified in ALLOWED_IPS is not a valid IPv4 or IPv6 address or CIDR");
                return null;
            }
        })
        .filter((ip) => ip !== null);
    return {
        allowList: allowedIps
    };
}
