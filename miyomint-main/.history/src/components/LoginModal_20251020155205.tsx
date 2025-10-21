import { useState } from "react";
import { X, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { getAppBaseUrl } from "../utils/url";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToSignup,
  onForgotPassword,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      console.log("🚀 Giriş işlemi başlatılıyor...");

      // ✅ PKCE akışı: localStorage kullanılmaz, sadece Supabase üzerinde doğrulama yapılır
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("❌ Giriş hatası:", signInError.message);
        if (signInError.message.toLowerCase().includes("invalid login credentials")) {
          setError("E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
          return;
        }
        throw signInError;
      }

      const user = data?.user;
      if (!user) {
        setError("Kullanıcı bulunamadı.");
        return;
      }

      // 🧩 Eğer e-posta doğrulanmadıysa uyarı ver
      if (!user.email_confirmed_at) {
        console.warn("⚠️ Kullanıcının e-posta adresi doğrulanmamış:", email);
        setError("E-posta adresiniz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin.");

        // ✉️ Yeni doğrulama bağlantısı gönder
        await supabase.auth.resend({
          type: "signup",
          email,
          options: { emailRedirectTo: `${getAppBaseUrl()}/verify` },
        });
        return;
      }

      console.log("✅ Giriş başarılı, kullanıcı:", user.email);

      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.href = "/";
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.";
      console.error("⚠️ Login error:", message);
      setError("Bir hata oluştu: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Giriş Yap</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* ❌ Hata mesajı */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* ✅ Başarı mesajı */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold">Giriş başarılı ✅</p>
                  <p>Yönlendiriliyorsunuz...</p>
                </div>
              </div>
            )}

            {/* E-posta */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                E-posta
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Şifreniz"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          {/* 🔹 Alt bağlantılar */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Hesabınız yok mu?{" "}
              <button
                onClick={onSwitchToSignup}
                className="text-teal-600 font-semibold hover:text-teal-700 transition-colors"
              >
                Üye Ol
              </button>
            </p>
            <p className="text-sm text-center text-gray-600 mt-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onForgotPassword();
                }}
                className="text-teal-600 hover:text-teal-700 font-semibold"
              >
                Şifremi Unuttum
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
