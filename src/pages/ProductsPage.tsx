import { Product } from '../types';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import { Package, Truck, Shield } from 'lucide-react';

interface ProductsPageProps {
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export default function ProductsPage({ onAddToCart, onBuyNow }: ProductsPageProps) {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Ürünlerimiz
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            %100 doğal aktif karbonden üretilen MiyoMint, kedi kumundaki kötü kokuları saniyeler içinde emer.
            Toz bırakmaz, renksizdir, tamamen kokusuzdur. Kimyasal içermediği için kedin ve senin sağlığın için güvenlidir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="bg-teal-50 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-teal-100">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">%100 Doğal</h3>
            <p className="text-sm text-gray-600">Kimyasal ve parfüm içermez</p>
          </div>

          <div className="bg-teal-50 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-teal-100">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Ücretsiz Kargo</h3>
            <p className="text-sm text-gray-600">Türkiye geneline ücretsiz gönderim</p>
          </div>

          <div className="bg-teal-50 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-teal-100">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Güvenli Ürün</h3>
            <p className="text-sm text-gray-600">Kedi sağlığına zararsız</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
            />
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Ürün Özellikleri</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Doğal İçerik</h3>
                  <p className="text-gray-600 text-sm">%100 aktif karbon, hiçbir katkı maddesi yok</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Koku Emici</h3>
                  <p className="text-gray-600 text-sm">Kötü kokuları anında emer ve nötralize eder</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Toz Yapmaz</h3>
                  <p className="text-gray-600 text-sm">Özel formülü sayesinde toz bırakmaz</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Uzun Ömürlü</h3>
                  <p className="text-gray-600 text-sm">Bir paket ortalama 1 ay yeterli olur</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Kolay Kullanım</h3>
                  <p className="text-gray-600 text-sm">Kedi kumunun üzerine serpmek yeterli</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Veteriner Onaylı</h3>
                  <p className="text-gray-600 text-sm">Kedi sağlığı için tamamen güvenli</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
