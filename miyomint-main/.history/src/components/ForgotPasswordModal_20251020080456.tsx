import { FormEvent, useEffect, useState } from "react";
import { Mail, Send, XCircle, X } from "lucide-react";
import toast from "react-hot-toast";

import { supabase } from "../lib/supabaseClient";
import { getAppBaseUrl } from "../utils/url";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setLoading(false);
      setStatus("idle");
      setMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) {
      const errorMsg = "Lütfen e-posta adresinizi girin.";
      setStatus("error");
      setMessage(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getAppBaseUrl()}/new-password`,
      });

      if (error) {
        console.error("Şifre sıfırlama isteği başarısız:", error);
        const errorMsg =
          error.message?.includes("redirect_to")
            ? "Gönderim yapılamadı. Supabase ayarlarında https://www.miyomint.com.tr/new-password adresinin izinli olduğundan emin olun."
            : error.message ?? "Bağlantı gönderilemedi.";
        setStatus("error");
        setMessage(errorMsg);
        toast.error(errorMsg);
        return;
      }

      const successMsg =
        "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Gelen kutunuzu ve spam klasörünü kontrol edin.";
      setStatus("success");
      setMessage(successMsg);
      toast.success(successMsg);
      setEmail("");
    } catch (resetError) {
      console.error("Şifre sıfırlama hatası:", resetError);
      const errorMsg = "İstek gönderilirken bir hata oluştu.";
      setStatus("error");
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
          aria-label="Kapat"
          type="button"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
            <XCircle className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Şifremi Unuttum
          </h2>
          <p className="mt-3 text-center text-sm text-gray-600">
            Kayıt olduğunuz e-posta adresini girin, yeni şifre belirleme bağlantısı
            e-posta adresinize gönderilsin.
          </p>

          {message && (
            <div
              className={`mt-4 rounded-xl border p-4 text-sm ${
                status === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              E-posta Adresi
              <div className="flex items-center rounded-xl border border-gray-200 px-4 py-3 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
                <Mail className="mr-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ornek@miyomint.com"
                  className="w-full border-none focus:outline-none focus:ring-0"
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-3 font-semibold text-white shadow-lg transition hover:from-teal-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-5 w-5" />
              {loading ? "Gönderiliyor..." : "Bağlantıyı Gönder"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
