// src/pages/VerifyPage.tsx
import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading");

  useEffect(() => {
    const verify = async () => {
      try {
        // 🔍 URL'deki fragment (hash) kısmını al
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        const error = params.get("error");
        const error_description = params.get("error_description");

        if (error) {
          console.error("Supabase verification error:", error, error_description);
          if (error_description?.includes("expired")) setStatus("expired");
          else setStatus("error");
          return;
        }

        // 🔐 Supabase yeni yöntem: kodu session’a çevir
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);

        if (exchangeError) {
          console.error("exchangeCodeForSession error:", exchangeError);
          setStatus("error");
          return;
        }

        if (!data.session) {
          console.warn("No session data found after verification");
          setStatus("error");
          return;
        }

        // ✅ Kullanıcı oturumu başarıyla alındı
        const user = data.session.user;
        console.log("✅ Email verified for:", user.email);

        // Profil tablosunda e-posta doğrulama bilgisini güncelle
        await supabase
          .from("profiles")
          .update({
            email_verified: true,
            verified_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        setStatus("success");

        // 3 saniye sonra anasayfaya yönlendir
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
      }
    };

    verify();
  }, []);

  // 🌀 Yükleniyor ekranı
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-80">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">E-posta doğrulama işlemi yapılıyor...</p>
        </div>
      </div>
    );
  }

  // ✅ Başarılı ekranı
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white text-center animate-fade-in">
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-green-100">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4 animate-bounce" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Doğrulama Başarılı 🎉</h1>
          <p className="text-gray-600 mb-4">
            E-posta adresiniz doğrulandı, hesabınız aktif hale getirildi.
          </p>
          <div className="text-sm text-gray-400 animate-pulse">
            Ana sayfaya yönlendiriliyorsunuz...
          </div>
        </div>
      </div>
    );
  }

  // ⏰ Süresi dolmuş bağlantı
  if (status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white text-center">
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-yellow-100">
          <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Bağlantı Süresi Dolmuş ⏰</h1>
          <p className="text-gray-600 mb-6">Lütfen yeni bir doğrulama bağlantısı alın.</p>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white text-center">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-red-100">
        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Doğrulama Başarısız</h1>
        <p className="text-gray-600 mb-6">
          Bağlantı hatalı veya geçersiz.
          <br />
          Lütfen tekrar giriş yaparak yeni bir doğrulama e-postası alın.
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
