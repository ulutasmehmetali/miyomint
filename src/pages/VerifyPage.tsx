import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Loader2, XCircle, Mail } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";

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

  // hash params should take precedence
  hashParams.forEach((value, key) => merged.set(key, value));
  searchParams.forEach((value, key) => {
    if (!merged.has(key)) {
      merged.set(key, value);
    }
  });

  return merged;
};

export default function VerifyPage() {
  const [status, setStatus] = useState<VerifyState>("loading");
  const [resending, setResending] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const params = useMemo(buildParams, []);

  useEffect(() => {
    const redirectToHome = () => {
      setTimeout(() => {
        window.location.replace("/");
      }, 2500);
    };

    const handleSuccess = (email: string | null) => {
      if (email) {
        setUserEmail(email);
      }

      toast.success("E-posta başarıyla doğrulandı!", {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
        duration: 2500,
      });

      setStatus("success");
      redirectToHome();
    };

    const handleExpired = (message?: string) => {
      console.warn("Doğrulama bağlantısı geçersiz:", message);
      setStatus("expired");
    };

    const handleError = (message?: string) => {
      console.error("Doğrulama hatası:", message);
      setStatus("error");
    };

    const startVerification = async () => {
      try {
        const errorCode = params.get("error_code");
        const errorDescription = params.get("error_description") || "";
        if (errorCode) {
          if (errorDescription.toLowerCase().includes("expired")) {
            handleExpired(errorDescription);
          } else {
            handleError(errorDescription);
          }
          return;
        }

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            if (error.message.toLowerCase().includes("expired")) {
              handleExpired(error.message);
            } else {
              handleError(error.message);
            }
            return;
          }

          const sessionUser = data.user ?? data.session?.user;
          handleSuccess(sessionUser?.email ?? params.get("email"));
          return;
        }

        const tokenHash = params.get("token_hash");
        const token = params.get("token");
        if (tokenHash || token) {
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
          const verifyPayload: {
            type: OtpType;
            email?: string;
            token_hash?: string;
            token?: string;
          } = {
            type: otpType,
          };

          if (emailParam) {
            verifyPayload.email = emailParam;
          }

          if (tokenHash) {
            verifyPayload.token_hash = tokenHash;
          } else if (token) {
            verifyPayload.token = token;
          }

          const { data, error } = await supabase.auth.verifyOtp(verifyPayload);
          if (error) {
            if (error.message.toLowerCase().includes("expired")) {
              handleExpired(error.message);
            } else {
              handleError(error.message);
            }
            return;
          }

          const verifiedUser = data?.user;
          if (!verifiedUser) {
            handleError("Kullanıcı bilgisi alınamadı.");
            return;
          }

          handleSuccess(
            verifiedUser.email || verifyPayload.email || emailParam || null
          );
          return;
        }

        const { data } = await supabase.auth.getSession();
        const fallbackUser = data.session?.user;
        if (fallbackUser) {
          handleSuccess(fallbackUser.email ?? params.get("email"));
          return;
        }

        handleError("Doğrulama için gerekli parametreler bulunamadı.");
      } catch (err: any) {
        if (typeof err?.message === "string" && err.message.toLowerCase().includes("expired")) {
          handleExpired(err.message);
        } else {
          handleError(err?.message || String(err));
        }
      }
    };

    startVerification();
  }, [params]);

  const resendVerification = async () => {
    setResending(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        toast.error("Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.");
        return;
      }

      setUserEmail(user.email);

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify`,
        },
      });

      if (error) {
        console.error("Yeniden gönderim hatası:", error.message);
        toast.error("Yeni bağlantı gönderilemedi: " + error.message);
      } else {
        toast.success(
          `Yeni doğrulama bağlantısı ${user.email} adresine gönderildi.`
        );
      }
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
