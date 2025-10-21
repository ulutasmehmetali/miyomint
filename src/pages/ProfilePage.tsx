import { useState, useEffect } from "react";
import {
  User as UserIcon,
  Mail,
  Save,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function ProfilePage() {
  const { user, updateProfile, resendVerificationEmail } = useAuth();
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await updateProfile({ full_name: fullName });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || "Bir hata olustu.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendError("");
    setResendMessage("");
    setResendLoading(true);

    try {
      const { error: resendErr } = await resendVerificationEmail();
      if (resendErr) {
        setResendError(resendErr.message || "Dogrulama e-postasi gonderilemedi.");
      } else {
        setResendMessage("Dogrulama e-postasi gonderildi.");
      }
    } catch (err: any) {
      setResendError(err?.message || "Dogrulama e-postasi gonderilemedi.");
    } finally {
      setResendLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-600">
        <AlertCircle className="w-12 h-12 text-orange-500 mb-3" />
        <p className="text-lg font-medium">Profil bilgilerini gormek icin lutfen giris yapin.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Profil Ayarlari</h1>
            <p className="text-teal-50 mt-1 text-sm">Hesap bilgilerinizi buradan guncelleyebilirsiniz.</p>
          </div>

          <div className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">Bilgileriniz guncellendi.</p>
              </div>
            )}

            {!user.email_verified ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">E-posta dogrulamasi bekleniyor.</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Hesabinizi guvende tutmak icin dogrulama baglantisini onaylamaniz gerekir.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-yellow-400 text-yellow-900 font-semibold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {resendLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Gonderiliyor...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Dogrulama e-postasini tekrar gonder
                    </>
                  )}
                </button>
                {resendMessage && (
                  <div className="flex items-start gap-2 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4 mt-0.5" />
                    <span>{resendMessage}</span>
                  </div>
                )}
                {resendError && (
                  <div className="flex items-start gap-2 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <span>{resendError}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-lg p-3">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span className="text-sm text-teal-700 font-medium">E-posta dogrulandi.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">E-posta adresiniz degistirilemez.</p>
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Adiniz Soyadiniz"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <Save className="w-5 h-5" />
                {loading ? "Kaydediliyor..." : "Degisiklikleri Kaydet"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
