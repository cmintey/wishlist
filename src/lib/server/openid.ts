import * as client from "openid-client";
import { getConfig } from "./config";
import { error, redirect, type RequestEvent } from "@sveltejs/kit";
import { z } from "zod";
import { getFormatter } from "$lib/i18n";

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
    url: z.string().url()
});

async function getClientConfig(config?: Config) {
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
        oidcConfig = await client.discovery(new URL(discoveryUrl), clientId, clientSecret);
        return oidcConfig;
    }
    return oidcConfig;
}

export async function isOIDCConfigured() {
    return (await getClientConfig()) !== null;
}

export async function getOIDCConfig() {
    const config = await getConfig();
    const clientConfig = await getClientConfig(config);
    return {
        ready: clientConfig !== null,
        providerName: config.oidc.providerName,
        autoRedirect: config.oidc.autoRedirect
    };
}

export async function authorizeRedirect(event: RequestEvent) {
    const $t = await getFormatter();
    const config = await getClientConfig();
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
    const $t = await getFormatter();
    const config = await getClientConfig();
    if (!config) {
        error(400, $t("auth.oidc-client-not-configured"));
    }

    const expectedNonce = event.cookies.get(NONCE_COOKIE) ?? null;
    const expectedState = event.cookies.get(STATE_COOKIE) ?? null;
    const codeVerifier = event.cookies.get(CODE_VERIFIER_COOKIE) ?? null;
    if (codeVerifier === null || expectedNonce === null || expectedState === null) {
        error(400, $t("auth.couldnt-retrieve-stored-oidc-state"));
    }

    let tokens;
    try {
        const data = await event.request.json().then(callbackSchema.safeParse);
        if (!data.success) {
            error(400, $t("auth.no-callback-url-supplied"));
        }
        tokens = await client.authorizationCodeGrant(config, new URL(data.data.url), {
            pkceCodeVerifier: codeVerifier,
            expectedNonce,
            expectedState,
            idTokenExpected: true
        });
    } catch (e) {
        console.error(e);
        let status = 400;
        let message: string | undefined;
        if (e instanceof client.ResponseBodyError) {
            status = e.status;
            message = e.error_description || e.message;
        } else if (e instanceof client.AuthorizationResponseError) {
            message = e.error_description || e.message;
        } else if (e instanceof client.ClientError) {
            message = e.message;
        }
        error(status, message || $t("general.oops"));
    }

    const claims = tokens.claims();
    if (!claims) {
        error(400, $t("auth.no-claims-found"));
    }

    return await client.fetchUserInfo(config, tokens.access_token, claims.sub);
}

export function errorRedirect(message: string): never {
    redirect(303, "/login?error=" + message);
}
