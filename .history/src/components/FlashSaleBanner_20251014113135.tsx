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
    <div className="w-full bg-gradient-to-r from-red-600 via-orange-500 to-pink-500 text-white py-2 overflow-hidden relative shadow-md">
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-shine" />
      <div className="animate-marquee whitespace-nowrap flex items-center justify-start gap-12 text-sm font-semibold px-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span>SÜPER İNDİRİM KAMPANYASI!</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Bitimine: {timeLeft}</span>
        </div>
        <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
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
          animation: marquee 18s linear infinite;
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-shine {
          animation: shine 5s linear infinite;
        }
      `}</style>
    </div>
  );
}
