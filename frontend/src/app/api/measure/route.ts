export const runtime = "nodejs";

const APP_BASE = (process.env.DATABRICKS_APP_BASE ?? "").replace(/\/+$/, "");
const WORKSPACE_HOST = (process.env.DATABRICKS_WORKSPACE_HOST ?? "").replace(/\/+$/, "");
const CLIENT_ID = process.env.DATABRICKS_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.DATABRICKS_CLIENT_SECRET ?? "";

let cachedToken: string | null = null;
let cachedExpiryMs = 0;

async function getAccessToken(): Promise<string> {
    const now = Date.now();
    if (cachedToken && cachedExpiryMs - now > 60_000) {
        return cachedToken;
    }

    if (!WORKSPACE_HOST || !CLIENT_ID || !CLIENT_SECRET) {
        throw new Error("Missing Databricks OAuth environment variables.");
    }

    const tokenUrl = `${WORKSPACE_HOST}/oidc/oauth2/v2.0/token`;
    const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: "all-apis"
    });

    const res = await fetch(tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Token request failed (${res.status}): ${text || res.statusText}`);
    }

    const json = (await res.json()) as { access_token: string; expires_in?: number };
    if (!json.access_token) {
        throw new Error("Token response missing access_token.");
    }

    cachedToken = json.access_token;
    cachedExpiryMs = now + Math.max(60, json.expires_in ?? 3600) * 1000;
    return cachedToken;
}

export async function POST(req: Request): Promise<Response> {
    if (!APP_BASE) {
        return new Response("Missing DATABRICKS_APP_BASE.", { status: 500 });
    }

    let token: string;
    try {
        token = await getAccessToken();
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to get access token.";
        return new Response(message, { status: 500 });
    }

    const form = await req.formData();
    const res = await fetch(`${APP_BASE}/measure`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: form
    });

    const contentType = res.headers.get("content-type") ?? "application/json";
    const payload = await res.text();

    return new Response(payload, {
        status: res.status,
        headers: {
            "Content-Type": contentType
        }
    });
}
