import { Sparkles, Heart, Leaf, Shield, Clock, Star } from "lucide-react";
import { Product } from "../types";
import { products, benefits } from "../data/products";
import ProductCard from "../components/ProductCard";

interface HomePageProps {
  onAddToCart: (product: Product) => Promise<void>; // 🔹 async düzeltme
  onBuyNow: (product: Product) => Promise<void>; // 🔹 async düzeltme
  onNavigate: (page: string) => void;
}

export default function HomePage({
  onAddToCart,
  onBuyNow,
  onNavigate,
}: HomePageProps) {
  return (
    <div>
      {/* === HERO SECTION === */}
      <section className="relative bg-gradient-to-br from-white via-teal-50/30 to-white py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/30 rounded-full filter blur-3xl animate-pulse-glow"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/20 rounded-full filter blur-3xl animate-pulse-glow"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Leaf className="w-4 h-4" />
                %100 Doğal Çözüm
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Doğal aktif karbonun gücüyle evin her zaman ferah
              </h1>

              <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
                MiyoMint, kedin için güvenli, doğa için zararsız, evin için ferah
                bir çözüm. Sadece aktif karbon içerir, kimyasal yoktur.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onNavigate("products")}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative z-10">Ürünleri İncele</span>
                </button>
                <button
                  onClick={() => onNavigate("about")}
                  className="bg-white text-teal-600 px-8 py-4 rounded-xl font-semibold border-2 border-teal-600 hover:bg-teal-50 transition-all duration-300 transform hover:scale-105 hover:border-teal-700 hover:shadow-lg"
                >
                  Daha Fazla Bilgi
                </button>
              </div>

              <div className="flex items-center gap-8 mt-10 sm:mt-12">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">1000+ mutlu müşteri</p>
                </div>
                <div className="h-10 w-px bg-gray-300 hidden sm:block" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">%100</p>
                  <p className="text-sm text-gray-600">Doğal içerik</p>
                </div>
              </div>
            </div>

            <div
              className="relative animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="relative z-10 animate-float">
                <img
                  src="/image.png"
                  alt="MiyoMint Ürün"
                  className="w-full max-w-lg mx-auto drop-shadow-2xl"
                />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-teal-200/40 to-teal-300/40 rounded-full blur-3xl animate-pulse-glow" />
            </div>
          </div>
        </div>
      </section>

      {/* === FAYDALAR === */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:from-teal-50 hover:to-teal-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-100 hover:border-teal-200"
              >
                <div className="text-4xl mb-3">{benefit.icon}</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2">
                  {benefit.title}
                </h3>
                <p className="text-xs text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === AKTİF KARBON NEDİR === */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-block bg-teal-500/20 px-4 py-2 rounded-full mb-6">
            <span className="text-teal-300 font-semibold">
              Aktif Karbon Nedir?
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            Doğanın En Güçlü Koku Gidericisi
          </h2>
          <p className="text-gray-300 text-base sm:text-lg max-w-3xl mx-auto">
            Aktif karbon, binlerce yıldır doğal bir temizleyici olarak kullanılan,
            gözenekli yapısıyla kötü kokuları emen ve zararlı maddeleri bağlayan doğal bir maddedir.
          </p>
        </div>
      </section>

      {/* === ÜRÜNLERİMİZ === */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ürünlerimiz
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              İhtiyacınıza uygun paketi seçin ve evinizde doğal tazelik yaşayın
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onBuyNow={onBuyNow}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === NEDEN MİYOMİNT === */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="p-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Neden MiyoMint?
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      icon: <Sparkles className="w-5 h-5 text-white" />,
                      title: "%100 Doğal Aktif Karbon",
                      text: "Kimyasal içermeyen, tamamen doğal formül ile kediniz ve çevreniz için güvenli.",
                    },
                    {
                      icon: <Shield className="w-5 h-5 text-white" />,
                      title: "Veteriner Onaylı",
                      text: "Kedi sağlığına tamamen zararsız, güvenle kullanabileceğiniz bir ürün.",
                    },
                    {
                      icon: <Clock className="w-5 h-5 text-white" />,
                      title: "Anında Etki",
                      text: "Kötü kokuları saniyeler içinde emer, evinizde anında ferahlık sağlar.",
                    },
                    {
                      icon: <Heart className="w-5 h-5 text-white" />,
                      title: "Uzun Süre Kullanım",
                      text: "Bir paket ortalama 1 ay yeterli olur, ekonomik ve pratik çözüm.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          {item.title}
                        </h3>
                        <p className="text-teal-50 text-sm">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigate("products")}
                  className="mt-8 bg-white text-teal-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Hemen Sipariş Ver
                </button>
              </div>

              <div className="relative h-full min-h-[400px] lg:min-h-[600px]">
                <img
                  src="/image.png"
                  alt="MiyoMint Ürün Detay"
                  className="absolute inset-0 w-full h-full object-contain p-8"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === MÜŞTERİ YORUMLARI === */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Müşterilerimiz Ne Diyor?
            </h2>
            <p className="text-lg text-gray-600">
              Binlerce mutlu müşterimizden bazıları
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Ayşe Yıldız",
                initials: "AY",
                city: "İstanbul",
                text: "MiyoMint'i kullanmaya başladığımdan beri evimde hiç kedi kumu kokusu kalmıyor.",
              },
              {
                name: "Mehmet Kaya",
                initials: "MK",
                city: "Ankara",
                text: "3 kedim var ve hepsinin kumlarına kullanıyorum. Kimyasal içermediği için gönül rahatlığıyla kullanabiliyorum.",
              },
              {
                name: "Zeynep Öztürk",
                initials: "ZÖ",
                city: "İzmir",
                text: "Daha önce parfümlü ürünler kullanıyordum ama kedim rahatsız oluyordu. MiyoMint tamamen kokusuz ve çok etkili.",
              },
            ].map((review, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-white to-teal-50 rounded-2xl p-8 border border-teal-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic leading-relaxed">
                  “{review.text}”
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-200 rounded-full flex items-center justify-center">
                    <span className="text-teal-700 font-bold text-lg">
                      {review.initials}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {review.name}
                    </p>
                    <p className="text-sm text-gray-600">{review.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA === */}
      <section className="py-16 bg-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Kedin mutlu, evin taze
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Ücretsiz kargo ile tüm Türkiye'ye gönderim yapıyoruz
          </p>
          <button
            onClick={() => onNavigate("products")}
            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative z-10">Alışverişe Başla</span>
          </button>
        </div>
      </section>
    </div>
  );
}
