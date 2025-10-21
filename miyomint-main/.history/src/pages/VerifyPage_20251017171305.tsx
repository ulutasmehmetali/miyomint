import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle, Mail } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";

type VerifyState = "loading" | "success" | "error" | "expired";

export default function VerifyPage() {
  const [status, setStatus] = useState<VerifyState>("loading");
  const [resending, setResending] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const redirectToHome = () => {
      setTimeout(() => {
        window.location.replace("/");
      }, 2500);
    };

    const updateProfileVerified = async (userId: string) => {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            email_verified: true,
            verified_at: new Date().toISOString(),
          })
          .eq("id", userId);
        if (error) console.error("Profil güncellenemedi:", error.message);
      } catch (err) {
        console.error("Profil update hatası:", err);
      }
    };

    const verifyEmailLink = async () => {
      try {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(
          url.hash.replace(/^#/, "") || url.search
        );
        const token_hash = params.get("access_token");

        console.log("📧 Doğrulama token:", token_hash);

        if (!token_hash) {
          console.error("❌ access_token bulunamadı");
          setStatus("error");
          return;
        }

        // ✅ Supabase verifyOtp metodu
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: "email",
        });

        if (error) {
          console.error("❌ verifyOtp hatası:", error.message);
          if (error.message.toLowerCase().includes("expired")) {
            setStatus("expired");
          } else {
            setStatus("error");
          }
          return;
        }

        const user = data?.user;
        if (!user) {
          console.error("⚠️ Kullanıcı alınamadı.");
          setStatus("error");
          return;
        }

        setUserEmail(user.email || null);
        await updateProfileVerified(user.id);

        toast.success("E-posta başarıyla doğrulandı!", {
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
          duration: 2500,
        });

        setStatus("success");
        redirectToHome();
      } catch (err: any) {
        console.error("⚠️ Doğrulama istisnası:", err.message || err);
        setStatus("error");
      }
    };

    verifyEmailLink();
  }, []);

  // ✅ E-postayı yeniden gönder (Supabase user üzerinden)
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
          emailRedirectTo: "http://127.0.0.1:5173/verify",
        },
      });

      if (error) {
        console.error("Yeniden gönderim hatası:", error.message);
        toast.error("Yeni bağlantı gönderilemedi: " + error.message);
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
