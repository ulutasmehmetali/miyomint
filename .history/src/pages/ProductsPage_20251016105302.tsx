import React from "react";
import { ShoppingCart, Zap } from "lucide-react";
import { Product } from "../types";
import { supabaseService } from "../lib/supabaseService";
import { useAuth } from "../contexts/AuthContext";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onBuyNow }: ProductCardProps) {
  const { user } = useAuth();

  // 🛒 Sepete ekleme işlemi
  const handleAddToCart = React.useCallback(async () => {
    try {
      if (user) {
        // Giriş yapmış kullanıcı sepetine ekle
        await supabaseService.addToCart({
          user_id: user.id,
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
        });
      } else {
        // Misafir sepetine ekle
        await supabaseService.addGuestCartItem({
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
        });
      }

      // Üst komponentten tetiklenecek fonksiyon
      onAddToCart?.(product);
    } catch (error) {
      console.error("🧨 Sepete ekleme hatası:", error);
      alert("Sepete eklenemedi! Lütfen tekrar deneyin.");
    }
  }, [user, product, onAddToCart]);

  // ⚡ Hemen satın al
  const handleBuyNowClick = React.useCallback(() => {
    onBuyNow?.(product);
  }, [onBuyNow, product]);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full transform hover:-translate-y-2 group">
      {/* 💫 Üstte etiket alanı */}
      {product.savings && (
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-center py-2 px-4 font-semibold text-sm min-h-[40px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          <span className="relative z-10">{product.savings}</span>
        </div>
      )}

      {/* 🖼️ Ürün görseli */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="relative aspect-square mb-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl overflow-hidden">
          <div className="flex items-center justify-center gap-4 h-full p-4 relative z-10 group-hover:scale-105 transition-transform duration-500">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain drop-shadow-lg select-none"
              loading="lazy"
            />
          </div>
        </div>

        {/* 🏷️ Ürün bilgisi */}
        <div className="text-center mb-6 flex-grow">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>

          {product.weight && (
            <p className="text-gray-600 text-sm mb-4">{product.weight}</p>
          )}

          {/* 💰 Fiyat */}
          <div className="flex items-center justify-center gap-2 min-h-[36px]">
            {product.originalPrice && (
              <span className="text-gray-400 line-through text-lg">
                {product.originalPrice} TL
              </span>
            )}
            <span className="text-3xl font-bold text-teal-600">
              {product.price} TL
            </span>
          </div>

          {/* 💸 Tasarruf etiketi */}
          {product.originalPrice && (
            <p className="text-teal-600 text-sm font-medium mt-2">
              {Math.max(product.originalPrice - product.price, 0)} TL tasarruf
            </p>
          )}
        </div>

        {/* 🛍️ Butonlar */}
        <div className="space-y-3">
          {/* ⚡ Hemen Satın Al */}
          <button
            onClick={handleBuyNowClick}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl transform hover:scale-105 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Zap className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Hemen Satın Al</span>
          </button>

          {/* 🛒 Sepete Ekle */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-white text-teal-600 py-3 px-6 rounded-xl font-semibold border-2 border-teal-600 hover:bg-teal-50 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 hover:border-teal-700"
          >
            <ShoppingCart className="w-5 h-5" />
            Sepete Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
