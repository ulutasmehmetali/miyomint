import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle, Mail } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";
import { supabaseService } from "../lib/supabaseService";
import { getAppBaseUrl } from "../utils/url";

type VerifyState = "loading" | "success" | "error" | "expired";

export default function VerifyPage() {
  const [status, setStatus] = useState<VerifyState>("loading");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      console.group("🔧 Supabase Verify Debug Log");

      try {
        console.log("🚀 E-posta doğrulama süreci başlatıldı...");
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(url.hash.substring(1));
        const searchParams = new URLSearchParams(url.search);

        const type =
          hashParams.get("type") || searchParams.get("type") || "signup";
        const code = searchParams.get("code"); // PKCE code
        const access_token =
          hashParams.get("access_token") || searchParams.get("access_token");
        const refresh_token =
          hashParams.get("refresh_token") || searchParams.get("refresh_token");

        console.log("🔹 URL Parametreleri:");
        console.log("   • type:", type);
        console.log("   • code:", code);
        console.log("   • access_token:", access_token?.slice(0, 15), "...");
        console.log("   • refresh_token:", refresh_token?.slice(0, 15), "...");

        // 1️⃣ PKCE akışı (Supabase 2.x)
        if (code && !access_token) {
          console.log("🔐 PKCE kodu bulundu → exchangeCodeForSession başlatılıyor...");
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          console.log("🧠 Exchange işlem tamamlandı:");
          console.log("   • Hata:", error ?? "—");
          console.log("   • Session:", data?.session);
          console.log("   • User:", data?.session?.user);

          if (error || !data.session) {
            console.error("❌ PKCE session oluşturulamadı:", error?.message);
            setStatus("error");
            console.groupEnd();
            return;
          }

          console.log("✅ PKCE session oluşturuldu:", data.session.user?.email);
        }

        // 2️⃣ Eski token tabanlı akış (geri uyumluluk)
        else if (access_token && refresh_token) {
          console.log("🔑 setSession çağrılıyor...");
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          console.log("🔹 setSession sonucu:", sessionError);

          if (sessionError) {
            console.error("❌ setSession hatası:", sessionError.message);
            if (sessionError.message.toLowerCase().includes("expired")) {
              setStatus("expired");
            } else {
              setStatus("error");
            }
            console.groupEnd();
            return;
          }
        } else {
          console.warn("⚠️ Ne PKCE kodu ne de token bulundu.");
        }

        // 3️⃣ Session kontrolü
        console.log("🧩 getSession çağrılıyor...");
        const {
          data: { session },
          error: getSessionError,
        } = await supabase.auth.getSession();
        console.log("🔹 getSession sonucu:", session, getSessionError);

        if (getSessionError) {
          console.error("❌ getSession hatası:", getSessionError.message);
        }

        // 4️⃣ getUser fallback
        console.log("🪪 getUser() çağrılıyor...");
        const { data: userData, error: getUserError } = await supabase.auth.getUser();
        console.log("🔹 getUser sonucu:", userData, getUserError);

        const sessionUser = session?.user ?? userData?.user ?? null;

        if (!sessionUser) {
          console.error("⚠️ Kullanıcı alınamadı (session null).");
          setStatus("error");
          console.groupEnd();
          return;
        }

        const user = sessionUser;
        console.table({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          confirmed_at: user.confirmed_at,
        });

        // 5️⃣ Profil tablosu kontrolü / oluşturma
        try {
          console.log("🔍 Profil kontrolü yapılıyor...");
          const profile = await supabaseService.getProfile(user.id);
          console.log("📦 Profil sonucu:", profile);

          if (!profile) {
            console.log("⚙️ Profil bulunamadı → oluşturulacak...");
            const safePayload = {
              id: user.id ?? null,
              email: user.email ?? "",
              full_name:
                (user.user_metadata.full_name as string) ??
                user.user_metadata.name ??
                "",
              email_verified: true,
              created_at: new Date().toISOString(),
            };

            if (!safePayload.id) {
              console.error("⚠️ Kullanıcı ID bulunamadı, profil oluşturulamadı.");
            } else {
              const { error: upsertError } = await supabase
                .from("profiles")
                .upsert(safePayload, { onConflict: "id" });

              if (upsertError) {
                console.error("❌ Profil oluşturulamadı:", upsertError.message);
              } else {
                console.log("🆕 Profil oluşturuldu:", user.email);
              }
            }
          } else {
            console.log("🔄 Mevcut profil bulundu → güncellenecek...");
            const { error: profileUpdateError } = await supabase
              .from("profiles")
              .update({
                email_verified: true,
                verification_token: null,
                verification_expires_at: null,
              })
              .eq("id", user.id);

            if (profileUpdateError) {
              console.error("⚠️ Profil güncelleme hatası:", profileUpdateError.message);
            } else {
              console.log("✅ Profil başarıyla güncellendi:", user.email);
            }
          }
        } catch (profileError) {
          console.error("⚠️ Profil sorgu hatası:", profileError);
        }

        // ✅ Başarılı
        console.log("🎉 Doğrulama başarıyla tamamlandı:", user.email);
        toast.success("E-posta başarıyla doğrulandı!", {
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
          duration: 2500,
        });

        setStatus("success");

        setTimeout(() => {
          console.log("🚀 Ana sayfaya yönlendiriliyor...");
          window.location.replace("/");
        }, 2500);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("💥 Verify error:", message);
        setStatus("error");
      } finally {
        console.groupEnd();
      }
    };

    // 🔔 Auth durum değişikliklerini izle
    supabase.auth.onAuthStateChange((event, session) => {
      console.log("📡 Auth durumu değişti:", event, session);
    });

    verifySession();
  }, []);

  // 🔁 E-posta yeniden gönderme
  const resendVerification = async () => {
    console.group("🔄 Yeniden Gönderim Debug");
    setResending(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("📧 Kullanıcı bilgisi:", user);

      if (!user?.email) {
        toast.error("Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.");
        console.groupEnd();
        return;
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: { emailRedirectTo: `${getAppBaseUrl()}/verify` },
      });

      if (error) {
        console.error("❌ Yeniden gönderim hatası:", error.message);
        toast.error(error.message);
      } else {
        console.log("📨 Yeni bağlantı gönderildi:", user.email);
        toast.success(`Yeni bağlantı ${user.email} adresine gönderildi ✅`);
      }
    } finally {
      setResending(false);
      console.groupEnd();
    }
  };

  // 🧱 UI
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
        </div>
      )}

      {status === "error" && (
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-red-100">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Doğrulama Başarısız
          </h1>
          <p className="text-gray-600 mb-6">
            Bağlantı hatalı veya geçersiz. Lütfen yeni bir doğrulama e-postası
            alın.
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
        </div>
      )}
    </div>
  );
}
