import { useState } from "react";
import {
  CheckCircle,
  MapPin,
  CreditCard,
  ShoppingBag,
  Loader2,
} from "lucide-react";

import { supabaseService } from "../lib/supabaseService";
import { CartItem } from "../types";

interface GuestCheckoutPageProps {
  items: CartItem[];
  onCancel?: () => void;
  onPaymentRedirect?: (orderData: unknown) => void;
  onClearCart?: () => void;
}

const steps = [
  { id: 1, label: "Teslimat Bilgileri", icon: MapPin },
  { id: 2, label: "Ödeme", icon: CreditCard },
  { id: 3, label: "Onay", icon: CheckCircle },
];

export default function GuestCheckoutPage({
  items,
  onCancel,
  onPaymentRedirect,
  onClearCart,
}: GuestCheckoutPageProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    note: "",
  });

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (!form.name || !form.phone || !form.address) {
      alert("Lütfen ad soyad, telefon ve adres alanlarını doldurun.");
      return;
    }
    setStep(2);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const orderId =
        crypto.randomUUID?.() || Math.random().toString(36).slice(2, 10);

      const orderData = {
        id: orderId,
        full_name: form.name,
        email: form.email || "",
        phone: form.phone,
        address: form.address,
        city: form.city,
        district: form.district,
        note: form.note,
        total_amount: total,
      };

      await supabaseService.addGuestOrder(orderData);

      for (const item of items) {
        await supabaseService.addGuestOrderItem({
          order_id: orderId,
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || "",
        });
      }

      await supabaseService.clearGuestCart();
      onClearCart?.();
      setStep(3);
      onPaymentRedirect?.(orderData);
    } catch (error) {
      console.error("Misafir siparişi hatası:", error);
      alert("Sipariş kaydedilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white text-center">
        <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md border border-green-100">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Siparişiniz alındı!
          </h1>
          <p className="text-gray-600 mb-4">
            Sipariş bilgileriniz e-posta adresinize gönderildi. Teşekkürler.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-3 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 sm:px-8 py-4">
            {steps.map(({ id, label, icon: Icon }) => (
              <div
                key={id}
                className={`flex items-center gap-2 text-sm sm:text-base font-medium ${
                  step >= id ? "text-white" : "text-white/60"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Teslimat Bilgileri
              </h2>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["name", "email", "phone", "city", "district"].map((field) => (
                  <input
                    key={field}
                    name={field}
                    placeholder={
                      field === "name"
                        ? "Ad Soyad"
                        : field === "email"
                        ? "E-posta (isteğe bağlı)"
                        : field === "phone"
                        ? "Telefon"
                        : field === "city"
                        ? "İl"
                        : "İlçe"
                    }
                    value={(form as Record<string, string>)[field]}
                    onChange={handleChange}
                    className="border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  />
                ))}
                <textarea
                  name="address"
                  placeholder="Adres"
                  value={form.address}
                  onChange={handleChange}
                  className="border rounded-lg px-4 py-3 md:col-span-2 h-24 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
                <textarea
                  name="note"
                  placeholder="Teslimat notu (isteğe bağlı)"
                  value={form.note}
                  onChange={handleChange}
                  className="border rounded-lg px-4 py-3 md:col-span-2 h-20 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </form>

              <div className="flex flex-col sm:flex-row gap-3 mt-8 sm:items-center sm:justify-between">
                <button
                  onClick={onCancel}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition"
                >
                  Geri Dön
                </button>
                <button
                  onClick={handleNext}
                  className="w-full sm:w-auto px-8 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 shadow-md transition"
                >
                  Ödemeye Geç
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-8 sm:p-10 text-center">
              {loading ? (
                <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
              ) : (
                <CreditCard className="w-12 h-12 text-teal-600 mx-auto mb-4" />
              )}
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Güvenli ödemeye hazırsınız
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Siparişi tamamlamak için ödeme işlemini başlatın.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition"
                >
                  Geri Dön
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 shadow-lg disabled:opacity-70 transition"
                >
                  {loading ? "Yönlendiriliyor..." : "Ödemeye Git"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 h-fit lg:sticky lg:top-10">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4">
            <ShoppingBag className="w-6 h-6 text-teal-600" /> Sepet Özeti
          </h2>
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              Sepetiniz boş görünüyor.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {item.price} TL
                    </p>
                  </div>
                  <p className="font-semibold text-teal-700">
                    {(item.price * item.quantity).toFixed(2)} TL
                  </p>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-gray-900">
                  <span>Toplam</span>
                  <span className="text-teal-700">
                    {total.toFixed(2)} TL
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
