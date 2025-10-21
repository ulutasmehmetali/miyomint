import { useState, useEffect } from "react";
import { Lock, CheckCircle, XCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";

export default function NewPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    // 🔐 Supabase magic link üzerinden gelen kullanıcıyı doğrula
    const initRecoverySession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          console.warn("No active session for password reset, trying to recover...");
          // Eğer URL'de token varsa Supabase otomatik olarak oturum açacaktır
        }
      } catch (err) {
        console.error("⚠️ Session init error:", err);
      }
    };
    initRecoverySession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      // 🔑 Yeni şifreyi Supabase'e gönder
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("❌ Şifre güncelleme hatası:", error);
        setStatus("error");
        toast.error(error.message || "Şifre güncellenemedi.");
        return;
      }

      setStatus("success");
      toast.success("Şifre başarıyla güncellendi!");
      setNewPassword("");
      setConfirmPassword("");

      // ⏳ 2.5 saniye sonra ana sayfaya yönlendir
      setTimeout(() => {
        window.location.href = "/";
      }, 2500);
    } catch (err: unknown) {
      console.error("⚠️ updateUser error:", err);
      setStatus("error");
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white">
      <Toaster position="top-right" />

      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 bg-teal-100 text-teal-600 flex items-center justify-center rounded-2xl">
            <Lock className="h-7 w-7" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Yeni Şifre Belirle
        </h1>
        <p className="text-gray-600 text-center mb-6 text-sm">
          Yeni şifrenizi girin ve hesabınıza yeniden giriş yapın.
        </p>

        {status === "success" && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span>Şifreniz başarıyla güncellendi! Ana sayfaya yönlendiriliyorsunuz...</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            <XCircle className="w-5 h-5" />
            <span>Bir hata oluştu. Lütfen tekrar deneyin.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Yeni şifrenizi girin"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre Tekrar
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Şifrenizi tekrar girin"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50"
          >
            {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>
      </div>
    </div>
  );
}
