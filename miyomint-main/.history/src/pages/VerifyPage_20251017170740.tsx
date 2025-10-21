import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle, Mail } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";

type VerifyState = "loading" | "success" | "error" | "expired";
const REDIRECT_DELAY_MS = 2500;

export default function VerifyPage() {
  const [status, setStatus] = useState<VerifyState>("loading");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const redirectHome = () => {
      setTimeout(() => {
        window.location.replace("/");
      }, REDIRECT_DELAY_MS);
    };

    const verifyEmail = async () => {
      try {
        // ✅ URL’deki access_token hash’ini al
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.hash.replace(/^#/, ""));
        const token_hash = params.get("access_token");

        console.log("📩 Token hash:", token_hash);

        if (!token_hash) {
          setStatus("error");
          return;
        }

        // ✅ Supabase verifyOtp çağrısı (GoTrue v2 standardı)
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: "email",
        });

        if (error) {
          console.error("verifyOtp hatası:", error.message);
          setStatus(error.message.toLowerCase().includes("expired") ? "expired" : "error");
          return;
        }

        const user = data?.user;
        if (!user) {
          console.error("Kullanıcı bulunamadı.");
          setStatus("error");
          return;
        }

        setUserEmail(user.email || null);

        // ✅ Profil güncelle
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            email_verified: true,
            verified_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (profileError) console.error("Profil update hatası:", profileError.message);

        toast.success("E-posta başarıyla doğrulandı!", {
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
          duration: REDIRECT_DELAY_MS,
        });

        if (isMounted) {
          setStatus("success");
          redirectHome();
        }
      } catch (err: any) {
        console.error("Doğrulama hatası:", err.message || err);
        if (isMounted) setStatus("error");
      }
    };

    verifyEmail();

    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ Yeniden doğrulama e-postası gönder
  const resendVerification = async () => {
    setResending(true);
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user?.email) {
        toast.error("Kullanıcı bulunamadı. Lütfen yeniden giriş yapın.");
        setResending(false);
        return;
      }

      setUserEmail(user.email);

      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo: "http://localhost:5173/verify",
        },
      });

      if (resendError) {
        console.error("Yeniden gönderim hatası:", resendError.message);
        toast.error("Yeni bağlantı gönderilemedi: " + resendError.message);
      } else {
        toast.success(
          `Yeni doğrulama bağlantısı ${user.email} adresine gönderildi ✅`
        );
      }
    } finally {
      setResending(false);
    }
  };

  // === UI ===
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
