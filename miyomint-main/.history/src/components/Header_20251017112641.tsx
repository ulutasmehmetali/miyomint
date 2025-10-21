import {
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Package,
  MessageCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartItemCount: number;
  onCartClick: () => void;
  onLoginClick: () => void;
}

export default function Header({
  currentPage,
  onNavigate,
  cartItemCount,
  onCartClick,
  onLoginClick,
}: HeaderProps) {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [animateBadge, setAnimateBadge] = useState(false);

  // 🟢 Sepet sayısı değişince kısa bir animasyon oynat
  useEffect(() => {
    if (cartItemCount > 0) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 400);
      return () => clearTimeout(timer);
    }
  }, [cartItemCount]);

  const navItems = [
    { id: "home", label: "Ana Sayfa" },
    { id: "products", label: "Ürünler" },
    { id: "faq", label: "SSS" },
    { id: "about", label: "Biz Kimiz" },
    { id: "contact", label: "İletişim" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 🏠 Logo */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center space-x-2 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 via-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden transform hover:rotate-6 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
              <svg
                className="w-7 h-7 text-white relative z-10"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 3L4 7v10l8 4 8-4V7l-8-4z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="currentColor"
                  fillOpacity="0.3"
                />
                <circle cx="12" cy="12" r="2" fill="white" />
                <path
                  d="M12 9v6M9 12h6"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
              MiyoMint
            </span>
          </button>

          {/* 🔗 Masaüstü Menü */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? "text-teal-600"
                    : "text-gray-700 hover:text-teal-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* 🔐 Kullanıcı + Sepet + Menü */}
          <div className="flex items-center space-x-3">
            {/* 🧍 Kullanıcı */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-teal-50 transition-colors active:scale-95 touch-manipulation"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.full_name || "Kullanıcı"}
                  </span>
                </button>

                {/* 👤 Kullanıcı Menü */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        onNavigate("profile");
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Profil Ayarları
                    </button>
                    <button
                      onClick={() => {
                        onNavigate("orders");
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      Siparişlerim
                    </button>
                    <button
                      onClick={() => {
                        onNavigate("support");
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Bize Ulaşın
                    </button>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={async () => {
                        await signOut();
                        setUserMenuOpen(false);
                        onNavigate("home");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <User className="w-4 h-4" />
                Giriş Yap
              </button>
            )}

            {/* 🛒 Sepet */}
            <button
              onClick={onCartClick}
              className="relative p-3 text-gray-700 hover:text-teal-600 transition-colors active:scale-95 touch-manipulation"
            >
              <ShoppingCart className="w-7 h-7 sm:w-6 sm:h-6" />
              {cartItemCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md transition-transform ${
                    animateBadge ? "scale-125 animate-bounce" : "scale-100"
                  }`}
                >
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* 📱 Mobil Menü */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 text-gray-700 active:scale-95 touch-manipulation"
            >
              {mobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 📱 Mobil Menü Açılır Liste */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
          <nav className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-6 py-4 rounded-xl text-base font-medium transition-all duration-300 ${
                  currentPage === item.id
                    ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-teal-50 hover:text-teal-600"
                }`}
              >
                {item.label}
              </button>
            ))}

            {!user && (
              <button
                onClick={() => {
                  onLoginClick();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-6 py-4 rounded-xl text-base font-medium transition-all duration-300 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md sm:hidden"
              >
                <User className="w-5 h-5 inline mr-2" />
                Giriş Yap / Üye Ol
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
