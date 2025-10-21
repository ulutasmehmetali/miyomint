// src/pages/VerifyPage.tsx
import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// 🔐 Supabase istemcisi
const supabase = createClient(
  "https://nnkbpdhbczjrbqsfvord.supabase.co",
  "sb_publishable_wJ7aDrViXWymMyyqebcfIA_0gpOI2QQ"
);

export default function VerifyPage() {
  const [state, setState] = useState<"working" | "ok" | "invalid">("working");

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace("#", ""));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (!accessToken || !refreshToken) {
          console.warn("Token bulunamadı:", hash);
          setState("invalid");
          return;
        }

        // ✅ Supabase oturumu oluştur
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error || !data.session) {
          console.error("Oturum oluşturulamadı:", error);
          setState("invalid");
          return;
        }

        const user = data.session.user;
        console.log("✅ Doğrulanan kullanıcı:", user.email);

        // 🔄 users tablosunda verified: true olarak işaretle
        const { error: updateError } = await supabase
          .from("users")
          .update({
            verified: true,
            verified_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError) {
          console.warn("users tablosu güncellenemedi:", updateError.message);
        }

        setState("ok");

        // ⏳ 3 saniye sonra yönlendir
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } catch (err) {
        console.error("Beklenmeyen hata:", err);
        setState("invalid");
      }
    };

    verifyUser();
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
          <p className="text-gray-600 mb-6">
            Hesabınız etkinleştirildi. Ana sayfaya yönlendiriliyorsunuz...
          </p>
          <div className="text-sm text-gray-500 animate-pulse">Lütfen bekleyin...</div>
        </div>
      </div>
    );

  // ❌ Geçersiz bağlantı
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
      <div className="max-w-md mx-auto text-center bg-white shadow-lg rounded-2xl p-8">
        <AlertTriangle className="w-14 h-14 text-orange-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Geçersiz bağlantı</h1>
        <p className="text-gray-600 mb-6">
          Bağlantı hatalı veya süresi dolmuş olabilir. Lütfen tekrar giriş yapın.
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
