import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabaseService } from "../lib/supabaseService";

interface CartItem {
  id?: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: () => void;
}

export default function Cart({ isOpen, onClose, onCheckout }: CartProps) {
  const [items, setItems] = useState<CartItem[]>([]);

  // 🧩 Supabase’ten misafir sepetini getir
  useEffect(() => {
    if (!isOpen) return;
    const fetchCart = async () => {
      try {
        const list = await supabaseService.getGuestCart();
        setItems(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Sepet yüklenirken hata:", err);
        setItems([]);
      }
    };
    fetchCart();
  }, [isOpen]);

  const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  // 🔄 Miktar güncelle
  const handleUpdateQuantity = async (itemId?: string, newQty?: number) => {
    if (!itemId || !newQty || newQty <= 0) return;
    try {
      await supabaseService.updateGuestCartItem(itemId, newQty);
      setItems(prev =>
        prev.map(i => (i.id === itemId ? { ...i, quantity: newQty } : i))
      );
    } catch (err) {
      console.error("Miktar güncellenemedi:", err);
    }
  };

  // ❌ Ürün sil
  const handleRemoveItem = async (itemId?: string) => {
    if (!itemId) return;
    try {
      await supabaseService.removeGuestCartItem(itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      console.error("Ürün silinemedi:", err);
    }
  };

  // 💳 Checkout
  const handleCheckoutClick = () => {
    console.log("🛒 Checkout tıklandı, App'e yönlendiriliyor...");
    onClose();
    setTimeout(() => onCheckout?.(), 200); // 🔹 App.tsx handleCheckout() tetikler
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col transform transition-transform duration-300 translate-x-0">
        {/* Başlık */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Sepetim</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Sepetiniz boş</p>
              <p className="text-gray-400 text-sm mt-2">
                Ürün ekleyerek alışverişe başlayın
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id ?? item.product_id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || ""}
                        alt={item.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-teal-600 font-bold mt-1">₺{item.price}</p>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 bg-white rounded-lg p-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-gray-600 hover:text-teal-600"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold text-gray-900 w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-600 hover:text-teal-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="font-bold text-gray-900">
                      ₺{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alt kısım */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">Toplam</span>
              <span className="text-2xl font-bold text-teal-600">
                ₺{total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Siparişi Tamamla
            </button>

            <p className="text-center text-sm text-gray-600 mt-3">
              Ücretsiz kargo ile gönderim
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
