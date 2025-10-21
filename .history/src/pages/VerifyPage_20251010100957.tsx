// src/pages/VerifyPage.tsx
import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// ✅ Supabase bağlantısı (publishable key kullanıyoruz)
const supabase = createClient(
  "https://nnkbpdhbczjrbqsfvord.supabase.co",
  "sb_publishable_wJ7aDrViXWymMyyqebcfIA_0gpOI2QQ"
);

export default function VerifyPage() {
  const [state, setState] = useState<"working" | "ok" | "invalid">("working");

  useEffect(() => {
    const verifyEmail = async () => {
      const hash = window.location.hash || "";
      const token = decodeURIComponent((hash.match(/#verify=(.+)$/)?.[1] || "").trim());

      if (!token) {
        setState("invalid");
        return;
      }

      try {
        // ⚙️ Yeni Supabase standardı → token_hash + type: "email"
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        });

        if (error) {
          console.error("Supabase doğrulama hatası:", error.message);
          setState("invalid");
        } else {
          console.log("Doğrulama başarılı:", data);
          setState("ok");
        }
      } catch (err) {
        console.error("Beklenmeyen hata:", err);
        setState("invalid");
      }
    };

    verifyEmail();
  }, []);

  // ⏳ Yükleniyor
  if (state === "working") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-80">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">E-posta doğrulama işlemi yapılıyor...</p>
        </div>
      </div>
    );
  }

  // ✅ Başarılı doğrulama
  if (state === "ok") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white">
        <div className="max-w-md mx-auto text-center bg-white shadow-lg rounded-2xl p-8 animate-fade-in">
          <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-gray-800">E-posta doğrulandı!</h1>
          <p className="text-gray-600 mb-6">Artık hesabınızı kullanmaya başlayabilirsiniz.</p>
          <a
            href="/"
            className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
          >
            Ana sayfaya dön
          </a>
        </div>
      </div>
    );
  }

  // ❌ Geçersiz bağlantı
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
      <div className="max-w-md mx-auto text-center bg-white shadow-lg rounded-2xl p-8">
        <AlertTriangle className="w-14 h-14 text-orange-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Geçersiz bağlantı</h1>
        <p className="text-gray-600 mb-6">
          Bağlantı hatalı görünüyor veya süresi dolmuş. Lütfen e-postadaki linki tekrar deneyin.
        </p>
        <a
          href="/"
          className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
        >
          Ana sayfaya dön
        </a>
      </div>
    </div>
  );
}
