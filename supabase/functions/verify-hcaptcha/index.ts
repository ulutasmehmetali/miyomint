declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

type HeadersInitLike = Headers | Record<string, string> | Array<[string, string]>;

type ResponseInitLike = {
  status?: number;
  statusText?: string;
  headers?: HeadersInitLike;
};

interface HCaptchaVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  credit?: boolean;
}

const corsHeaders = new Headers({
  "Access-Control-Allow-Origin": "https://www.miyomint.com.tr",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-supabase-api-version",
  "Access-Control-Allow-Credentials": "true"
});

const jsonResponse = (body: unknown, init: ResponseInitLike = {}): Response => {
  const headers = new Headers(init.headers ?? undefined);
  corsHeaders.forEach((value, key) => {
    if (!headers.has(key)) headers.set(key, value);
  });
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(body), { ...init, headers });
};

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, { status: 405 });
    }

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return jsonResponse({ error: "Invalid content-type" }, { status: 400 });
    }

    const body = (await req.json()) as { token?: unknown };
    const token = typeof body.token === "string" ? body.token : undefined;
    if (!token) {
      return jsonResponse({ error: "Missing token" }, { status: 400 });
    }

    const secret = Deno.env.get("HCAPTCHA_SECRET");
    if (!secret) {
      console.error("[verify-hcaptcha] HCAPTCHA_SECRET not set");
      return jsonResponse({ error: "Server misconfiguration" }, { status: 500 });
    }

    const params = new URLSearchParams();
    params.set("secret", secret);
    params.set("response", token);

    const verifyRes = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    const verifyBody = (await verifyRes.json()) as HCaptchaVerifyResponse;

    const payload = {
      data: { success: Boolean(verifyBody?.success) },
      verify: {
        provider: "hcaptcha",
        status: verifyRes.status,
        body: verifyBody
      }
    };

    return jsonResponse(payload, { status: 200 });
  } catch (error) {
    console.error("[verify-hcaptcha] unexpected error", error);
    return jsonResponse({ error: "Internal server error" }, { status: 500 });
  }
});
