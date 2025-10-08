import { useState } from 'react';
import { X, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  errorType?: string;
}

export default function EmailVerificationModal({
  isOpen,
  onClose,
  email: initialEmail,
  errorType
}: EmailVerificationModalProps) {
  const [email, setEmail] = useState(initialEmail || '');
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const getErrorMessage = () => {
    if (errorType === 'otp_expired') {
      return 'Email doğrulama linki süresi dolmuş. Lütfen yeni bir doğrulama maili isteyin.';
    }
    return 'Email doğrulama linki geçersiz veya süresi dolmuş.';
  };

  const handleResend = async () => {
    if (!email) {
      setError('Lütfen email adresinizi girin');
      return;
    }

    setResending(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Email Doğrulama</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Doğrulama Linki Geçersiz</p>
                <p>{getErrorMessage()}</p>
              </div>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">
                  Yeni doğrulama maili gönderildi! Lütfen email kutunuzu kontrol edin.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="resend-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Adresiniz
              </label>
              <input
                id="resend-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              onClick={handleResend}
              disabled={resending || !email}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${resending ? 'animate-spin' : ''}`} />
              {resending ? 'Gönderiliyor...' : 'Yeni Doğrulama Maili Gönder'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Yeni doğrulama linkinin süresi 1 saat içinde dolacaktır. Lütfen en kısa sürede email'inizdeki linke tıklayın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
