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
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext"; // ✅ Supabase Auth Context
import type { PageKey } from "../types";

interface HeaderProps {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  cartItemCount: number;
  onCartClick: () => void;
  onLoginClick: () => void; // ✅ Modal açma fonksiyonu
}

export default function Header({
  currentPage,
  onNavigate,
  cartItemCount,
  onCartClick,
  onLoginClick,
}: HeaderProps) {
  const { user, signOut } = useAuth(); // ✅ Supabase user bilgisi & çıkış fonksiyonu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems: Array<{ id: PageKey; label: string }> = [
    { id: "home", label: "Ana Sayfa" },
    { id: "products", label: "Ürünler" },
    { id: "faq", label: "SSS" },
    { id: "about", label: "Biz Kimiz" },
    { id: "contact", label: "İletişim" },
  ];

  return (
    <header className="bg-white/95 supports-[backdrop-filter]:bg-white/80 backdrop-blur sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[env(safe-area-inset-top)]">
        <div className="flex justify-between items-center min-h-[64px] sm:min-h-[72px]">
          {/* 🔹 Logo & Marka */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center space-x-2 group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 via-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden transform hover:rotate-6 transition-transform duration-300">
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
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
              MiyoMint
            </span>
          </button>

          {/* 🔹 Ana Navigasyon */}
          <nav className="hidden md:flex space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-sm lg:text-base font-medium transition-colors ${
                  currentPage === item.id
                    ? "text-teal-600"
                    : "text-gray-700 hover:text-teal-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* 🔹 Sağ Menü (Kullanıcı + Sepet + Hamburger) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Kullanıcı menüsü */}
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

                {/* Kullanıcı açılır menüsü */}
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

                    {/* ✅ Supabase çıkış işlemi */}
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
              // Giriş butonu (login modalını açar)
              <button
                onClick={onLoginClick}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <User className="w-4 h-4" />
                Giriş Yap
              </button>
            )}

            {/* Sepet butonu */}
            <button
              onClick={onCartClick}
              className="relative p-2.5 sm:p-3 rounded-xl text-gray-700 hover:text-teal-600 transition-colors active:scale-95 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60"
            >
              <ShoppingCart className="w-7 h-7 sm:w-6 sm:h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobil Menü */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 sm:p-3 rounded-xl text-gray-700 active:scale-95 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60"
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

      {/* 🔹 Mobil Menü Açılır */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-lg pb-[env(safe-area-inset-bottom)]">
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
