import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nnkbpdhbczjrbqsfvord.supabase.co",
  "sb-pat-public-anon-key" // senin public key'in neyse onu koy
);

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading");

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const url = new URL(window.location.href);
        const token = url.searchParams.get("token");
        const type = url.searchParams.get("type");
        const access_token = new URLSearchParams(window.location.hash.replace("#", "")).get("access_token");
        const refresh_token = new URLSearchParams(window.location.hash.replace("#", "")).get("refresh_token");
        const error = url.searchParams.get("error");
        const error_description = url.searchParams.get("error_description");

        if (error) {
          console.error("Doğrulama hatası:", error_description);
          if (error_description?.includes("expired")) setStatus("expired");
          else setStatus("error");
          return;
        }

        // 1️⃣ Eğer ?token varsa (signup doğrulaması)
        if (token && type === "signup") {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "signup",
          });

          if (verifyError) {
            console.error("verifyOtp hatası:", verifyError.message);
            setStatus("error");
            return;
          }

          console.log("✅ Doğrulama başarılı:", data);
          setStatus("success");

          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
          return;
        }

        // 2️⃣ Eğer hash token geldiyse (access_token ile)
        if (access_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token ?? "",
          });

          if (sessionError) {
            console.error("Session kurulamadı:", sessionError.message);
            setStatus("error");
            return;
          }

          console.log("✅ Giriş başarılı (access_token)");
          setStatus("success");
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
          return;
        }

        // 3️⃣ Token yoksa
        console.warn("Token bulunamadı.");
        setStatus("error");
      } catch (err) {
        console.error("Beklenmeyen hata:", err);
        setStatus("error");
      }
    };

    verifyUser();
  }, []);

  // 🔄 Yükleniyor
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

  // ✅ Başarılı
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white text-center animate-fade-in">
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-green-100">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4 animate-bounce" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Doğrulama Başarılı 🎉</h1>
          <p className="text-gray-600 mb-4">Hesabınız etkinleştirildi ve giriş yapılabilir.</p>
          <div className="text-sm text-gray-400 animate-pulse">Ana sayfaya yönlendiriliyorsunuz...</div>
        </div>
      </div>
    );
  }

  // ⏰ Süresi dolmuş
  if (status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white text-center">
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-yellow-100">
          <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Bağlantı Süresi Dolmuş ⏰</h1>
          <p className="text-gray-600 mb-6">Lütfen yeni bir doğrulama bağlantısı alın.</p>
          <a href="/" className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition">
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
          Bağlantı geçersiz veya süresi dolmuş olabilir. Lütfen tekrar giriş yaparak yeni bir doğrulama e-postası alın.
        </p>
        <a href="/" className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition">
          Ana sayfaya dön
        </a>
      </div>
    </div>
  );
}
