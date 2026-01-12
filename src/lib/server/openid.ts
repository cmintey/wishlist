import * as client from "openid-client";
import { getConfig } from "./config";
import { error, redirect, type RequestEvent } from "@sveltejs/kit";
import { z } from "zod";
import { getFormatter } from "$lib/server/i18n";
import { oidcLogger as logger } from "./logger";

const SCOPE = "openid profile email";
const CODE_CHALLENGE_METHOD = "S256";
const NONCE_COOKIE = "oidc_nonce";
const STATE_COOKIE = "oidc_state";
const CODE_VERIFIER_COOKIE = "oidc_code_verifier";
export const REDIRECT_TO_COOKIE = "redirectTo";
const COOKIE_EXPIRY_SECONDS = 60 * 10; // 10 minutes

let discoveryUrl: string | null = null;
let clientId: string | null = null;
let clientSecret: string | null = null;
let oidcConfig: client.Configuration | null = null;

const callbackSchema = z.object({
    url: z.url()
});

async function getClientConfig(fetch: RequestEvent["fetch"], config?: Config) {
    let rediscover = false;
    if (!config) {
        config = await getConfig(undefined, true);
    }
    if (!config.oidc.enable) {
        return null;
    }

    if (config.oidc.discoveryUrl !== discoveryUrl) {
        discoveryUrl = config.oidc.discoveryUrl;
        rediscover = true;
    }
    if (config.oidc.clientId !== clientId) {
        clientId = config.oidc.clientId;
        rediscover = true;
    }
    if (config.oidc.clientSecret !== clientSecret) {
        clientSecret = config.oidc.clientSecret;
        rediscover = true;
    }

    if (oidcConfig === null || rediscover) {
        try {
            oidcConfig = await client.discovery(new URL(discoveryUrl), clientId, clientSecret, undefined, {
                /** @ts-expect-error Fetch API compatability*/
                [client.customFetch]: fetch
            });
            return oidcConfig;
        } catch (e) {
            logger.warn(e, "Error during OIDC discovery");
        }
    }
    return oidcConfig;
}

export async function getOIDCConfig(fetch: RequestEvent["fetch"]) {
    const config = await getConfig();
    const clientConfig = await getClientConfig(fetch, config);
    return {
        ready: clientConfig !== null,
        providerName: config.oidc.providerName,
        autoRedirect: config.oidc.autoRedirect,
        enableSync: config.oidc.enableSync
    };
}

export async function authorizeRedirect(event: RequestEvent) {
    const $t = await getFormatter();
    const config = await getClientConfig(event.fetch);
    if (!config) {
        return Response.json({ message: $t("auth.oidc-client-not-configured") }, { status: 400 });
    }

    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const nonce = client.randomNonce();
    const state = client.randomState();
    const redirect = event.url.searchParams.get("redirectTo");

    const parameters: Record<string, string> = {
        redirect_uri: new URL("/login", event.url.origin).toString(),
        scope: SCOPE,
        code_challenge: codeChallenge,
        code_challenge_method: CODE_CHALLENGE_METHOD,
        nonce,
        state
    };

    event.cookies.set(NONCE_COOKIE, nonce, {
        path: "/",
        httpOnly: true,
        maxAge: COOKIE_EXPIRY_SECONDS,
        sameSite: "lax"
    });

    event.cookies.set(STATE_COOKIE, state, {
        path: "/",
        httpOnly: true,
        maxAge: COOKIE_EXPIRY_SECONDS,
        sameSite: "lax"
    });

    event.cookies.set(CODE_VERIFIER_COOKIE, codeVerifier, {
        path: "/",
        httpOnly: true,
        maxAge: COOKIE_EXPIRY_SECONDS,
        sameSite: "lax"
    });

    if (redirect) {
        event.cookies.set(REDIRECT_TO_COOKIE, redirect, {
            path: "/",
            httpOnly: true,
            maxAge: COOKIE_EXPIRY_SECONDS,
            sameSite: "lax"
        });
    }

    const redirectTo = client.buildAuthorizationUrl(config, parameters);
    return new Response(null, {
        status: 302,
        headers: {
            Location: redirectTo.toString()
        }
    });
}

export async function handleCallback(event: RequestEvent) {
    logger.debug("Initiating callback");
    const $t = await getFormatter();
    const config = await getClientConfig(event.fetch);
    if (!config) {
        logger.error("OIDC not configured");
        error(400, $t("auth.oidc-client-not-configured"));
    }

    const expectedNonce = event.cookies.get(NONCE_COOKIE) ?? null;
    const expectedState = event.cookies.get(STATE_COOKIE) ?? null;
    const codeVerifier = event.cookies.get(CODE_VERIFIER_COOKIE) ?? null;
    if (codeVerifier === null || expectedNonce === null || expectedState === null) {
        logger.error(
            { expectedNonce, expectedState, codeVerifier },
            "Couldn't retrieve stored one or more required OIDC state variables"
        );
        error(400, $t("auth.couldnt-retrieve-stored-oidc-state"));
    }

    let tokens;
    try {
        const data = await event.request.json().then(callbackSchema.safeParse);
        if (!data.success) {
            logger.error("Request did not contain the callback url");
            error(400, $t("auth.no-callback-url-supplied"));
        }
        tokens = await client.authorizationCodeGrant(config, new URL(data.data.url), {
            pkceCodeVerifier: codeVerifier,
            expectedNonce,
            expectedState,
            idTokenExpected: true
        });
    } catch (err) {
        logger.error({ err }, "Exception while handling callback");
        let status = 400;
        let message: string | undefined;
        if (err instanceof client.ResponseBodyError) {
            status = err.status;
            message = err.error_description || err.message;
        } else if (err instanceof client.AuthorizationResponseError) {
            message = err.error_description || err.message;
        } else if (err instanceof client.ClientError) {
            message = err.message;
        }
        error(status, message || $t("general.oops"));
    }

    const claims = tokens.claims();
    if (!claims) {
        logger.error("Claims were not found");
        error(400, $t("auth.no-claims-found"));
    }
    logger.debug("Successfully authorized callback for %s", claims.sub);
    logger.debug("Fetching user info for %s", claims.sub);

    return await client.fetchUserInfo(config, tokens.access_token, claims.sub);
}

export function errorRedirect(message: string): never {
    redirect(303, "/login?error=" + message);
}
