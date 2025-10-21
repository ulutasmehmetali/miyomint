import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";

type VerifyState = "loading" | "success" | "error" | "expired";

export default function VerifyPage() {
  const [status, setStatus] = useState<VerifyState>("loading");

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

        if (error) console.error("Profil güncellenemedi:", error);
      } catch (err) {
        console.error("Profil update hatası:", err);
      }
    };

    const verifySession = async () => {
      try {
        // URL hash veya search parametrelerini yakala (# veya ? fark etmez)
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.hash.replace(/^#/, "") || url.search);

        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        console.log("✅ Erişilen doğrulama URL:", url.href);
        console.log("🔹 Access Token:", access_token?.slice(0, 12) + "...");
        console.log("🔹 Refresh Token:", refresh_token?.slice(0, 12) + "...");

        if (!access_token || !refresh_token) {
          setStatus("error");
          console.error("Erişim veya yenileme token bulunamadı.");
          return;
        }

        console.log("➡️ setSession başlatılıyor...");
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          console.error("❌ setSession error:", error.message);
          if (error.message.toLowerCase().includes("expired")) {
            setStatus("expired");
          } else {
            setStatus("error");
          }
          return;
        }

        console.log("✅ Session başarıyla kuruldu:", data.session?.user?.email);

        const user = data.session?.user || (await supabase.auth.getUser()).data.user;
        if (!user) {
          console.error("Kullanıcı alınamadı.");
          setStatus("error");
          return;
        }

        // Profilde verified alanını güncelle
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

    verifySession();
  }, []);

  // === Görseller / UI ===
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-80">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            E-posta doğrulama işlemi yapılıyor...
          </p>
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white text-center animate-fade-in">
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
        <Toaster position="top-right" />
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white text-center">
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-yellow-100">
          <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Bağlantının Süresi Dolmuş
          </h1>
          <p className="text-gray-600 mb-6">
            Lütfen yeni bir doğrulama bağlantısı alın.
          </p>
          <a
            href="/"
            className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
          >
            Ana sayfaya dön
          </a>
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  // === Error ===
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white text-center">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-red-100">
        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Doğrulama Başarısız
        </h1>
        <p className="text-gray-600 mb-6">
          Bağlantı hatalı veya geçersiz. <br />
          Lütfen tekrar giriş yaparak yeni bir doğrulama e-postası alın.
        </p>
        <a
          href="/"
          className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
        >
          Ana sayfaya dön
        </a>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
