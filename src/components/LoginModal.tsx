import { useEffect, useRef, useState } from "react";
import { X, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { HCAPTCHA_SITE_KEY } from "../constants/captcha";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

const CAPTCHA_CONTAINER_ID = "login-hcaptcha";

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState("");
  const successRef = useRef(false);
  const captchaWidgetIdRef = useRef<string | null>(null);

  const resetCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaError("");
    if (window.hcaptcha && captchaWidgetIdRef.current) {
      window.hcaptcha.reset(captchaWidgetIdRef.current);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    const renderCaptcha = () => {
      if (cancelled) return;

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
      if (captchaWidgetIdRef.current && window.hcaptcha?.remove) {
        window.hcaptcha.remove(captchaWidgetIdRef.current);
      }
      captchaWidgetIdRef.current = null;
      const container = document.getElementById(CAPTCHA_CONTAINER_ID);
      if (container) container.innerHTML = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    successRef.current = false;
    console.log("[LoginModal] submit", { email });

    try {
      if (!captchaToken) {
        setCaptchaError("Lutfen guvenlik dogrulamasini tamamlayin.");
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      const { error } = await signIn(normalizedEmail, password, captchaToken ?? undefined);
      console.log("[LoginModal] signIn result", { error });

      if (error) {
        setError(error.message);
        if (error.message.toLowerCase().includes("captcha")) {
          setCaptchaError(error.message);
        }
        return;
      }

      setSuccess(true);
      successRef.current = true;
      setTimeout(() => {
        onClose();
        setEmail("");
        setPassword("");
        setSuccess(false);
        setCaptchaToken(null);
        setCaptchaError("");
        console.log("[LoginModal] modal closed");
      }, 600);
    } catch (err: any) {
      console.error("LoginModal submit error:", err);
      const message = err?.message || "Giriş sırasında beklenmeyen bir hata oluştu.";
      if (message.toLowerCase().includes("captcha")) {
        setCaptchaError(message);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
      console.log("[LoginModal] loading false");
      if (!successRef.current) {
        resetCaptcha();
      }
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
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
                  <p className="font-semibold mb-2">Giriş başarılı!</p>
                  <p>Hoş geldiniz 🎉</p>
                </div>
              </div>
            )}

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
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

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
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Şifrenizi girin"
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
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

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
          </div>
        </div>
      </div>
    </div>
  );
}
