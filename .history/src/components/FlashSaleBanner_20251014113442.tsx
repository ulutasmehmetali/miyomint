import { Zap, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function FlashSaleBanner() {
  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const target = new Date();
    target.setHours(23, 59, 59, 999);
    const diff = target.getTime() - now;

    if (diff <= 0) return "00:00:00";
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor((diff / 1000) % 60)
      .toString()
      .padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-red-600 text-white py-3 overflow-hidden relative shadow-md font-semibold tracking-wide">
      <div className="animate-marquee whitespace-nowrap flex items-center justify-start gap-12 text-lg px-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          <span>SÜPER İNDİRİM KAMPANYASI!</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span>Bitimine: {timeLeft}</span>
        </div>
        <div className="bg-white text-red-700 px-4 py-1 rounded-full font-bold text-base">
          %33’e Varan İndirim!
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 10s linear infinite; /* daha hızlı akış */
        }
      `}</style>
    </div>
  );
}
