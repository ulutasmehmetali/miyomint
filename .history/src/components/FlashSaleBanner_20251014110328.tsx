import { useEffect, useState } from "react";
import { Clock, Zap } from "lucide-react";

export default function FlashSaleBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [visible, setVisible] = useState(true);

  // sadece ana sayfada göster
  useEffect(() => {
    if (window.location.pathname !== "/") setVisible(false);
  }, []);

  // geri sayım
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return { hours, minutes, seconds };
    };

    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    setTimeLeft(calculateTimeLeft());
    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="w-full bg-red-600 text-white py-2 overflow-hidden relative z-50 sticky top-0">
      <div className="whitespace-nowrap animate-marquee text-center font-semibold tracking-wide text-sm sm:text-base flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 animate-pulse" />
          <span>SÜPER İNDİRİM KAMPANYASI!</span>
        </div>

        <div className="flex items-center gap-2 bg-white/20 px-4 py-1 rounded-full">
          <Clock className="w-4 h-4" />
          <span>
            Bitimine:{" "}
            {String(timeLeft.hours).padStart(2, "0")}:
            {String(timeLeft.minutes).padStart(2, "0")}:
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
        </div>

        <div className="bg-white text-red-600 px-3 py-1 rounded-full font-bold">
          %33’e Varan İndirim!
        </div>

        <span className="ml-6">🚨 SINIRLI SÜRELİ FIRSAT — %50 İNDİRİM 🚨</span>
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
          animation: marquee 18s linear infinite;
        }
      `}</style>
    </div>
  );
}
