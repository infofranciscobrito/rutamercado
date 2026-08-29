import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

// Short URL: /navimarketath -> ATH Móvil portal (302 so the target can change later)
const ATH_MOVIL_TARGET =
  "https://portal.athmovil.com/navimarket/#vendors?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAcGRvZgJleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAadgc6gFjBt5LdY7uxT25IBClvGiYSGO0hHEemGnLz6J-T3TokbdBQAohxCH6A_aem_9tVJLc8N8Wwx3nxE-jRjbg";

// Track each short-URL hit in page_views (fire-and-forget, service role).
function trackShortUrlHit(request: Request, env: unknown, ctx: unknown): void {
  const e = (env ?? {}) as Record<string, string | undefined>;
  const url = e.SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = e.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  const insert = fetch(`${url}/rest/v1/page_views`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      prefer: "return=minimal",
    },
    body: JSON.stringify({
      page: "/navimarketath",
      referrer: request.headers.get("referer"),
      user_agent: request.headers.get("user-agent"),
    }),
  }).catch((err) => console.error("short-url tracking failed:", err));

  const waitUntil = (ctx as { waitUntil?: (p: Promise<unknown>) => void } | null)?.waitUntil;
  if (waitUntil) waitUntil.call(ctx, insert);
}

function shortUrlRedirect(request: Request, env: unknown, ctx: unknown): Response | undefined {
  const path = new URL(request.url).pathname.replace(/\/+$/, "").toLowerCase();
  if (path !== "/navimarketath") return undefined;
  trackShortUrlHit(request, env, ctx);
  return new Response(null, {
    status: 302,
    headers: { location: ATH_MOVIL_TARGET, "cache-control": "max-age=300" },
  });
}

// 301 www.example.com/path -> example.com/path (preserves path + query)
function wwwRedirect(request: Request): Response | undefined {
  const url = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  if (!host.toLowerCase().startsWith("www.")) return undefined;

  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const target = `${proto}://${host.slice(4)}${url.pathname}${url.search}`;
  return new Response(null, {
    status: 301,
    headers: { location: target, "cache-control": "max-age=300" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const redirectResponse = wwwRedirect(request) ?? shortUrlRedirect(request, env, ctx);
      if (redirectResponse) return redirectResponse;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};

