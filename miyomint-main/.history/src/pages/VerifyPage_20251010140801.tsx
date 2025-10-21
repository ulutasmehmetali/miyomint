import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nnkbpdhbczjrbqsfvord.supabase.co",
  "sb_publishable_wJ7aDrViXWymMyyqebcfIA_0gpOI2QQ"
);

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // 🔍 Hash veya query parametrelerinden token'ları al
        const hashParams = new URLSearchParams(window.location.hash.replace("#", ""));
        const queryParams = new URLSearchParams(window.location.search);

        const access_token =
          hashParams.get("access_token") || queryParams.get("access_token");
        const refresh_token =
          hashParams.get("refresh_token") || queryParams.get("refresh_token");

        if (!access_token || !refresh_token) {
          console.error("Token bulunamadı.");
          setStatus("error");
          return;
        }

        // 🔑 Supabase oturumu oluştur
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error || !data.session) {
          console.error("Oturum oluşturulamadı:", error);
          setStatus("error");
          return;
        }

        const user = data.session.user;
        console.log("✅ Doğrulama başarılı:", user.email);

        // ✅ Kullanıcı tablosunda doğrulama güncelle
        await supabase
          .from("users")
          .update({
            verified: true,
            verified_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        setStatus("success");

        // 3 sn sonra yönlendir
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } catch (err) {
        console.error("Doğrulama hatası:", err);
        setStatus("error");
      }
    };

    verifyEmail();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-white text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-80">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Doğrulama işlemi yapılıyor...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white text-center animate-fade-in">
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-green-100">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4 animate-bounce" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Doğrulama Başarılı 🎉
          </h1>
          <p className="text-gray-600 mb-4">
            E-posta adresiniz başarıyla doğrulandı. Oturumunuz aktif hale getiriliyor...
          </p>
          <div className="text-sm text-gray-400 animate-pulse">
            Ana sayfaya yönlendiriliyorsunuz...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-white text-center">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-red-100">
        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Doğrulama Başarısız</h1>
        <p className="text-gray-600 mb-6">
          Bağlantı geçersiz veya süresi dolmuş olabilir. Lütfen tekrar giriş yaparak yeni
          bir doğrulama e-postası alın.
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
