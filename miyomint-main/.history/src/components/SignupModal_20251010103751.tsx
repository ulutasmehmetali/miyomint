import { useState } from "react";
import { X, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // ✳️ Email format kontrolü
  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  // ✳️ Şifre kuralları (en az 6 karakter, 1 büyük harf, 1 sayı)
  const isStrongPassword = (password: string) =>
    password.length >= 6 && /[A-Z]/.test(password) && /\d/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Lütfen ad ve soyadınızı giriniz.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Lütfen geçerli bir e-posta adresi giriniz.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    if (!isStrongPassword(password)) {
      setError("Şifre en az 6 karakter, bir büyük harf ve bir rakam içermelidir.");
      return;
    }

    setLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      // 1️⃣ Kullanıcıyı Supabase'e kaydet
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) throw error;

      // 2️⃣ Kullanıcıyı opsiyonel olarak "users" tablosuna ekle
      if (data.user) {
        await supabase.from("users").insert([
          {
            id: data.user.id,
            email,
            full_name: fullName,
            created_at: new Date().toISOString(),
          },
        ]);
      }

      // 3️⃣ E-posta doğrulama linki oluştur
      const token = crypto.randomUUID();
      const verifyUrl = `https://miyomint.com.tr/#verify=${token}`;

      // 4️⃣ Supabase Function → Brevo e-posta gönderimi
      const res = await fetch(
        "https://nnkbpdhbczjrbqsfvord.supabase.co/functions/v1/email-verifier",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer sb_secret_TlEfCZqhXaRNmcaztwXMWw_pQ3vxdus",
          },
          body: JSON.stringify({
            kind: "verification",
            email,
            full_name: fullName,
            verificationUrl: verifyUrl,
          }),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "E-posta gönderilemedi");

      console.log("✅ Brevo e-postası gönderildi:", result);

      // 5️⃣ LocalStorage'a kullanıcı kaydet
      const users = JSON.parse(localStorage.getItem("miyomint_users") || "[]");
      users.push({
        id: data.user?.id,
        email,
        full_name: fullName,
        email_verified: false,
        verification_token: token,
        verification_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      localStorage.setItem("miyomint_users", JSON.stringify(users));

      // 6️⃣ Başarılı mesaj göster
      setSuccess(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("already registered"))
        setError("Bu e-posta adresi zaten kayıtlı.");
      else setError("Kayıt oluşturulurken bir hata oluştu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Üye Ol</h2>
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

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-2">Hesabınız başarıyla oluşturuldu!</p>
                  <p>Lütfen e-posta adresinizi kontrol edip doğrulama linkine tıklayın.</p>
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
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Soyadınız"
                />
              </div>
            </div>

            {/* E-posta */}
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
                  pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                  title="Geçerli bir e-posta adresi giriniz (örnek: ad@domain.com)"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
                  pattern="^(?=.*[A-Z])(?=.*\d).{6,}$"
                  title="En az 6 karakter, 1 büyük harf ve 1 rakam içermelidir."
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="En az 6 karakter, 1 büyük harf ve 1 rakam"
                />
              </div>
            </div>

            {/* Şifre tekrar */}
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
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Şifrenizi tekrar girin"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? "Hesap oluşturuluyor..." : "Üye Ol"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Zaten hesabınız var mı?{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-teal-600 font-semibold hover:text-teal-700 transition-colors"
              >
                Giriş Yap
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
