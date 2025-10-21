import { useEffect, useRef, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { supabase } from "../lib/supabaseClient";

type VerifyState = "loading" | "success" | "error" | "expired";

const REDIRECT_DELAY_MS = 2500;
export default function VerifyPage() {
  const [status, setStatus] = useState<VerifyState>("loading");
  const handledRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const redirectHome = () => {
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        window.location.replace("/");
      }, REDIRECT_DELAY_MS);
    };

    const markSuccess = async (userId?: string | null) => {
      if (handledRef.current || !mounted) return;
      handledRef.current = true;

      if (userId) {
        try {
          const { error } = await supabase
            .from("profiles")
            .update({
              email_verified: true,
              verified_at: new Date().toISOString(),
            })
            .eq("id", userId);
          if (error) {
            console.error("Profil güncelleme hatası:", error);
          }
        } catch (err) {
          console.error("Profil güncelleme istisnası:", err);
        }
      }

      if (!mounted) return;

      setStatus("success");
      toast.success("E-posta başarıyla doğrulandı!", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
        duration: REDIRECT_DELAY_MS,
      });

      redirectHome();
    };

    const currentUrl = new URL(window.location.href);
    const hashParams = new URLSearchParams(currentUrl.hash.replace(/^#/, ""));
    const searchParams = new URLSearchParams(currentUrl.search);

    const accessToken =
      hashParams.get("access_token") ?? searchParams.get("access_token");
    const refreshToken =
      hashParams.get("refresh_token") ?? searchParams.get("refresh_token");

    if (!accessToken || !refreshToken) {
      handledRef.current = true;
      setStatus("error");
      return;
    }

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(async ({ data, error }) => {
        if (error) {
          const msg = error.message?.toLowerCase() ?? "";
          setStatus(msg.includes("expired") ? "expired" : "error");
          return;
        }
        const user =
          data?.session?.user ?? (await supabase.auth.getUser()).data?.user;
        await markSuccess(user?.id);
      })
      .catch(err => {
        console.error("setSession exception:", err);
        if (mounted) {
          setStatus("error");
        }
      });

    return () => {
      mounted = false;
      handledRef.current = true;
    };
  }, []);

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
