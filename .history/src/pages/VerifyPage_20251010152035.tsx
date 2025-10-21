import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

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
        const fullUrl = window.location.href;
        const queryParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace("#", ""));

        const type = queryParams.get("type") || "";
        const error = queryParams.get("error") || hashParams.get("error");
        const errorDesc =
          queryParams.get("error_description") ||
          hashParams.get("error_description");

        if (error) {
          console.error("Supabase doğrulama hatası:", error, errorDesc);
          if (errorDesc?.includes("expired")) setStatus("expired");
          else setStatus("error");
          return;
        }

        const access_token =
          hashParams.get("access_token") || queryParams.get("access_token");
        const refresh_token =
          hashParams.get("refresh_token") || queryParams.get("refresh_token");

        // 🎯 Eğer type=signup ise zaten Supabase backend’de onaylamıştır
        if (type === "signup" || fullUrl.includes("type=signup")) {
          console.log("✅ E-posta doğrulandı (type=signup).");
          setStatus("success");
          setTimeout(() => (window.location.href = "/"), 3000);
          return;
        }

        // 🎯 Eğer magic link veya recovery linkindeysek token'lar gelir
        if (access_token && refresh_token) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError || !data.session) {
            console.error("Oturum oluşturulamadı:", sessionError);
            setStatus("error");
            return;
          }

          console.log("✅ Oturum açıldı:", data.session.user.email);
          await supabase
            .from("users")
            .update({
              verified: true,
              verified_at: new Date().toISOString(),
            })
            .eq("id", data.session.user.id);

          setStatus("success");
          setTimeout(() => (window.location.href = "/"), 3000);
          return;
        }

        // Hiçbiri değilse hata
        setStatus("error");
      } catch (err) {
        console.error("Doğrulama hatası:", err);
        setStatus("error");
      }
    };

    verifyEmail();
  }, []);

  // ⏳ Yükleniyor
  if (status === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-80">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            E-posta doğrulama işlemi yapılıyor...
          </p>
        </div>
      </div>
    );

  // ✅ Başarılı doğrulama
  if (status === "success")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white text-center animate-fade-in">
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-green-100">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4 animate-bounce" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Doğrulama Başarılı 🎉
          </h1>
          <p className="text-gray-600 mb-4">
            E-posta adresiniz doğrulandı. Hesabınız artık aktif!
          </p>
          <div className="text-sm text-gray-400 animate-pulse">
            Ana sayfaya yönlendiriliyorsunuz...
          </div>
        </div>
      </div>
    );

  // ⏰ Süresi dolmuş
  if (status === "expired")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white text-center">
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-yellow-100">
          <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Bağlantı Süresi Dolmuş ⏰
          </h1>
          <p className="text-gray-600 mb-6">
            Lütfen giriş yaparak yeni bir doğrulama bağlantısı alın.
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

  // ❌ Hatalı bağlantı
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white text-center">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-red-100">
        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Doğrulama Başarısız
        </h1>
        <p className="text-gray-600 mb-6">
          Bağlantı geçersiz veya süresi dolmuş olabilir.
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
