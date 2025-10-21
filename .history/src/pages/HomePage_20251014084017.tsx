import { Sparkles, Heart, Leaf, Shield, Clock, Star, Zap } from 'lucide-react';
import { Product } from '../types';
import { products, benefits } from '../data/products';
import ProductCard from '../components/ProductCard';

interface HomePageProps {
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onNavigate: (page: string) => void;
}

export default function HomePage({ onAddToCart, onBuyNow, onNavigate }: HomePageProps) {
  return (
    <div>

      {/* 🔴 SÜPER İNDİRİM BANDI */}
      <div
        className="
          w-full 
          bg-gradient-to-r from-red-500 via-orange-500 to-red-600 
          text-white 
          text-center 
          py-1.5 sm:py-2 
          text-sm sm:text-base 
          font-semibold 
          flex flex-wrap justify-center items-center gap-2 
          shadow-md 
          mb-[-10px]
        "
      >
        <Zap className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
        <span className="whitespace-nowrap">SÜPER İNDİRİM KAMPANYASI!</span>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium text-xs sm:text-sm">Bitimine: 05:33:40</span>
        </div>
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs sm:text-sm font-semibold">
          %33'e Varan İndirim!
        </span>
      </div>

      {/* 🌿 ANA BANNER */}
      <section className="relative bg-gradient-to-br from-white via-teal-50/30 to-white py-14 sm:py-16 overflow-hidden mt-[-20px] sm:mt-[-10px]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/30 rounded-full filter blur-3xl animate-pulse-glow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/20 rounded-full filter blur-3xl animate-pulse-glow" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Leaf className="w-4 h-4" />
                %100 Doğal Çözüm
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Doğal aktif karbonun gücüyle evin her zaman ferah
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                MiyoMint, kedin için güvenli, doğa için zararsız, evin için ferah bir çözüm. Sadece aktif karbon içerir, kimyasal yoktur.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onNavigate('products')}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative z-10">Ürünleri İncele</span>
                </button>
                <button
                  onClick={() => onNavigate('about')}
                  className="bg-white text-teal-600 px-8 py-4 rounded-xl font-semibold border-2 border-teal-600 hover:bg-teal-50 transition-all duration-300 transform hover:scale-105 hover:border-teal-700 hover:shadow-lg"
                >
                  Daha Fazla Bilgi
                </button>
              </div>

              <div className="flex items-center gap-8 mt-12">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">1000+ mutlu müşteri</p>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">%100</p>
                  <p className="text-sm text-gray-600">Doğal içerik</p>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-up" style={{animationDelay: '0.2s'}}>
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

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:from-teal-50 hover:to-teal-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-100 hover:border-teal-200"
              >
                <div className="text-4xl mb-3">{benefit.icon}</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2">{benefit.title}</h3>
                <p className="text-xs text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block bg-teal-500/20 px-4 py-2 rounded-full mb-6">
              <span className="text-teal-300 font-semibold">Aktif Karbon Nedir?</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
              Doğanın En Güçlü Koku Gidericisi
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Aktif karbon, binlerce yıldır doğal bir temizleyici olarak kullanılan, gözenekli yapısıyla
              kötü kokuları emen ve zararlı maddeleri bağlayan doğal bir maddedir.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl">
                <div className="aspect-square bg-white rounded-2xl overflow-hidden relative">
                  <img
                    src="/aktifkarbons.jpeg"
                    alt="Doğal Aktif Karbon"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent flex items-end p-6">
                    <p className="text-white text-base font-semibold">
                      Hindistan Cevizi Kabuğundan Üretilir
                    </p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <p className="text-3xl font-bold text-teal-400 mb-1">7 Gün</p>
                    <p className="text-gray-300 text-sm">Tek kullanımda etki süresi</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <p className="text-3xl font-bold text-teal-400 mb-1">%99.9</p>
                    <p className="text-gray-300 text-sm">Koku emilim oranı</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-teal-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Mikro Gözenekli Yapı</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Aktif karbon, milyonlarca mikro gözenek içerir. Bu gözenekler koku moleküllerini
                      yakalar ve hapseder, böylece kötü kokular ortamdan tamamen uzaklaşır.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">%100 Doğal Kaynak</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Hindistan cevizi kabuğundan elde edilen aktif karbon, tamamen doğal ve sürdürülebilir
                      bir kaynaktır. Kimyasal işlem görmez, doğal haliyle kullanılır.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Güvenli ve Etkili</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Veterinerler tarafından onaylanan aktif karbon, insanlar ve hayvanlar için tamamen
                      zararsızdır. Tıp alanında da yaygın olarak kullanılır.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-8 border border-teal-500/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">
                  MiyoMint'te %100 Aktif Karbon Kullanıyoruz
                </h3>
                <p className="text-gray-300">
                  Ürünümüzde hiçbir kimyasal katkı maddesi, parfüm veya zararlı bileşen bulunmaz.
                  Sadece doğal aktif karbon ile eviniz her zaman ferah kalır.
                </p>
              </div>
              <button
                onClick={() => onNavigate('products')}
                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                Hemen Deneyin
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
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
                style={{animationDelay: `${index * 0.1}s`}}
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

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="p-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Neden MiyoMint?
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">%100 Doğal Aktif Karbon</h3>
                      <p className="text-teal-50 text-sm">
                        Kimyasal içermeyen, tamamen doğal formül ile kediniz ve çevreniz için güvenli
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Veteriner Onaylı</h3>
                      <p className="text-teal-50 text-sm">
                        Kedi sağlığına tamamen zararsız, güvenle kullanabileceğiniz bir ürün
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Anında Etki</h3>
                      <p className="text-teal-50 text-sm">
                        Kötü kokuları saniyeler içinde emer, evinizde anında ferahlık sağlar
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Uzun Süre Kullanım</h3>
                      <p className="text-teal-50 text-sm">
                        Bir paket ortalama 1 ay yeterli olur, ekonomik ve pratik çözüm
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('products')}
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

      {/* 🐾 MÜŞTERİ YORUMLARI */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Müşterilerimiz Ne Diyor?
            </h2>
            <p className="text-lg text-gray-600">Binlerce mutlu müşterimizden bazıları</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((id) => (
              <div
                key={id}
                className="bg-gradient-to-br from-white to-teal-50 rounded-2xl p-8 border border-teal-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic leading-relaxed">
                  {id === 1
                    ? "MiyoMint'i kullanmaya başladığımdan beri evimde hiç kedi kumu kokusu kalmıyor. Hem doğal hem de çok etkili. Kesinlikle tavsiye ederim!"
                    : id === 2
                    ? "3 kedim var ve hepsinin kumlarına kullanıyorum. Kimyasal içermediği için gönül rahatlığıyla kullanabiliyorum. Çok memnunum!"
                    : "Daha önce parfümlü ürünler kullanıyordum ama kedim rahatsız oluyordu. MiyoMint tamamen kokusuz ve çok etkili. Harika bir ürün!"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 📦 NASIL KULLANILIR */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Nasıl Kullanılır?
            </h2>
            <p className="text-lg text-gray-600">Sadece 3 basit adımda eviniz taze kalacak</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["Temiz Kum Kullanın", "MiyoMint Serpin ve Karıştırın", "Ferahlık Yaşayın"].map(
              (title, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 border-2 border-teal-200 shadow-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <span className="text-white text-2xl font-bold">{i + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{title}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {i === 0
                      ? "Kedi kum kabınızı temizleyin ve temiz kum kullanın"
                      : i === 1
                      ? "3 yemek kaşığı kadar MiyoMint'i kumun üzerine serpip karıştırın"
                      : "Evinizin ferah kalmasının tadını çıkarın. Her kum değişiminde tekrarlayın"}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* 💚 GARANTİ BLOĞU */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-white to-teal-50 rounded-3xl border-2 border-teal-200 p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">%100 Memnuniyet Garantisi</h3>
                <p className="text-sm text-gray-600">
                  Ürünümüzden memnun kalmazsanız parayınızı iade ediyoruz
                </p>
              </div>

              <div>
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Güvenli Alışveriş</h3>
                <p className="text-sm text-gray-600">Kart bilgileriniz SSL sertifikası ile korunur</p>
              </div>

              <div>
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Ücretsiz Kargo</h3>
                <p className="text-sm text-gray-600">Tüm Türkiye'ye 2-3 iş günü içinde teslimat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🎁 SON CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Kedin mutlu, evin taze
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Ücretsiz kargo ile tüm Türkiye'ye gönderim yapıyoruz
          </p>
          <button
            onClick={() => onNavigate('products')}
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
