import { useEffect, useState } from "react";
import { supabaseService } from "../lib/supabaseService";
import CheckoutSummary from "../components/CheckoutSummary";
import { v4 as uuidv4 } from "uuid";

export default function GuestCheckoutPage() {
  const [items, setItems] = useState<any[]>([]);
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

  // 🧾 Misafir sepetini yükle
  useEffect(() => {
    const fetchCart = async () => {
      const { data, error } = await supabaseService.getGuestCart();
      if (error) console.error("Sepet yükleme hatası:", error);
      else setItems(data || []);
      setLoading(false);
    };
    fetchCart();
  }, []);

  // 🧾 Input değişikliklerini yakala
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🟢 Siparişi tamamlama işlemi
  const handleCheckout = async () => {
    if (!form.full_name || !form.email || !form.phone || !form.address || !form.city) {
      alert("Lütfen tüm gerekli alanları doldurun.");
      return;
    }

    if (items.length === 0) {
      alert("Sepetiniz boş!");
      return;
    }

    try {
      setLoading(true);

      // 🧩 1️⃣ guest_orders kaydı oluştur
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

      // 🧩 2️⃣ guest_order_items kayıtlarını oluştur
      for (const item of items) {
        await supabaseService.addGuestOrderItem({
          order_id: orderId,
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || null,
        });
      }

      // 🧩 3️⃣ Sepeti temizle
      await supabaseService.clearGuestCart();
      setItems([]);

      // 🧩 4️⃣ Mail / bilgilendirme mesajı
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

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Yükleniyor...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 grid md:grid-cols-2 gap-8">
      {/* 🧍‍♂️ Kullanıcı bilgileri formu */}
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
          placeholder="Şehir"
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
          placeholder="Not (isteğe bağlı)"
          value={form.note}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 text-gray-700 h-20 resize-none"
        />
      </div>

      {/* 🧾 Sipariş özeti */}
      <CheckoutSummary items={items} onCheckout={handleCheckout} />
    </div>
  );
}
