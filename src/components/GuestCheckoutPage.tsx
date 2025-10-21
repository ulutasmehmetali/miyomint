import { useEffect, useState } from "react";
import { supabaseService } from "../lib/supabaseService";
import { v4 as uuidv4 } from "uuid";
import { CartItem } from "../types";
import { Plus, Minus, Trash2 } from "lucide-react";

export default function GuestCheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    note: "",
  });

  // 🧾 Misafir sepetini yükle ve sayfayı yukarı kaydır
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchCart = async () => {
      try {
        const list = await supabaseService.getGuestCart();
        setItems(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Sepet yükleme hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // 🧾 Form değişikliklerini yakala
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ❌ Sepetten ürün sil
  const handleRemoveItem = async (itemId?: string) => {
    if (!itemId) return;
    try {
      await supabaseService.removeGuestCartItem(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error("Ürün silinemedi:", err);
    }
  };

  // 🔄 Adet güncelle
  const handleUpdateQty = async (itemId?: string, newQty?: number) => {
    if (!itemId || !newQty) return;
    if (newQty <= 0) return handleRemoveItem(itemId);

    try {
      await supabaseService.updateGuestCartItem(itemId, newQty);
      setItems((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, quantity: newQty } : it))
      );
    } catch (err) {
      console.error("Miktar güncellenemedi:", err);
    }
  };

  // 💳 Siparişi tamamlama işlemi
  const handleCheckout = async () => {
    if (
      !form.full_name ||
      !form.email ||
      !form.phone ||
      !form.address ||
      !form.city
    ) {
      alert("Lütfen tüm gerekli alanları doldurun.");
      return;
    }

    if (items.length === 0) {
      alert("Sepetiniz boş!");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ guest_orders kaydı oluştur
      const orderId = uuidv4();
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

      await supabaseService.addGuestOrder({
        id: orderId,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        district: form.district,
        note: form.note,
        total_amount: total,
      });

      // 2️⃣ guest_order_items kayıtlarını oluştur
      for (const item of items) {
        await supabaseService.addGuestOrderItem({
          order_id: orderId,
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image ?? undefined,
        });
      }

      // 3️⃣ Sepeti temizle
      await supabaseService.clearGuestCart();
      setItems([]);

      // 4️⃣ Bilgilendirme
      alert(
        `Teşekkürler ${form.full_name}! Siparişiniz başarıyla alındı. Size e-posta ile bilgi gönderilecektir.`
      );
    } catch (err) {
      console.error("Sipariş oluşturma hatası:", err);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // 🌀 Yükleniyor ekranı
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 grid md:grid-cols-2 gap-8">
      {/* 🧍‍♂️ Teslimat bilgileri formu */}
      <div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Teslimat Bilgileri
        </h2>

        <input
          type="text"
          name="full_name"
          placeholder="Ad Soyad"
          value={form.full_name}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 text-gray-700"
        />
        <input
          type="email"
          name="email"
          placeholder="E-posta"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 text-gray-700"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Telefon"
          value={form.phone}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 text-gray-700"
        />
        <input
          type="text"
          name="city"
          placeholder="İl"
          value={form.city}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 text-gray-700"
        />
        <input
          type="text"
          name="district"
          placeholder="İlçe"
          value={form.district}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 text-gray-700"
        />
        <textarea
          name="address"
          placeholder="Adres"
          value={form.address}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 text-gray-700 h-24 resize-none"
        />
        <textarea
          name="note"
          placeholder="Teslimat notu (isteğe bağlı)"
          value={form.note}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 text-gray-700 h-20 resize-none"
        />

        <button
          onClick={handleCheckout}
          className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition"
        >
          Ödemeye Geç →
        </button>
      </div>

      {/* 🧾 Sepet Özeti */}
      <aside className="bg-white p-6 rounded-2xl shadow-lg h-fit sticky top-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          Sepet Özeti
        </h3>

        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Sepetiniz boş</p>
            <p className="text-gray-400 text-sm mt-1">
              Ürün ekleyerek alışverişe başlayın
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id ?? item.product_id}
                className="flex items-start justify-between border-b border-gray-100 pb-3"
              >
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} x ₺{item.price}
                  </p>

                  <div className="mt-2 inline-flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                    <button
                      onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                      className="p-1 text-gray-600 hover:text-teal-600 transition"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-gray-900 min-w-[1.5rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                      className="p-1 text-gray-600 hover:text-teal-600 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <p className="font-semibold text-teal-600 whitespace-nowrap">
                    ₺{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toplam + Ücretsiz kargo */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Toplam</span>
            <span className="text-lg font-bold text-teal-600">
              ₺{total.toFixed(2)}
            </span>
          </div>

          <p className="text-sm text-center text-teal-700 bg-teal-50 py-2 rounded-lg mt-3 font-medium shadow-sm">
            🚚 Ücretsiz kargo — 2 iş günü içinde teslim
          </p>
        </div>
      </aside>
    </div>
  );
}
