import { useState, useMemo } from "react";
import { Truck, Gift, Calendar, Package } from "lucide-react";
import { CartItem } from "../types";

interface CheckoutSummaryProps {
  items: CartItem[];
}

export default function CheckoutSummary({ items }: CheckoutSummaryProps) {
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const total = subtotal - discount;

  const estimatedDate = useMemo(() => {
    const now = new Date();
    now.setDate(now.getDate() + 2);
    return now.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      weekday: "long",
    });
  }, []);

  const applyCoupon = () => {
    if (coupon.toLowerCase() === "miyo10") {
      setDiscount(subtotal * 0.1);
      alert("Kupon uygulandı! %10 indirim kazandınız 🎉");
    } else {
      alert("Geçersiz kupon kodu 😢");
      setDiscount(0);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Sepetiniz boş</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 animate-fadeIn">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-3">
        <Package className="w-5 h-5 text-teal-600" /> Sepet Özeti
      </h3>

      {/* 🛍 Ürün listesi */}
      <div className="space-y-3 border-b pb-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <img
                src={item.image || "/placeholder.jpg"}
                alt={item.name}
                className="w-14 h-14 object-cover rounded-md border"
              />
              <div>
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} x ₺{item.price}
                </p>
              </div>
            </div>
            <p className="font-semibold text-gray-800">
              ₺{item.price * item.quantity}
            </p>
          </div>
        ))}
      </div>

      {/* 🎟 Kupon alanı */}
      <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
        <input
          type="text"
          placeholder="Kupon kodu"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          className="flex-1 bg-transparent focus:outline-none text-sm text-gray-700"
        />
        <button
          onClick={applyCoupon}
          className="text-teal-600 text-sm font-medium hover:text-teal-700 transition"
        >
          Uygula
        </button>
      </div>

      {/* 🚚 Bilgi satırları */}
      <div className="space-y-2 text-sm text-gray-600 border-t pt-3">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-teal-600" />
          <span>Ücretsiz kargo</span>
        </div>
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-teal-600" />
          <span>Hafta içi aynı gün kargo</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-600" />
          <span>Tahmini teslim: {estimatedDate}</span>
        </div>
      </div>

      {/* 💰 Toplam */}
      <div className="border-t pt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Ara Toplam</span>
          <span>₺{subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-teal-600 mb-1">
            <span>İndirim</span>
            <span>-₺{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-lg text-gray-800">
          <span>Toplam</span>
          <span>₺{total.toFixed(2)}</span>
        </div>
      </div>

      {/* 🟢 Buton */}
      <button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-xl font-semibold shadow-md hover:from-teal-600 hover:to-teal-700 transition-all duration-300 active:scale-95">
        Siparişi Tamamla
      </button>

      <p className="text-xs text-center text-gray-400 mt-2">
        Ücretsiz kargo ile gönderim 💨
      </p>
    </div>
  );
}
