import { Heart, Leaf, Target, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Biz Kimiz?
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            MiyoMint olarak, kedili evlerde yaşanan koku problemine doğal ve güvenli bir çözüm sunuyoruz
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="animate-slide-up">
            <img
              src="/image.png"
              alt="MiyoMint Ürün"
              className="w-full max-w-md mx-auto drop-shadow-xl animate-float"
            />
          </div>

          <div className="space-y-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h2 className="text-3xl font-bold text-gray-900">
              Doğal Çözümlerle Sağlıklı Yaşam
            </h2>
            <p className="text-gray-600 leading-relaxed">
              MiyoMint, evcil hayvan sahiplerinin en büyük sorunlarından biri olan kedi kumu kokusuna
              tamamen doğal bir çözüm getiriyor. %100 aktif karbon içeren ürünümüz, kimyasal madde veya
              yapay parfüm kullanmadan, kötü kokuları anında emer ve nötralize eder.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Aktif karbon, binlerce yıldır doğal bir temizleyici ve koku giderici olarak kullanılmaktadır.
              Biz de bu doğal gücü, modern teknoloji ile birleştirerek kedili evler için özel olarak tasarladık.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Ürünümüz, kedinizin ve ailenizin sağlığını ön planda tutarak geliştirilmiştir. Veteriner onaylı
              formülümüz sayesinde güvenle kullanabilir, hem kedinizin hem de evinizin ferah kalmasını sağlayabilirsiniz.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <div className="text-center p-8 bg-gradient-to-br from-teal-50 to-white rounded-2xl border border-teal-100">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Doğal</h3>
            <p className="text-gray-600 text-sm">
              %100 doğal aktif karbon, kimyasal içermez
            </p>
          </div>

          <div className="text-center p-8 bg-gradient-to-br from-teal-50 to-white rounded-2xl border border-teal-100">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Güvenli</h3>
            <p className="text-gray-600 text-sm">
              Kediniz ve aileniz için tamamen zararsız
            </p>
          </div>

          <div className="text-center p-8 bg-gradient-to-br from-teal-50 to-white rounded-2xl border border-teal-100">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Etkili</h3>
            <p className="text-gray-600 text-sm">
              Anında koku emici, uzun süreli etki
            </p>
          </div>

          <div className="text-center p-8 bg-gradient-to-br from-teal-50 to-white rounded-2xl border border-teal-100">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Güvenilir</h3>
            <p className="text-gray-600 text-sm">
              1000+ mutlu müşteri ve olumlu geri bildirim
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Misyonumuz</h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
            Evcil hayvan sahiplerine, doğal ve güvenli ürünlerle yaşam kalitelerini artırma imkanı sunmak.
            Hem hayvanların hem de insanların sağlığını koruyarak, temiz ve ferah evler yaratmak.
          </p>
          <div className="inline-block bg-teal-500/20 px-6 py-3 rounded-full">
            <p className="text-teal-300 font-semibold">
              "Kedin mutlu, evin taze"
            </p>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Neden Bizi Tercih Etmelisiniz?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-4xl font-bold text-teal-600 mb-2">%100</div>
              <h3 className="font-semibold text-gray-900 mb-2">Doğal İçerik</h3>
              <p className="text-gray-600 text-sm">
                Hiçbir kimyasal madde içermeyen tamamen doğal formül
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-4xl font-bold text-teal-600 mb-2">1000+</div>
              <h3 className="font-semibold text-gray-900 mb-2">Mutlu Müşteri</h3>
              <p className="text-gray-600 text-sm">
                Türkiye genelinde binlerce memnun müşteri
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-4xl font-bold text-teal-600 mb-2">7/24</div>
              <h3 className="font-semibold text-gray-900 mb-2">Destek</h3>
              <p className="text-gray-600 text-sm">
                Her zaman yanınızdayız, sorularınızı yanıtlıyoruz
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
