import { Leaf, Shield, Sparkles, Clock } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";
import { Product } from "../types";

interface ProductsPageProps {
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

const sellingPoints = [
  {
    icon: <Sparkles className="w-5 h-5 text-teal-600" />,
    title: "Premium karışım",
    description: "Aktif karbon ve doğal mineraller ile maksimum koku kontrolü.",
  },
  {
    icon: <Leaf className="w-5 h-5 text-teal-600" />,
    title: "Doğal içerik",
    description: "%100 doğal formül, kimyasal katkı maddesi içermez.",
  },
  {
    icon: <Shield className="w-5 h-5 text-teal-600" />,
    title: "Veteriner onaylı",
    description: "Kediler için güvenli, hassas patiler düşünülerek geliştirildi.",
  },
  {
    icon: <Clock className="w-5 h-5 text-teal-600" />,
    title: "Tek seferde etki",
    description: "Kötü kokuları saniyeler içinde hapseder, uzun süre taze kalır.",
  },
];

export default function ProductsPage({
  onAddToCart,
  onBuyNow,
}: ProductsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <header className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            En çok tercih edilen doğal koku giderici
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Eviniz için en uygun MiyoMint paketini seçin
          </h1>
          <p className="max-w-2xl mx-auto text-gray-600 text-base sm:text-lg">
            Her paket, kedinizin ihtiyaçlarına göre optimize edildi. Sepetinizi
            oluşturun, rahat bir nefes alın.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sellingPoints.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 flex flex-col gap-3 hover:shadow-lg transition-shadow"
            >
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Paket seçenekleri
            </h2>
            <p className="text-gray-600">
              Kendiniz için doğru paketi seçin, her pakette özel indirimler var.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
