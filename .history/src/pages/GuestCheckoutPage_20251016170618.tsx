import { useState, useEffect } from "react";
import { CheckCircle, MapPin, CreditCard, ShoppingBag, Loader2 } from "lucide-react";
import { supabaseService } from "../lib/supabaseService";

interface GuestCheckoutPageProps {
  onCancel?: () => void;
  onPaymentRedirect?: (orderData: any) => void;
}

export default function GuestCheckoutPage({ onCancel, onPaymentRedirect }: GuestCheckoutPageProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    note: "",
  });

  // 🛒 Supabase’ten sepet yükle (guest)
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const list = await supabaseService.getGuestCart(); // <- DİREKT DİZİ
        setCart(list || []);
      } catch (err) {
        console.error("Sepet yüklenemedi:", err);
        setCart([]);
      }
    };
    fetchCart();
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleNext = () => {
    if (!form.name || !form.phone || !form.address) {
      alert("Lütfen gerekli alanları doldurun (Ad Soyad, Telefon, Adres).");
      return;
    }
    setStep(2);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const orderId = crypto.randomUUID?.() || Math.random().toString(36).slice(2, 10);
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

      // ürünleri ekle
      for (const item of cart) {
        await supabaseService.addGuestOrderItem({
          order_id: orderId,
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        });
      }

      // sepeti temizle
      await supabaseService.clearGuestCart();
      setCart([]);
      setStep(3);

      onPaymentRedirect?.(orderData);
    } catch (err) {
      console.error("Misafir sipariş hatası:", err);
      alert("Sipariş kaydedilirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3 – başarı
  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white text-center animate-fade-in">
        <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md border border-green-100">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4 animate-bounce" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Siparişiniz Alındı 🎉</h1>
          <p className="text-gray-600 mb-4">Sipariş bilgileriniz e-posta adresinize gönderildi. Teşekkür ederiz 💚</p>
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

  // Step 1 & 2
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Sol */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex justify-between items-center bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? "opacity-100" : "opacity-50"}`}>
              <MapPin className="w-5 h-5" />
              <span>Teslimat Bilgileri</span>
            </div>
            <div className={`flex items-center gap-2 ${step >= 2 ? "opacity-100" : "opacity-50"}`}>
              <CreditCard className="w-5 h-5" />
              <span>Ödeme</span>
            </div>
            <div className={`flex items-center gap-2 ${step === 3 ? "opacity-100" : "opacity-50"}`}>
              <CheckCircle className="w-5 h-5" />
              <span>Onay</span>
            </div>
          </div>

          {step === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Teslimat Bilgileri</h2>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["name", "email", "phone", "city", "district"].map(field => (
                  <input
                    key={field}
                    name={field}
                    placeholder={
                      field === "name" ? "Ad Soyad" : field === "email" ? "E-posta (isteğe bağlı)" : field === "phone" ? "Telefon" : field === "city" ? "İl" : "İlçe"
                    }
                    value={(form as any)[field]}
                    onChange={handleChange}
                    className="border rounded-lg px-4 py-3"
                  />
                ))}
                <textarea
                  name="address"
                  placeholder="Adres"
                  value={form.address}
                  onChange={handleChange}
                  className="border rounded-lg px-4 py-3 md:col-span-2 h-24"
                />
                <textarea
                  name="note"
                  placeholder="Teslimat Notu (isteğe bağlı)"
                  value={form.note}
                  onChange={handleChange}
                  className="border rounded-lg px-4 py-3 md:col-span-2 h-20"
                />
              </form>

              <div className="flex justify-between mt-8">
                <button onClick={onCancel} className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100">
                  Geri Dön
                </button>
                <button onClick={handleNext} className="px-8 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 shadow-md">
                  Ödemeye Geç →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-10 text-center">
              {loading ? <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" /> : <CreditCard className="w-12 h-12 text-teal-600 mx-auto mb-4" />}
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Güvenli Ödemeye Hazırsınız</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Siparişinizi tamamlamak için ödeme işlemini başlatın.</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => setStep(1)} className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100">
                  ← Geri Dön
                </button>
                <button onClick={handlePayment} disabled={loading} className="px-8 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 shadow-lg">
                  {loading ? "Yönlendiriliyor..." : "Ödemeye Git"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sağ: Sepet Özeti */}
        <div className="bg-white rounded-3xl shadow-xl p-6 h-fit lg:sticky lg:top-10">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4">
            <ShoppingBag className="w-6 h-6 text-teal-600" /> Sepet Özeti
          </h2>
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Sepetiniz boş 🛒</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x ₺{item.price}
                    </p>
                  </div>
                  <p className="font-semibold text-teal-700">₺{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-gray-900">
                  <span>Toplam</span>
                  <span className="text-teal-700">₺{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
