import { Mail, MessageCircle, Instagram, Facebook } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 mt-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 via-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden transform hover:rotate-6 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
                <svg className="w-7 h-7 text-white relative z-10" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L4 7v10l8 4 8-4V7l-8-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.3"/>
                  <circle cx="12" cy="12" r="2" fill="white"/>
                  <path d="M12 9v6M9 12h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">MiyoMint</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md leading-relaxed">
              Doğal aktif karbonun gücüyle evin her zaman ferah. %100 aktif karbon içerikli, kediler için güvenli koku giderici.
            </p>
            <div className="flex space-x-4">
              <a href="mailto:info@miyomint.com.tr" className="text-gray-400 hover:text-teal-400 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1">
                <Mail className="w-5 h-5" />
              </a>
              <a href="https://wa.me/905555555555" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-400 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('home')} className="text-gray-400 hover:text-teal-400 transition-colors hover:translate-x-1 transform duration-200 inline-block">
                  Ana Sayfa
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="text-gray-400 hover:text-teal-400 transition-colors hover:translate-x-1 transform duration-200 inline-block">
                  Ürünler
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="text-gray-400 hover:text-teal-400 transition-colors hover:translate-x-1 transform duration-200 inline-block">
                  Sık Sorulan Sorular
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="text-gray-400 hover:text-teal-400 transition-colors hover:translate-x-1 transform duration-200 inline-block">
                  Biz Kimiz
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">İletişim</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-teal-400 transition-colors">info@miyomint.com.tr</li>
              <li className="hover:text-teal-400 transition-colors">+90 555 555 55 55</li>
              <li className="pt-2">
                <button onClick={() => onNavigate('contact')} className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
                  İletişim Formu
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2024 MiyoMint. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
