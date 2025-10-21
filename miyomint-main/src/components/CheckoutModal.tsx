import { X } from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestCheckout: () => void;
  onLoginCheckout: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onGuestCheckout,
  onLoginCheckout,
}: CheckoutModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Siparişi Tamamla</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Siparişinizi tamamlamak için giriş yapabilir veya misafir olarak
            devam edebilirsiniz.
          </p>

          <div className="space-y-3">
            <button
              onClick={onLoginCheckout}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
            >
              Giriş Yap
            </button>

            <button
              onClick={onGuestCheckout}
              className="w-full border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 active:scale-95"
            >
              Misafir Olarak Devam Et
            </button>
          </div>

          <div className="mt-6 p-4 bg-teal-50 rounded-lg">
            <p className="text-sm text-teal-900">
              <strong>Üye Avantajları:</strong>
            </p>
            <ul className="text-sm text-teal-800 mt-2 space-y-1 list-disc list-inside">
              <li>Siparişlerinizi takip edin</li>
              <li>Hızlı ve kolay alışveriş yapın</li>
              <li>Özel kampanya ve indirimlerden haberdar olun</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
