import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Loader2, Lock } from "lucide-react";
import toast from "react-hot-toast";

import { supabase } from "../lib/supabaseClient";
import { getAppBaseUrl } from "../utils/url";

type RecoveryState = "initializing" | "ready" | "success" | "error";

export default function RecoveryPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<RecoveryState>("initializing");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ URL'den token veya code yakala ve Supabase oturumunu oluştur
  useEffect(() => {
    const establishSession = async () => {
      try {
        // Mevcut session varsa direkt geç
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (data.session) {
          console.log("✅ Mevcut oturum bulundu");
          setStatus("ready");
          return;
        }
      } catch (err) {
        console.warn("⏳ Mevcut session bulunamadı, URL kontrol ediliyor...");
      }

      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
      const searchParams = new URLSearchParams(url.search);

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");
      const code = searchParams.get("code"); // PKCE kodu

      console.log("🔹 type:", type);
      console.log("🔹 access_token:", accessToken?.slice(0, 10));
      console.log("🔹 refresh_token:", refreshToken?.slice(0, 10));
      console.log("🔹 code:", code);

      // 🔹 1️⃣ PKCE akışı (Supabase 2.x: ?code= ile gelir)
      if (code && !accessToken) {
        console.log("🔐 PKCE kodu bulundu, oturum oluşturuluyor...");
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error || !data.session) {
          console.error("❌ PKCE session oluşturulamadı:", error?.message);
          setError("Bağlantı geçersiz veya süresi dolmuş.");
          setStatus("error");
          return;
        }
        console.log("✅ PKCE oturumu başarıyla oluşturuldu");
        setStatus("ready");
        return;
      }

      // 🔹 2️⃣ Klasik token tabanlı akış (#access_token)
      if (!accessToken || !refreshToken || type !== "recovery") {
        setError("Bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir bağlantı talep edin.");
        setStatus("error");
        return;
      }

      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (setSessionError) {
        setError(`Oturum başlatılamadı: ${setSessionError.message}`);
        setStatus("error");
        return;
      }

      window.history.replaceState({}, document.title, window.location.pathname);
      setStatus("ready");
    };

    void establishSession();
  }, []);

  // ✅ Şifre güncelleme işlemi
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor. Lütfen kontrol edin.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(`Şifre güncellenemedi: ${updateError.message}`);
        setSubmitting(false);
        return;
      }

      toast.success("Şifreniz başarıyla güncellendi.");
      setStatus("success");
      setSubmitting(false);
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        window.location.href = `${getAppBaseUrl()}/`;
      }, 2500);
    } catch (err) {
      console.error("Şifre güncelleme hatası:", err);
      setError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
      setSubmitting(false);
    }
  };

  // 🔄 Başlangıç durumu
  if (status === "initializing") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-white px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-lg">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-600" />
          <p className="mt-4 text-sm font-medium text-gray-600">
            Oturum doğrulanıyor...
          </p>
        </div>
      </div>
    );
  }

  // 🔐 Şifre sıfırlama formu
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-white px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Yeni Şifre Belirle
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Yeni şifrenizi oluşturun. Güvenliğiniz için güçlü bir şifre seçmenizi öneririz.
        </p>

        {status === "error" && error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p>{error}</p>
          </div>
        )}

        {status === "success" && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p>Şifreniz güncellendi. Ana sayfaya yönlendiriliyorsunuz...</p>
          </div>
        )}

        {status === "ready" && (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            {/* Yeni Şifre */}
            <label className="block text-sm font-medium text-gray-700">
              Yeni Şifre
              <div className="mt-2 flex items-center rounded-xl border border-gray-200 px-4 py-3 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
                <Lock className="mr-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-none focus:outline-none focus:ring-0"
                  placeholder="En az 6 karakter"
                  required
                />
              </div>
            </label>

            {/* Şifre Tekrar */}
            <label className="block text-sm font-medium text-gray-700">
              Şifre Tekrar
              <div className="mt-2 flex items-center rounded-xl border border-gray-200 px-4 py-3 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
                <Lock className="mr-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border-none focus:outline-none focus:ring-0"
                  placeholder="Yeni şifrenizi tekrar girin"
                  required
                />
              </div>
            </label>

            {/* Hata mesajı */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p>{error}</p>
              </div>
            )}

            {/* Gönder butonu */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-3 font-semibold text-white shadow-lg transition hover:from-teal-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                "Şifreyi Güncelle"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
