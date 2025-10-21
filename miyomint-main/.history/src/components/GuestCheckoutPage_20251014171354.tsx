import { useState, useMemo } from "react";
import CheckoutSummary from "../components/CheckoutSummary";
import { CartItem } from "../types";
import { Loader2, CheckCircle } from "lucide-react";


interface GuestCheckoutPageProps {
  onCancel: () => void;
  onPaymentRedirect: () => void;
}

export default function GuestCheckoutPage({
  onCancel,
  onPaymentRedirect,
}: GuestCheckoutPageProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    note: "",
  });

  const [cartItems] = useState<CartItem[]>(
    JSON.parse(localStorage.getItem("cart") || "[]")
  );

  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // 📦 Sipariş numarası: MYM-YYYYMMDD-XXXX formatında
  const generateOrderNumber = () => {
    const now = new Date();
    const datePart = `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `MYM-${datePart}-${randomPart}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      alert("Lütfen gerekli tüm alanları doldurun.");
      return;
    }

    // 🕓 Sipariş numarası oluştur ve yükleme animasyonu başlat
    const newOrderNumber = generateOrderNumber();
    setOrderNumber(newOrderNumber);
    setLoading(true);

    // ✅ sepeti temizle + animasyonlu yönlendirme
    setTimeout(() => {
      localStorage.removeItem("cart");
      setLoading(false);
      onPaymentRedirect();
    }, 2500);
  };

  // 🧮 Sepet boşsa bilgi mesajı
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gray-50 px-4">
        <CheckCircle className="w-16 h-16 text-teal-600 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Sepetiniz boş
        </h2>
        <p className="text-gray-500">
          Lütfen ürün ekleyip sipariş işlemini tekrar başlatın.
        </p>
      </div>
    );
  }

  // 🌀 Yükleniyor ekranı
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-white text-center">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">
          Ödeme Sayfasına Yönlendiriliyor...
        </h2>
        {orderNumber && (
          <p className="text-gray-500 mt-2">
            Sipariş Numaranız:{" "}
            <span className="font-semibold text-teal-700">{orderNumber}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex flex-col md:flex-row gap-8 justify-center">
      {/* Sol taraf - Teslimat Formu */}
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6 border-b pb-3">
          <h2 className="text-2xl font-semibold text-gray-800">
            Teslimat Bilgileri
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Ad Soyad"
              value={form.name}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="E-posta"
              value={form.email}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="tel"
              name="phone"
              placeholder="Telefon"
              value={form.phone}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
            <input
              type="text"
              name="city"
              placeholder="İl"
              value={form.city}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <input
            type="text"
            name="district"
            placeholder="İlçe"
            value={form.district}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />

          <textarea
            name="address"
            placeholder="Adres"
            value={form.address}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2 h-24 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
            required
          />

          <textarea
            name="note"
            placeholder="Teslimat Notu (isteğe bağlı)"
            value={form.note}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2 h-20 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
          />

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
            >
              Geri Dön
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all"
            >
              Ödemeye Geç →
            </button>
          </div>
        </form>
      </div>

      {/* Sağ taraf - Sepet Özeti */}
      <div className="w-full max-w-sm">
        <CheckoutSummary items={cartItems} />
      </div>
    </div>
  );
}
