import { useEffect, useRef, useState } from "react";
import { X, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { SUPABASE_ANON_KEY, SUPABASE_FUNCTIONS_URL } from "../lib/supabaseClient";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const HCAPTCHA_SITE_KEY = "acea3962-2204-480e-ab7a-2db0b79273ce";
const CAPTCHA_CONTAINER_ID = "signup-hcaptcha";

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) {
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const captchaWidgetIdRef = useRef<string | null>(null);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
  const isStrongPassword = (value: string) =>
    value.length >= 6 && /[A-Z]/.test(value) && /\d/.test(value);

  const resetCaptcha = () => {
    if (window.hcaptcha && captchaWidgetIdRef.current) {
      window.hcaptcha.reset(captchaWidgetIdRef.current);
    }
    setCaptchaToken(null);
    setCaptchaError("");
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    resetCaptcha();
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    const renderCaptcha = () => {
      if (cancelled) {
        return;
      }

      const api = window.hcaptcha;
      const container = document.getElementById(CAPTCHA_CONTAINER_ID);

      if (!api || !container) {
        setTimeout(renderCaptcha, 200);
        return;
      }

      container.innerHTML = "";
      captchaWidgetIdRef.current = api.render(container, {
        sitekey: HCAPTCHA_SITE_KEY,
        callback: (token: string) => {
          setCaptchaToken(token);
          setCaptchaError("");
        },
        "error-callback": () => {
          setCaptchaToken(null);
          setCaptchaError("Guvenlik dogrulamasi basarisiz oldu. Lutfen tekrar deneyin.");
        },
        "expired-callback": () => {
          setCaptchaToken(null);
          setCaptchaError("Guvenlik dogrulamasi suresi doldu. Lutfen tekrar deneyin.");
        },
      });
    };

    renderCaptcha();

    return () => {
      cancelled = true;
      resetCaptcha();
      const container = document.getElementById(CAPTCHA_CONTAINER_ID);
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [isOpen]);

  const verifyCaptcha = async (token: string) => {
    try {
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/verify-hcaptcha`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ token }),
      });

      const result = (await response.json()) as { success: boolean; error?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Dogrulama basarisiz");
      }

      return true;
    } catch (err: any) {
      console.error("hCaptcha validation error:", err);
      setCaptchaError(err?.message || "Guvenlik dogrulamasi basarisiz oldu. Lutfen yeniden deneyin.");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setCaptchaError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Lutfen ad ve soyadinizi giriniz.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Gecerli bir e-posta adresi giriniz.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Sifreler eslesmiyor.");
      return;
    }

    if (!isStrongPassword(password)) {
      setError("Sifre en az 6 karakter, 1 buyuk harf ve 1 rakam icermelidir.");
      return;
    }

    if (!captchaToken) {
      setCaptchaError("Lutfen guvenlik dogrulamasini tamamlayin.");
      return;
    }

    setLoading(true);

    try {
      const captchaOk = await verifyCaptcha(captchaToken);
      if (!captchaOk) {
        resetCaptcha();
        setLoading(false);
        return;
      }

      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const { error: signUpError } = await signUp(email, password, fullName);

      if (signUpError) {
        const message = signUpError.message || "Kayit sirasinda bir hata olustu.";

        if (message.toLowerCase().includes("already registered")) {
          setError("Bu e-posta adresiyle zaten bir hesap acilmis. Lutfen giris yapmayi deneyin.");
        } else {
          setError(message);
        }

        resetCaptcha();
        return;
      }

      setSuccess(true);
      resetForm();
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(`Bir hata olustu: ${err?.message || "Bilinmeyen hata"}`);
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Uye Ol</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                {error.toLowerCase().includes("hesap") && (
                  <button
                    onClick={onSwitchToLogin}
                    type="button"
                    className="text-sm text-teal-700 font-semibold hover:text-teal-800 text-left mt-1"
                  >
                    Giris yap
                  </button>
                )}
              </div>
            )}

            {captchaError && !error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{captchaError}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-2">Hesap olusturuldu.</p>
                  <p>Lutfen e-posta adresinizi kontrol edin ve dogrulama baglantisina tiklayin.</p>
                </div>
              </div>
            )}

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
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Adiniz"
                />
              </div>
            </div>

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
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Soyadiniz"
                />
              </div>
            </div>

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
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                Sifre
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
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="En az 6 karakter, 1 buyuk harf ve 1 rakam"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Sifre Tekrar
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
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Sifrenizi tekrar girin"
                />
              </div>
            </div>

            <div>
              <div id={CAPTCHA_CONTAINER_ID} className="min-h-[78px]" />
              {captchaError && <p className="text-sm text-red-600 mt-2">{captchaError}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50"
            >
              {loading ? "Hesap olusturuluyor..." : "Uye Ol"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Zaten hesabiniz var mi?{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-teal-600 font-semibold hover:text-teal-700 transition-colors"
              >
                Giris Yap
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

