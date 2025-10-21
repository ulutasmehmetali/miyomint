// src/pages/VerifyPage.tsx
import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nnkbpdhbczjrbqsfvord.supabase.co",
  "sb_publishable_wJ7aDrViXWymMyyqebcfIA_0gpOI2QQ"
);

export default function VerifyPage() {
  const [state, setState] = useState<"working" | "ok" | "invalid">("working");

  useEffect(() => {
    const verifyAndLogin = async () => {
      const hash = window.location.hash || "";
      const token = decodeURIComponent((hash.match(/#verify=(.+)$/)?.[1] || "").trim());
      if (!token) return setState("invalid");

      try {
        // ✅ Supabase OTP doğrulama
        const { data, error } = await supabase.auth.verifyOtp({
          token,
          type: "signup",
        });

        if (error) {
          console.error("Doğrulama hatası:", error.message);
          setState("invalid");
          return;
        }

        // ✅ Oturum oluştur
        if (data.session) {
          await supabase.auth.setSession(data.session);
          console.log("Kullanıcı oturumu oluşturuldu:", data.user?.email);
        }

        setState("ok");

        // ⏳ 2 saniye sonra ana sayfaya yönlendir
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } catch (err) {
        console.error("Beklenmeyen hata:", err);
        setState("invalid");
      }
    };

    verifyAndLogin();
  }, []);

  // ⏳ Yükleniyor
  if (state === "working")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-80">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">E-posta doğrulama işlemi yapılıyor...</p>
        </div>
      </div>
    );

  // ✅ Başarılı doğrulama
  if (state === "ok")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white">
        <div className="max-w-md mx-auto text-center bg-white shadow-lg rounded-2xl p-8 animate-fade-in">
          <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-gray-800">E-posta doğrulandı 🎉</h1>
          <p className="text-gray-600 mb-6">Hesabınız etkinleştirildi, yönlendiriliyorsunuz...</p>
          <div className="text-sm text-gray-500 animate-pulse">Lütfen bekleyin...</div>
        </div>
      </div>
    );

  // ❌ Hatalı bağlantı
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
      <div className="max-w-md mx-auto text-center bg-white shadow-lg rounded-2xl p-8">
        <AlertTriangle className="w-14 h-14 text-orange-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Geçersiz bağlantı</h1>
        <p className="text-gray-600 mb-6">
          Bağlantı hatalı veya süresi dolmuş olabilir. Lütfen tekrar deneyin.
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
