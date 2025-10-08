import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface EmailVerifiedPageProps {
  onNavigate: (page: string) => void;
  onLoginClick: () => void;
}

export default function EmailVerifiedPage({ onNavigate, onLoginClick }: EmailVerifiedPageProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const checkVerification = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));

      if (params.get('type') === 'signup' || params.get('access_token')) {
        setStatus('success');
        setTimeout(() => {
          window.history.replaceState(null, '', window.location.pathname);
          onNavigate('home');
        }, 3000);
      } else if (params.get('error')) {
        setStatus('error');
      } else {
        setStatus('success');
      }
    };

    checkVerification();
  }, [onNavigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Email doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Doğrulama Başarısız</h1>
          <p className="text-gray-600 mb-6">
            Email doğrulama linkinizin süresi dolmuş olabilir. Lütfen yeni bir doğrulama linki isteyin.
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Doğrulandı!</h1>
        <p className="text-gray-600 mb-6">
          Email adresiniz başarıyla doğrulandı. Artık hesabınıza giriş yapabilirsiniz.
        </p>
        <div className="space-y-3">
          <button
            onClick={onLoginClick}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300"
          >
            Giriş Yap
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="w-full border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
          >
            Ana Sayfaya Dön
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          Sayfa 3 saniye içinde otomatik olarak yönlendirilecek...
        </p>
      </div>
    </div>
  );
}
