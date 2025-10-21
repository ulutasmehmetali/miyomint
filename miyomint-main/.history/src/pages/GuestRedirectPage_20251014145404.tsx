import { useEffect } from "react";
import { Loader2, ShoppingBag } from "lucide-react";

interface GuestRedirectPageProps {
  onCompleteRedirect: () => void;
}

export default function GuestRedirectPage({ onCompleteRedirect }: GuestRedirectPageProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onCompleteRedirect(); // 2.5 sn sonra yönlendirme
    }, 2500);
    return () => clearTimeout(timer);
  }, [onCompleteRedirect]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white text-center">
      <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md border border-teal-100">
        <ShoppingBag className="w-16 h-16 text-teal-600 mx-auto mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Misafir Olarak Devam Ediyorsunuz
        </h1>
        <p className="text-gray-600 mb-6">
          Lütfen bekleyin, yönlendiriliyorsunuz...
        </p>
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
      </div>
    </div>
  );
}
