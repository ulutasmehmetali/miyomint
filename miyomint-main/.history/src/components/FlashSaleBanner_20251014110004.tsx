import { useEffect, useState } from "react";

export default function FlashSaleBanner() {
  const [visible, setVisible] = useState(true);

  // Banner sadece ana sayfada gösterilsin
  useEffect(() => {
    if (window.location.pathname !== "/") setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="w-full bg-red-600 text-white py-2 overflow-hidden relative z-50">
      <div className="whitespace-nowrap animate-marquee text-center font-semibold tracking-wide text-sm sm:text-base">
        🚨 SINIRLI SÜRELİ FIRSAT — %50 İNDİRİM 🚨 SINIRLI SÜRELİ FIRSAT — %50
        İNDİRİM 🚨 SINIRLI SÜRELİ FIRSAT — %50 İNDİRİM 🚨 SINIRLI SÜRELİ FIRSAT
        — %50 İNDİRİM 🚨
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 15s linear infinite;
        }
      `}</style>
    </div>
  );
}
