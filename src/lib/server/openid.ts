import * as client from "openid-client";
import { getConfig } from "./config";
import { error, type RequestEvent } from "@sveltejs/kit";

const SCOPE = "openid profile email";
const CODE_CHALLENGE_METHOD = "S256";
const NONCE_COOKIE = "oidc_nonce";
const STATE_COOKIE = "oidc_state";
const CODE_VERIFIER_COOKIE = "oidc_code_verifier";
const COOKIE_EXPIRY_SECONDS = 60 * 10; // 10 minutes

let discoveryUrl: string | null = null;
let clientId: string | null = null;
let clientSecret: string | null = null;
let oidcConfig: client.Configuration | null = null;

async function getOIDCConfig() {
    let rediscover = false;
    const config = await getConfig(undefined, true);
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
    return (await getOIDCConfig()) !== null;
}

export async function authorizeRedirect(event: RequestEvent) {
    const config = await getOIDCConfig();
    if (!config) {
        return Response.json({ message: "OIDC client not configured" }, { status: 400 });
    }

    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const nonce = client.randomNonce();
    const state = client.randomState();

    const parameters: Record<string, string> = {
        redirect_uri: new URL("/login/oidc/callback", event.url.origin).toString(),
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

    const redirectTo = client.buildAuthorizationUrl(config, parameters);
    return new Response(null, {
        status: 302,
        headers: {
            Location: redirectTo.toString()
        }
    });
}

export async function handleCallback(event: RequestEvent) {
    const config = await getOIDCConfig();
    if (!config) {
        error(400, "OIDC client not configured");
    }

    const expectedNonce = event.cookies.get(NONCE_COOKIE) ?? null;
    const expectedState = event.cookies.get(STATE_COOKIE) ?? null;
    const codeVerifier = event.cookies.get(CODE_VERIFIER_COOKIE) ?? null;
    if (codeVerifier === null || expectedNonce === null || expectedState === null) {
        error(400, "Couldn't retrieve stored OIDC state");
    }

    let tokens;
    try {
        tokens = await client.authorizationCodeGrant(config, event.request, {
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
        error(status, message || "Something went wrong");
    }

    const claims = tokens.claims();
    if (!claims) {
        error(400, "No claims found");
    }

    return await client.fetchUserInfo(config, tokens.access_token, claims.sub);
}
