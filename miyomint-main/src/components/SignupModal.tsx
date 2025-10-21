import { useState } from "react";
import { X, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { getAppBaseUrl } from "../utils/url";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onForgotPassword: () => void;
}

export default function SignupModal({
  isOpen,
  onClose,
  onSwitchToLogin,
  onForgotPassword,
}: SignupModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const isStrongPassword = (password: string) =>
    password.length >= 6 && /[A-Z]/.test(password) && /\d/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!firstName.trim() || !lastName.trim())
      return setError("Lütfen ad ve soyadınızı giriniz.");
    if (!isValidEmail(email))
      return setError("Geçerli bir e-posta adresi giriniz.");
    if (password !== confirmPassword)
      return setError("Şifreler eşleşmiyor.");
    if (!isStrongPassword(password))
      return setError("Şifre en az 6 karakter, 1 büyük harf ve 1 rakam içermelidir.");

    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      console.log("🚀 Supabase kayıt işlemi başlatılıyor...");

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${getAppBaseUrl()}/verify`, // ✅ doğrulama sayfası yönlendirmesi
          data: {
            full_name: fullName,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        },
      });

      if (signUpError) {
        console.error("❌ Supabase signup hatası:", signUpError.message);

        if (signUpError.message.toLowerCase().includes("already registered")) {
          setError(
            "Bu e-posta adresiyle zaten bir hesap oluşturulmuş. Lütfen giriş yapmayı deneyin."
          );
          setLoading(false);
          return;
        }

        throw signUpError;
      }

      console.log("✅ Supabase signup sonucu:", data);

      setSuccess(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.";
      console.error("⚠️ Signup error:", message);
      setError("Bir hata oluştu: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 sm:p-6 relative">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Üye Ol</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* ❌ Hata mesajı */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                {error.includes("hesap") && (
                  <button
                    onClick={onSwitchToLogin}
                    type="button"
                    className="text-sm text-teal-700 font-semibold hover:text-teal-800 text-left mt-1"
                  >
                    → Giriş yap
                  </button>
                )}
              </div>
            )}

            {/* ✅ Başarı mesajı */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-2">Hesap oluşturuldu ✅</p>
                  <p>
                    Lütfen e-posta adresinizi kontrol edin ve doğrulama bağlantısına
                    tıklayın.
                  </p>
                </div>
              </div>
            )}

            {/* Ad */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Ad
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Adınız"
                />
              </div>
            </div>

            {/* Soyad */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Soyad
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Soyadınız"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="En az 6 karakter, 1 büyük harf ve 1 rakam"
                />
              </div>
            </div>

            {/* Şifre Tekrar */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre Tekrar
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Şifrenizi tekrar girin"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-2.5 sm:py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50"
            >
              {loading ? "Hesap oluşturuluyor..." : "Üye Ol"}
            </button>
          </form>

          {/* 🔹 Alt bağlantılar */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Zaten hesabınız var mı?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-teal-600 font-semibold hover:text-teal-700 transition-colors"
              >
                Giriş Yap
              </button>
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Şifrenizi mi unuttunuz?{" "}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onForgotPassword();
                }}
                className="text-teal-600 font-medium hover:text-teal-700"
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
