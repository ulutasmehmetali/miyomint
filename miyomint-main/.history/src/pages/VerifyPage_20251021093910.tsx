import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle, Mail } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";
import { supabaseService } from "../lib/supabaseService";
import { getAppBaseUrl } from "../utils/url";

type VerifyState = "loading" | "success" | "error" | "expired";

const AUTH_PARAMS = [
  "code",
  "type",
  "access_token",
  "refresh_token",
  "expires_in",
  "expires_at",
  "token_type",
  "provider_token",
];

export default function VerifyPage() {
  const [status, setStatus] = useState<VerifyState>("loading");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const clearAuthParams = () => {
      if (!window || !window.history.replaceState) return;

      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(
        url.hash.startsWith("#") ? url.hash.substring(1) : ""
      );
      const searchParams = new URLSearchParams(url.search);

      AUTH_PARAMS.forEach((key) => {
        hashParams.delete(key);
        searchParams.delete(key);
      });

      const cleanHash = hashParams.toString();
      const cleanSearch = searchParams.toString();
      const cleanUrl =
        url.origin +
        url.pathname +
        (cleanSearch ? `?${cleanSearch}` : "") +
        (cleanHash ? `#${cleanHash}` : "");

      window.history.replaceState({}, document.title, cleanUrl);
    };

    const verifySession = async () => {
      try {
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(
          url.hash.startsWith("#") ? url.hash.substring(1) : ""
        );
        const searchParams = new URLSearchParams(url.search);
        const pickParam = (key: string) =>
          hashParams.get(key) ?? searchParams.get(key) ?? undefined;

        const code = pickParam("code");
        const accessToken = pickParam("access_token");
        const refreshToken = pickParam("refresh_token");

        let sessionUser = null;

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            code
          );
          if (error || !data?.session) {
            setStatus(
              error?.message.toLowerCase().includes("expired")
                ? "expired"
                : "error"
            );
            return;
          }
          sessionUser = data.session.user;
        } else if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error || !data?.session) {
            setStatus(
              error?.message.toLowerCase().includes("expired")
                ? "expired"
                : "error"
            );
            return;
          }
          sessionUser = data.session.user;
        } else {
          setStatus("error");
          return;
        }

        if (!sessionUser) {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();
          if (error || !session) {
            setStatus("error");
            return;
          }
          sessionUser = session.user;
        }

        if (!sessionUser) {
          setStatus("error");
          return;
        }

        try {
          const profile = await supabaseService.getProfile(sessionUser.id);
          if (!profile) {
            await supabaseService.createProfile({
              id: sessionUser.id,
              email: sessionUser.email ?? "",
              full_name:
                (sessionUser.user_metadata.full_name as string) ??
                (sessionUser.user_metadata.name as string) ??
                "",
              email_verified: true,
              created_at: new Date().toISOString(),
            });
          } else if (!profile.email_verified) {
            await supabaseService.updateProfile(sessionUser.id, {
              email_verified: true,
              verified_at: new Date().toISOString(),
            });
          }
        } catch (profileError) {
          console.error("Profil senkronizasyonu başarısız:", profileError);
        }

        toast.success("E-posta başarıyla doğrulandı!", {
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
          duration: 2500,
        });

        setStatus("success");
        setTimeout(() => window.location.replace("/"), 2000);
      } catch (err) {
        console.error("Verify error:", err);
        setStatus("error");
      } finally {
        clearAuthParams();
      }
    };

    void verifySession();
  }, []);

  const resendVerification = async () => {
    setResending(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        toast.error("Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.");
        return;
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: { emailRedirectTo: `${getAppBaseUrl()}/verify` },
      });

      if (error) toast.error(error.message);
      else toast.success(`Yeni bağlantı ${user.email} adresine gönderildi.`);
    } finally {
      setResending(false);
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
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}
          >
            <Mail className="w-5 h-5" />
            {resending ? "Gönderiliyor..." : "Yeni bağlantı gönder"}
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-red-100">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Doğrulama Başarısız
          </h1>
          <p className="text-gray-600 mb-6">
            Bağlantı hatalı veya geçersiz. Lütfen yeni bir doğrulama e-postası
            alın.
          </p>
          <button
            onClick={resendVerification}
            disabled={resending}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              resending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}
          >
            <Mail className="w-5 h-5" />
            {resending ? "Gönderiliyor..." : "Yeni bağlantı gönder"}
          </button>
        </div>
      )}
    </div>
  );
}
