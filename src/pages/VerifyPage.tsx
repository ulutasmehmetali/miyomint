import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Loader2, XCircle, Mail } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { supabase, SUPABASE_ANON_KEY, SUPABASE_URL } from "../lib/supabaseClient";
import { buildVerifyRedirectUrl, VERIFY_REDIRECT_PARAM, VERIFY_REDIRECT_VALUE } from "../utils/verifyRedirect";
import type { VerifyOtpParams } from "@supabase/supabase-js";

type VerifyState = "loading" | "success" | "error" | "expired";
type OtpType =
  | "signup"
  | "magiclink"
  | "recovery"
  | "email_change"
  | "invite"
  | "sms";

const buildParams = () => {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(window.location.search);
  const merged = new URLSearchParams();

  hashParams.forEach((value, key) => merged.set(key, value));
  searchParams.forEach((value, key) => {
    if (!merged.has(key)) {
      merged.set(key, value);
    }
  });

  return merged;
};

const decodeJwt = (token: string) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    return JSON.parse(json) as {
      sub: string;
      email?: string;
      exp?: number;
      [key: string]: any;
    };
  } catch (error) {
    console.error("[Verify] JWT decode failed", error);
    return null;
  }
};

const updateProfileVerification = async (
  userId: string,
  accessToken: string,
  email?: string,
  fullName?: string
) => {
  const url = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`;
  console.log("[Verify] updating profile via REST", { url, userId });

  const headers = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${accessToken}`,
    Prefer: "return=representation",
  };

  const response = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      email_verified: true,
      verified_at: new Date().toISOString(),
    }),
  });

  const text = await response.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch (_err) {
    parsed = text;
  }

  console.log("[Verify] profile update response", {
    status: response.status,
    ok: response.ok,
    body: parsed,
  });

  if (response.ok) {
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0];
    }
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
  }

  if (response.status === 406 || response.status === 409) {
    console.log("[Verify] update returned", response.status, "fetching existing profile");
    const fetchResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
          Prefer: "return=representation",
        },
      }
    );

    const fetchText = await fetchResponse.text();
    let fetchParsed: unknown = null;
    try {
      fetchParsed = fetchText ? JSON.parse(fetchText) : null;
    } catch (_err) {
      fetchParsed = fetchText;
    }

    console.log("[Verify] profile fetch response (update fallback)", {
      status: fetchResponse.status,
      ok: fetchResponse.ok,
      body: fetchParsed,
    });

    if (Array.isArray(fetchParsed) && fetchParsed.length > 0) {
      return fetchParsed[0];
    }
    if (fetchResponse.ok && fetchParsed && typeof fetchParsed === "object") {
      return fetchParsed as Record<string, unknown>;
    }
    // fall through to insert if fetch didn't return data
  } else if (response.status !== 404) {
    throw new Error(
      typeof parsed === "string"
        ? parsed
        : (parsed as any)?.message || "Profil güncellenemedi."
    );
  }

  const createPayload = {
    id: userId,
    email: email || "",
    full_name: fullName || "",
    created_at: new Date().toISOString(),
    email_verified: true,
    verified_at: new Date().toISOString(),
  };

  console.log("[Verify] update returned empty, creating profile via REST", createPayload);

  const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers,
    body: JSON.stringify(createPayload),
  });

  const createText = await createResponse.text();
  let createParsed: unknown = null;
  try {
    createParsed = createText ? JSON.parse(createText) : null;
  } catch (_err) {
    createParsed = createText;
  }

  console.log("[Verify] profile create response", {
    status: createResponse.status,
    ok: createResponse.ok,
    body: createParsed,
  });

  if (!createResponse.ok && createResponse.status !== 409) {
    throw new Error(
      typeof createParsed === "string"
        ? createParsed
        : (createParsed as any)?.message || "Profil oluşturulamadı."
    );
  }

  if (createResponse.status === 409) {
    console.log("[Verify] duplicate on insert, fetching existing profile");
    const fetchResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
          Prefer: "return=representation",
        },
      }
    );

    const fetchText = await fetchResponse.text();
    let fetchParsed: unknown = null;
    try {
      fetchParsed = fetchText ? JSON.parse(fetchText) : null;
  } catch (_err) {
    fetchParsed = fetchText;
    }

    console.log("[Verify] profile fetch response (insert fallback)", {
      status: fetchResponse.status,
      ok: fetchResponse.ok,
      body: fetchParsed,
    });

    if (Array.isArray(fetchParsed) && fetchParsed.length > 0) {
      return fetchParsed[0];
    }

    return createPayload;
  }

  if (Array.isArray(createParsed) && createParsed.length > 0) {
    return createParsed[0];
  }

  return createPayload;
};

export default function VerifyPage() {
  const [status, setStatus] = useState<VerifyState>("loading");
  const [resending, setResending] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const params = useMemo(buildParams, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.get(VERIFY_REDIRECT_PARAM) === VERIFY_REDIRECT_VALUE) {
      currentUrl.searchParams.delete(VERIFY_REDIRECT_PARAM);
      const search = currentUrl.searchParams.toString();
      const next = `${currentUrl.pathname}${search ? `?${search}` : ""}${currentUrl.hash}`;
      window.history.replaceState({}, "", next);
    }
  }, []);

  const transitionStatus = (next: VerifyState, reason?: string) => {
    console.log(`[Verify] status ${status} -> ${next}`, reason ?? "");
    setStatus(next);
  };

  useEffect(() => {
    const redirectToHome = () => {
      console.log("[Verify] scheduling redirect to home");
      setTimeout(() => {
        console.log("[Verify] redirecting to home");
        window.location.replace("/");
      }, 2500);
    };

    const handleSuccess = (email: string | null, reason?: string) => {
      console.log("[Verify] handleSuccess", { email, reason });
      if (email) {
        setUserEmail(email);
      }

      toast.success("E-posta başarıyla doğrulandı!", {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
        duration: 2500,
      });

      transitionStatus("success", reason);
      redirectToHome();
    };

    const handleExpired = (message?: string) => {
      console.warn("[Verify] link expired", message);
      transitionStatus("expired", message);
    };

    const handleError = (message?: string) => {
      console.error("[Verify] verification error", message);
      transitionStatus("error", message);
    };

    const handleTokenVerification = async (
      accessToken: string,
      refreshToken: string | null
    ) => {
      console.log("[Verify] handling session-based verification");
      const decoded = decodeJwt(accessToken);
      console.log("[Verify] decoded access token", decoded);

      if (!decoded?.sub) {
        handleError("Token içerisinden kullanıcı bilgisi alınamadı.");
        return;
      }

      try {
          await updateProfileVerification(
            decoded.sub,
            accessToken,
            decoded.email || params.get("email") || undefined
          );
      } catch (profileErr: any) {
        console.error("[Verify] profile update error", profileErr);
        handleError(profileErr?.message || "Profil güncellenemedi.");
        return;
      }

      if (refreshToken) {
        supabase.auth
          .setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          .then((sessionResult) => {
            console.log("[Verify] setSession async result", sessionResult);
          })
          .catch((sessionErr) => {
            console.error("[Verify] setSession async error", sessionErr);
          });
      }

      handleSuccess(decoded.email || params.get("email"), "token-branch");
    };

    const startVerification = async () => {
      const paramObject = Object.fromEntries(params.entries());
      console.log("[Verify] starting verification with params", paramObject);

      try {
        const errorCode = params.get("error_code");
        const errorDescription = params.get("error_description") || "";

        if (errorCode) {
          console.warn("[Verify] error parameters detected", {
            errorCode,
            errorDescription,
          });
          if (errorDescription.toLowerCase().includes("expired")) {
            handleExpired(errorDescription);
          } else {
            handleError(errorDescription);
          }
          return;
        }

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken) {
          await handleTokenVerification(accessToken, refreshToken);
          return;
        }

        const tokenHash = params.get("token_hash");
        const token = params.get("token");
        if (tokenHash || token) {
          console.log("[Verify] handling verifyOtp flow", { tokenHash, token });
          const typeParam = (params.get("type") || "signup").toLowerCase();
          const otpType: OtpType = [
            "signup",
            "magiclink",
            "recovery",
            "email_change",
            "invite",
            "sms",
          ].includes(typeParam as OtpType)
            ? (typeParam as OtpType)
            : "signup";

          const emailParam =
            params.get("email") || params.get("email_address") || undefined;

          if (!tokenHash && !token) {
            handleError("Doğrulama tokenı alınamadı.");
            return;
          }

          const verifyType = otpType as VerifyOtpParams["type"];
          const verifyPayload = (tokenHash
            ? {
                type: verifyType,
                token_hash: tokenHash,
                email: emailParam,
              }
            : {
                type: verifyType,
                token: token as string,
                email: emailParam,
              }) as VerifyOtpParams;

          console.log("[Verify] verifyOtp payload", verifyPayload);
          const { data, error } = await supabase.auth.verifyOtp(verifyPayload);
          console.log("[Verify] verifyOtp response", { data, error });

          if (error) {
            if (error.message.toLowerCase().includes("expired")) {
              handleExpired(error.message);
            } else {
              handleError(error.message);
            }
            return;
          }

          const verifiedUser = data?.user ?? null;
          console.log("[Verify] verifyOtp user", verifiedUser);
          if (!verifiedUser) {
            handleError("Kullanıcı bilgisi alınamadı.");
            return;
          }

          const sessionAccessToken = data.session?.access_token;
          const fallbackAccessToken =
            sessionAccessToken || (token ? (token as string) : "");

          if (!fallbackAccessToken) {
            console.warn("[Verify] no access token available for profile sync");
          } else {
            try {
              await updateProfileVerification(
                verifiedUser.id,
                fallbackAccessToken,
                verifiedUser.email || emailParam || undefined,
                verifiedUser.user_metadata?.full_name
              );
            } catch (profileErr: any) {
              console.error("[Verify] profile update error (otp flow)", profileErr);
              handleError(profileErr?.message || "Profil güncellenemedi.");
              return;
            }
          }

          handleSuccess(
            verifiedUser.email || emailParam || null,
            "verify-otp-branch"
          );
          return;
        }

        console.log("[Verify] attempting fallback getSession");
        const { data } = await supabase.auth.getSession();
        console.log("[Verify] fallback session data", data);
        const fallbackSession = data.session;
        const fallbackUser = fallbackSession?.user;
        if (fallbackUser && fallbackSession?.access_token) {
          try {
            await updateProfileVerification(
              fallbackUser.id,
              fallbackSession.access_token,
              fallbackUser.email ?? params.get("email") ?? undefined,
              fallbackUser.user_metadata?.full_name
            );
          } catch (fallbackError) {
            console.error("[Verify] fallback session profile sync error", fallbackError);
          }
          handleSuccess(fallbackUser.email ?? params.get("email"), "fallback-session");
          return;
        }

        handleError("Doğrulama için gerekli parametreler bulunamadı.");
      } catch (err: any) {
        console.error("[Verify] unexpected exception", err);
        if (
          typeof err?.message === "string" &&
          err.message.toLowerCase().includes("expired")
        ) {
          handleExpired(err.message);
        } else {
          handleError(err?.message || String(err));
        }
      }
    };

    startVerification();
  }, [params]);

  const resendVerification = async () => {
    console.log("[Verify] resend requested");
    setResending(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      console.log("[Verify] getUser for resend", { user, userError });

      if (userError || !user?.email) {
        toast.error("Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.");
        return;
      }

      setUserEmail(user.email);

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo: buildVerifyRedirectUrl(),
        },
      });

      if (error) {
        console.error("[Verify] resend error", error);
        toast.error("Yeni bağlantı gönderilemedi: " + error.message);
      } else {
        console.log("[Verify] resend succeeded");
        toast.success(
          `Yeni doğrulama bağlantısı ${user.email} adresine gönderildi.`
        );
      }
    } finally {
      setResending(false);
      console.log("[Verify] resend finished");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white text-center">
      <Toaster position="top-right" />

      {status === "loading" && (
        <div className="bg-white p-8 rounded-2xl shadow-lg w-80">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            E-posta doğrulama işlemi yapılıyor...
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-green-100">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4 animate-bounce" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Doğrulama Başarılı
          </h1>
          <p className="text-gray-600 mb-4">
            E-posta adresiniz doğrulandı, hesabınız aktif hale getirildi.
          </p>
          {userEmail && (
            <p className="text-sm text-gray-500 mb-2">{userEmail}</p>
          )}
          <div className="text-sm text-gray-400 animate-pulse">
            Ana sayfaya yönlendiriliyorsunuz...
          </div>
        </div>
      )}

      {status === "expired" && (
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-yellow-100">
          <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Bağlantının Süresi Dolmuş
          </h1>
          <p className="text-gray-600 mb-6">
            Lütfen yeni bir doğrulama bağlantısı alın.
          </p>
          <button
            onClick={resendVerification}
            disabled={resending}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              resending
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}
          >
            <Mail className="w-5 h-5" />
            {resending ? "Gönderiliyor..." : "Yeni bağlantı gönder"}
          </button>
          <div className="mt-4">
            <a
              href="/"
              className="text-teal-600 hover:underline text-sm font-medium"
            >
              Ana sayfaya dön
            </a>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-red-100">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Doğrulama Başarısız
          </h1>
          <p className="text-gray-600 mb-6">
            Bağlantı hatalı veya geçersiz. <br /> Lütfen yeni bir doğrulama
            e-postası alın.
          </p>
          <a
            href="/"
            className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
          >
            Ana sayfaya dön
          </a>
        </div>
      )}
    </div>
  );
}
