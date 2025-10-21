import { useState } from "react";
import { CheckCircle, MapPin, CreditCard, Mail } from "lucide-react";

interface GuestCheckoutPageProps {
  onCancel: () => void;
  onPaymentRedirect: (orderData: any) => void;
}

export default function GuestCheckoutPage({
  onCancel,
  onPaymentRedirect,
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (!form.name || !form.email || !form.phone || !form.address) {
      alert("Lütfen gerekli alanları doldurun.");
      return;
    }
    setStep(2);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const order = {
        ...form,
        cart,
        total: cart.reduce(
          (sum: number, item: any) => sum + item.price * item.quantity,
          0
        ),
        date: new Date().toISOString(),
      };

      // 🔹 Backend üzerinden sanal POS’a yönlendirme
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      const data = await res.json();

      if (data?.success) {
        // Başarılı ödeme simülasyonu
        localStorage.removeItem("cart");
        setStep(3);
        onPaymentRedirect(order);
      } else if (data?.redirectUrl) {
        // Eğer redirect gerekiyorsa
        window.location.href = data.redirectUrl;
      } else {
        alert("Ödeme başlatılamadı. Lütfen tekrar deneyin.");
      }
    } catch (err) {
      console.error(err);
      alert("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* === ÜST STEP NAV === */}
        <div className="flex justify-between items-center bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4">
          <div
            className={`flex items-center gap-2 ${
              step >= 1 ? "opacity-100" : "opacity-50"
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span>Teslimat Bilgileri</span>
          </div>
          <div
            className={`flex items-center gap-2 ${
              step >= 2 ? "opacity-100" : "opacity-50"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Ödeme</span>
          </div>
          <div
            className={`flex items-center gap-2 ${
              step === 3 ? "opacity-100" : "opacity-50"
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Onay</span>
          </div>
        </div>

        {/* === STEP 1 === */}
        {step === 1 && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Teslimat Bilgileri
            </h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                name="name"
                placeholder="Ad Soyad"
                value={form.name}
                onChange={handleChange}
                className="border rounded-lg px-4 py-3"
                required
              />
              <input
                name="email"
                placeholder="E-posta"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="border rounded-lg px-4 py-3"
                required
              />
              <input
                name="phone"
                placeholder="Telefon"
                value={form.phone}
                onChange={handleChange}
                className="border rounded-lg px-4 py-3"
                required
              />
              <input
                name="city"
                placeholder="İl"
                value={form.city}
                onChange={handleChange}
                className="border rounded-lg px-4 py-3"
                required
              />
              <input
                name="district"
                placeholder="İlçe"
                value={form.district}
                onChange={handleChange}
                className="border rounded-lg px-4 py-3"
              />
              <textarea
                name="address"
                placeholder="Adres"
                value={form.address}
                onChange={handleChange}
                className="border rounded-lg px-4 py-3 md:col-span-2 h-24"
                required
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
              <button
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100"
              >
                Geri Dön
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 shadow-md"
              >
                Ödemeye Geç →
              </button>
            </div>
          </div>
        )}

        {/* === STEP 2 === */}
        {step === 2 && (
          <div className="p-10 text-center">
            <CreditCard className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Ödemeye Hazırsınız
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Bilgileriniz alındı. Şimdi güvenli ödeme sayfasına
              yönlendirileceksiniz.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100"
              >
                ← Geri Dön
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="px-8 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 shadow-lg"
              >
                {loading ? "Yönlendiriliyor..." : "Ödemeye Git"}
              </button>
            </div>
          </div>
        )}

        {/* === STEP 3 === */}
        {step === 3 && (
          <div className="p-10 text-center">
            <CheckCircle className="w-16 h-16 text-teal-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Siparişiniz Alındı!
            </h2>
            <p className="text-gray-600 mb-8">
              Sipariş numaranız e-posta adresinize gönderildi. Teşekkür ederiz 💚
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-8 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 shadow-md"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
