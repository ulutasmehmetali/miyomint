import { Product, FAQ } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: '1 Paket',
    weight: '300 gr',
    price: 199,
    originalPrice: 299,
    savings: '🔥 %33 İndirim',
    image: 'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg?auto=compress&cs=tinysrgb&w=400',
    quantity: 1
  },
  {
    id: '2',
    name: '2 Paket',
    weight: '600 gr',
    price: 349,
    originalPrice: 598,
    savings: '🎉 En Popüler - %42 İndirim',
    image: 'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg?auto=compress&cs=tinysrgb&w=400',
    quantity: 2
  },
  {
    id: '3',
    name: '3 Paket',
    weight: '900 gr',
    price: 449,
    originalPrice: 897,
    savings: '⚡ En Avantajlı - %50 İndirim',
    image: 'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg?auto=compress&cs=tinysrgb&w=400',
    quantity: 3
  }
];

export const faqs: FAQ[] = [
  {
    question: 'MiyoMint ne kadar süre etkili?',
    answer: '1 paket (300 gr) ortalama 1 ay kullanım sağlar. Kullanım sıklığı kedi sayınıza ve kum kabının boyutuna göre değişiklik gösterebilir.'
  },
  {
    question: 'Kedime zarar verir mi?',
    answer: 'Hayır, kesinlikle zararsızdır. %100 doğal aktif karbonden üretilmiştir. Kimyasal, parfüm veya zararlı madde içermez. Kediniz için tamamen güvenlidir.'
  },
  {
    question: 'Nasıl kullanılır?',
    answer: 'Kedi kumunuzun üzerine ince bir tabaka halinde serpin. Her kum temizliğinde tekrar uygulayın. Anında koku emici etkisini göreceksiniz.'
  },
  {
    question: 'Toz yapar mı?',
    answer: 'Hayır, MiyoMint toz bırakmaz. Özel formülasyonu sayesinde havada uçuşmaz ve temiz kalır.'
  },
  {
    question: 'Kokusu var mı?',
    answer: 'Hayır, MiyoMint tamamen kokusuzdur. Yapay parfüm içermez. Sadece kötü kokuları emer, yeni bir koku katmaz.'
  },
  {
    question: 'Kargo ücreti var mı?',
    answer: 'Türkiye geneline ücretsiz kargo ile gönderim yapıyoruz. Siparişiniz 2-3 iş günü içinde adresinize teslim edilir.'
  }
];

export const benefits = [
  {
    icon: '🌿',
    title: '%100 Doğal Aktif Karbon',
    description: 'Kimyasal içermeyen, tamamen doğal formül'
  },
  {
    icon: '🐱',
    title: 'Kedi Sağlığına Zararsız',
    description: 'Kediniz için güvenli, veteriner onaylı'
  },
  {
    icon: '🚫',
    title: 'Parfüm İçermez',
    description: 'Yapay koku yerine doğal çözüm'
  },
  {
    icon: '⚡',
    title: 'Anında Etki',
    description: 'Kötü kokuları saniyeler içinde emer'
  },
  {
    icon: '📅',
    title: '1 Ay Kullanım',
    description: 'Bir paket uzun süre yeterli olur'
  },
  {
    icon: '✨',
    title: 'Toz Bırakmaz',
    description: 'Temiz ve pratik kullanım'
  }
];
