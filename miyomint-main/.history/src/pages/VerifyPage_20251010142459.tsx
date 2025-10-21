// src/pages/VerifyPage.tsx
import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// 🔗 Supabase bağlantısı
const supabase = createClient(
  "https://nnkbpdhbczjrbqsfvord.supabase.co",
  "sb_publishable_wJ7aDrViXWymMyyqebcfIA_0gpOI2QQ"
);

export default function VerifyPage() {
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "expired"
  >("loading");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // 🔍 1️⃣ URL hash veya query parametrelerinden Supabase tokenlarını al
        const hash = window.location.hash.replace("#", "");
        const params = new URLSearchParams(hash);

        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        const error = params.get("error");
        const error_description = params.get("error_description");

        // ❌ Eğer hata varsa
        if (error) {
          console.error("Supabase doğrulama hatası:", error, error_description);
          if (error === "access_denied" || error_description?.includes("expired")) {
            setStatus("expired");
          } else setStatus("error");
          return;
        }

        // ⚠️ Token yoksa hatalı bağlantı
        if (!access_token || !refresh_token) {
          console.warn("Token bulunamadı.");
          setStatus("error");
          return;
        }

        // 🔑 2️⃣ Oturumu oluştur
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (sessionError || !data.session) {
          console.error("Oturum oluşturulamadı:", sessionError);
          setStatus("error");
          return;
        }

        const user = data.session.user;
        console.log("✅ Doğrulama başarılı:", user.email);

        // 🧾 3️⃣ Kullanıcı tablosunu güncelle
        const { error: updateError } = await supabase
          .from("users")
          .update({
            verified: true,
            verified_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError)
          console.warn("users tablosu güncellenemedi:", updateError.message);

        // 🎉 4️⃣ Başarılı ekran göster
        setStatus("success");

        // 🔁 3 saniye sonra ana sayfaya yönlendir
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } catch (err) {
        console.error("Beklenmeyen hata:", err);
        setStatus("error");
      }
    };

    verifyEmail();
  }, []);

  // ⏳ Yükleniyor
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-white text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-80">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            E-posta doğrulaması yapılıyor...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Başarılı
  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white text-center animate-fade-in">
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-green-100">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4 animate-bounce" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Doğrulama Başarılı 🎉
          </h1>
          <p className="text-gray-600 mb-4">
            E-posta adresiniz doğrulandı ve hesabınız etkinleştirildi.
          </p>
          <div className="text-sm text-gray-400 animate-pulse">
            Ana sayfaya yönlendiriliyorsunuz...
          </div>
        </div>
      </div>
    );
  }

  // ⚠️ Süresi dolmuş bağlantı
  if (status === "expired") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-white text-center">
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-yellow-100">
          <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Doğrulama Bağlantısı Süresi Dolmuş ⏰
          </h1>
          <p className="text-gray-600 mb-6">
            Lütfen yeniden giriş yaparak yeni bir doğrulama bağlantısı alın.
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

  // ❌ Hatalı bağlantı
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-white text-center">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-red-100">
        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Doğrulama Başarısız
        </h1>
        <p className="text-gray-600 mb-6">
          Bağlantı geçersiz veya hatalı. Lütfen tekrar kayıt olun.
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
