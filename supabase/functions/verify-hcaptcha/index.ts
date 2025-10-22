import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, apikey, X-Client-Info, X-Supabase-Api-Version",
};

interface VerifyRequest {
  token: string;
}

interface HCaptchaResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

const HCAPTCHA_VERIFY_URL = "https://hcaptcha.com/siteverify";

const handler = async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  const secret = Deno.env.get("HCAPTCHA_SECRET");
  if (!secret) {
    console.error("[verify-hcaptcha] Missing HCAPTCHA_SECRET environment");
    return new Response(
      JSON.stringify({ success: false, error: "Server misconfiguration" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  let body: VerifyRequest | null = null;
  try {
    body = (await request.json()) as VerifyRequest;
  } catch (err) {
    console.error("[verify-hcaptcha] Invalid JSON body", err);
    return new Response(
      JSON.stringify({ success: false, error: "Invalid JSON body" }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  if (!body?.token) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing hCaptcha token" }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", body.token);

  let verification: HCaptchaResponse;
  try {
    const verifyResponse = await fetch(HCAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    verification = (await verifyResponse.json()) as HCaptchaResponse;
    console.log("[verify-hcaptcha] Verification response", verification);
  } catch (err) {
    console.error("[verify-hcaptcha] Verification request failed", err);
    return new Response(
      JSON.stringify({ success: false, error: "Verification request failed" }),
      {
        status: 502,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  if (!verification.success) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Verification failed",
        codes: verification["error-codes"] ?? [],
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
};

Deno.serve(handler);
